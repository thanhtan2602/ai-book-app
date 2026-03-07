import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";
import { parseSrt, chunkText } from "@/lib/srt-parser";

export async function GET() {
  const ebooks = await prisma.ebook.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { chapters: true } } },
  });

  return NextResponse.json(ebooks);
}

export async function POST(req: NextRequest) {
  const { filename } = await req.json();
  const folderPath = process.env.SRT_FOLDER_PATH;

  if (!folderPath || !filename) {
    return NextResponse.json(
      { error: "Missing folder path or filename" },
      { status: 400 }
    );
  }

  // Create ebook record with PROCESSING status
  const ebook = await prisma.ebook.create({
    data: { title: filename, sourceFile: filename },
  });

  try {
    // 1. Read and parse SRT
    const filePath = join(folderPath, filename);
    const content = await readFile(filePath, "utf-8");
    const plainText = parseSrt(content);

    // 2. Translate chunks to Vietnamese
    const chunks = chunkText(plainText, 3000);
    const translatedChunks: string[] = [];

    for (const chunk of chunks) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a professional translator. Translate the following English text to Vietnamese. Maintain the natural flow and meaning. Output only the translated text.",
          },
          { role: "user", content: chunk },
        ],
      });
      translatedChunks.push(response.choices[0].message.content ?? "");
    }

    const translatedText = translatedChunks.join("\n\n");

    // 3. Structure into ebook via GPT-4o
    const structureResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an ebook editor. Given translated Vietnamese text from subtitles, restructure it into a well-organized ebook. Return a JSON object with this exact structure:
{
  "title": "Book title in Vietnamese",
  "description": "Brief description in Vietnamese (1-2 sentences)",
  "chapters": [
    { "title": "Chapter title", "content": "Full chapter content with proper paragraphs separated by \\n\\n", "order": 1 }
  ]
}
Organize the content into logical chapters (at least 3 if the text is long enough). Fix grammar, add paragraph breaks, remove subtitle artifacts. Make it read like a proper book.`,
        },
        { role: "user", content: translatedText },
      ],
      response_format: { type: "json_object" },
    });

    const ebookData = JSON.parse(
      structureResponse.choices[0].message.content ?? "{}"
    );

    // 4. Save chapters and update ebook
    await prisma.$transaction(async (tx) => {
      if (ebookData.chapters?.length) {
        await tx.chapter.createMany({
          data: ebookData.chapters.map(
            (ch: { title: string; content: string; order: number }) => ({
              ebookId: ebook.id,
              title: ch.title,
              content: ch.content,
              order: ch.order,
            })
          ),
        });
      }

      await tx.ebook.update({
        where: { id: ebook.id },
        data: {
          title: ebookData.title || filename,
          description: ebookData.description || null,
          status: "COMPLETED",
        },
      });
    });

    const result = await prisma.ebook.findUnique({
      where: { id: ebook.id },
      include: { chapters: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json(result);
  } catch (error) {
    await prisma.ebook.update({
      where: { id: ebook.id },
      data: { status: "FAILED" },
    });

    return NextResponse.json(
      { error: "Processing failed", details: String(error) },
      { status: 500 }
    );
  }
}
