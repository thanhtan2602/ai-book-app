import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const ebook = await prisma.ebook.findUnique({
    where: { id },
    include: { chapters: { orderBy: { order: "asc" } } },
  });

  if (!ebook) {
    return NextResponse.json({ error: "Ebook not found" }, { status: 404 });
  }

  return NextResponse.json(ebook);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.ebook.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
