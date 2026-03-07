import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: message }],
  });

  return NextResponse.json({
    reply: completion.choices[0].message.content,
  });
}
