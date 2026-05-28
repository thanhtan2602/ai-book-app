import "dotenv/config";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";

// --- Prisma client (standalone, no path alias) ---
async function createPrisma() {
  const { PrismaClient } = await import("../src/generated/prisma/client.js");
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter }) as any;
}

// --- SRT/WEBVTT parser ---
function parseSrt(content: string): string {
  const blocks = content.trim().split(/\n\s*\n/);
  const textLines: string[] = [];
  for (const block of blocks) {
    const lines = block.trim().split("\n");
    // Find the timestamp line (contains "-->") — works for both SRT and WEBVTT
    const tsIdx = lines.findIndex((l) => l.includes("-->"));
    if (tsIdx === -1) continue; // skip header blocks (e.g. "WEBVTT")
    const text = lines.slice(tsIdx + 1).join(" ").trim();
    if (text) textLines.push(text);
  }
  return textLines.join(" ");
}

// --- Helpers ---
function cleanChapterName(folderName: string): string {
  return folderName.replace(/^\d+\s*[-–—]\s*/, "").trim();
}

async function findSrtFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findSrtFiles(fullPath)));
    } else if (entry.name.endsWith(".srt")) {
      files.push(fullPath);
    }
  }
  return files.sort();
}

// --- Commands ---
const command = process.argv[2];

async function parse() {
  const folderPath = process.argv[3];
  if (!folderPath) {
    console.error("Usage: npx tsx scripts/create-book.ts parse <folder-path>");
    process.exit(1);
  }

  const resolvedPath = path.resolve(folderPath);
  const bookTitle = path.basename(resolvedPath).replace(/\./g, " ");

  const entries = await fs.readdir(resolvedPath, { withFileTypes: true });
  const subfolders = entries.filter((e) => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name));
  const rootSrtFiles = entries.filter((e) => !e.isDirectory() && e.name.endsWith(".srt")).map((e) => path.join(resolvedPath, e.name)).sort();

  interface Chapter {
    title: string;
    order: number;
    files: string[];
    text: string;
    wordCount: number;
  }

  const chapters: Chapter[] = [];
  let order = 1;

  if (rootSrtFiles.length > 0) {
    let text = "";
    for (const f of rootSrtFiles) {
      text += parseSrt(await fs.readFile(f, "utf-8")) + " ";
    }
    text = text.trim();
    chapters.push({ title: "Introduction", order: 0, files: rootSrtFiles.map((f) => path.basename(f)), text, wordCount: text.split(/\s+/).length });
  }

  for (const folder of subfolders) {
    const srtFiles = await findSrtFiles(path.join(resolvedPath, folder.name));
    if (srtFiles.length > 0) {
      let text = "";
      for (const f of srtFiles) {
        text += parseSrt(await fs.readFile(f, "utf-8")) + " ";
      }
      text = text.trim();
      chapters.push({
        title: cleanChapterName(folder.name),
        order: order++,
        files: srtFiles.map((f) => path.basename(f)),
        text,
        wordCount: text.split(/\s+/).length,
      });
    }
  }

  // Output as JSON for Claude to consume
  const result = { bookTitle, sourcePath: resolvedPath, chapters };
  console.log(JSON.stringify(result, null, 2));
}

async function saveBook() {
  // Reads JSON from stdin: { bookTitle, sourcePath, chapters: [{ title, order, content }] }
  const input = await fs.readFile(process.argv[3], "utf-8");
  const data = JSON.parse(input);

  const prisma = await createPrisma();

  try {
    const ebook = await prisma.ebook.create({
      data: {
        title: data.bookTitle,
        description: data.description || `Ebook with ${data.chapters.length} chapters`,
        sourceFile: data.sourcePath || "",
        status: "COMPLETED",
      },
    });

    for (const ch of data.chapters) {
      await prisma.chapter.create({
        data: {
          ebookId: ebook.id,
          title: ch.title,
          content: ch.content,
          order: ch.order,
        },
      });
      console.log(`Saved chapter ${ch.order}: "${ch.title}"`);
    }

    console.log(`\nDone! Ebook ID: ${ebook.id}`);
    console.log(`View at: /my-ebook/${ebook.id}`);
  } finally {
    await prisma.$disconnect();
  }
}

if (command === "parse") {
  parse();
} else if (command === "save") {
  saveBook();
} else {
  console.error("Usage:");
  console.error("  npx tsx scripts/create-book.ts parse <folder-path>   # Parse SRT files to JSON");
  console.error("  npx tsx scripts/create-book.ts save <json-file>      # Save translated book to DB");
  process.exit(1);
}
