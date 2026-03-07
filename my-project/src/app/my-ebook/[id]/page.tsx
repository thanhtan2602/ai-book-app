import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EbookReader } from "../_components/ebook-reader";

export default async function EbookReaderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ebook = await prisma.ebook.findUnique({
    where: { id },
    include: { chapters: { orderBy: { order: "asc" } } },
  });

  if (!ebook || ebook.status !== "COMPLETED") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6 gap-4">
          <Link href="/my-ebook">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-sm font-semibold truncate">{ebook.title}</h1>
        </div>
      </header>

      <EbookReader
        title={ebook.title}
        chapters={ebook.chapters.map((ch) => ({
          id: ch.id,
          title: ch.title,
          content: ch.content,
          order: ch.order,
        }))}
      />
    </div>
  );
}
