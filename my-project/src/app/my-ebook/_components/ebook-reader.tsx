"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChapterNav } from "./chapter-nav";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";

interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface EbookReaderProps {
  title: string;
  chapters: Chapter[];
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="inline-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function renderContent(content: string) {
  const blocks = content.split("\n\n");
  let isFirstParagraph = true;

  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // ## Heading
    if (trimmed.startsWith("## ")) {
      isFirstParagraph = true;
      return (
        <h3 key={i} className="section-heading">
          {renderInline(trimmed.replace(/^##\s+/, ""))}
        </h3>
      );
    }

    // ### Sub-heading
    if (trimmed.startsWith("### ")) {
      return (
        <h4 key={i} className="sub-heading">
          {renderInline(trimmed.replace(/^###\s+/, ""))}
        </h4>
      );
    }

    // Regular paragraph
    const className = isFirstParagraph ? "first-paragraph" : undefined;
    isFirstParagraph = false;
    return (
      <p key={i} className={className}>
        {renderInline(trimmed)}
      </p>
    );
  });
}

export function EbookReader({ title, chapters }: EbookReaderProps) {
  const [activeChapter, setActiveChapter] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const current = chapters.find((c) => c.order === activeChapter);
  const hasNext = activeChapter < chapters.length;
  const hasPrev = activeChapter > 1;

  const handleKeyNav = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && hasNext) setActiveChapter((c) => c + 1);
      if (e.key === "ArrowLeft" && hasPrev) setActiveChapter((c) => c - 1);
    },
    [hasNext, hasPrev]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyNav);
    return () => window.removeEventListener("keydown", handleKeyNav);
  }, [handleKeyNav]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeChapter]);

  if (!current) return null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4 z-50 lg:hidden shadow-lg bg-background border"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-16 left-0 z-40 w-64 border-r bg-background transition-transform lg:relative lg:inset-auto lg:translate-x-0 lg:z-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-4 border-b">
          <h2 className="font-semibold text-sm line-clamp-2">{title}</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {chapters.length} chapters
          </p>
        </div>
        <ChapterNav
          chapters={chapters}
          activeChapter={activeChapter}
          onSelect={(order) => {
            setActiveChapter(order);
            setSidebarOpen(false);
          }}
        />
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 px-4 py-8 lg:px-8">
        <article className="ebook-content mx-auto">
          <h2 className="ebook-chapter-title">{current.title}</h2>
          {renderContent(current.content)}
        </article>

        {/* Chapter navigation */}
        <div className="max-w-[720px] mx-auto flex items-center justify-between mt-12 pt-6 border-t">
          <Button
            variant="ghost"
            onClick={() => setActiveChapter((c) => c - 1)}
            disabled={!hasPrev}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            {activeChapter} / {chapters.length}
          </span>
          <Button
            variant="ghost"
            onClick={() => setActiveChapter((c) => c + 1)}
            disabled={!hasNext}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}
