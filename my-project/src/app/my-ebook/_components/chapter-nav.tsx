"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Chapter {
  id: string;
  title: string;
  order: number;
}

interface ChapterNavProps {
  chapters: Chapter[];
  activeChapter: number;
  onSelect: (order: number) => void;
}

export function ChapterNav({
  chapters,
  activeChapter,
  onSelect,
}: ChapterNavProps) {
  return (
    <ScrollArea className="h-full">
      <nav className="space-y-1 p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Chapters
        </p>
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            onClick={() => onSelect(chapter.order)}
            className={cn(
              "w-full text-left rounded-md px-3 py-2 text-sm transition-colors",
              activeChapter === chapter.order
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent text-muted-foreground hover:text-foreground"
            )}
          >
            {chapter.title}
          </button>
        ))}
      </nav>
    </ScrollArea>
  );
}
