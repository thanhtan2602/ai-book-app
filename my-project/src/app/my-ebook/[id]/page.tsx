import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
      <div className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-6 py-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center gap-1">
                  <Home className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/my-ebook">My eBook</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="truncate max-w-75">
                {ebook.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

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
