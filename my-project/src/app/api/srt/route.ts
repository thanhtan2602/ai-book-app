import { NextResponse } from "next/server";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

export async function GET() {
  const folderPath = process.env.SRT_FOLDER_PATH;

  if (!folderPath) {
    return NextResponse.json(
      { error: "SRT_FOLDER_PATH not configured" },
      { status: 500 }
    );
  }

  try {
    const files = await readdir(folderPath);
    const srtFiles = files.filter((f) => f.toLowerCase().endsWith(".srt"));

    const result = await Promise.all(
      srtFiles.map(async (filename) => {
        const fileStat = await stat(join(folderPath, filename));
        return {
          filename,
          sizeBytes: fileStat.size,
          modifiedAt: fileStat.mtime.toISOString(),
        };
      })
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to read SRT folder" },
      { status: 500 }
    );
  }
}
