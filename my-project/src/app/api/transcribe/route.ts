import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("audio") as File;

  if (!file) {
    return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
  }

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
  });

  return NextResponse.json({ text: transcription.text });
}
