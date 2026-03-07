"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookOpen, Plus, Trash2, Loader2 } from "lucide-react";

interface SrtFile {
  filename: string;
  sizeBytes: number;
  modifiedAt: string;
}

interface Ebook {
  id: string;
  title: string;
  description: string | null;
  sourceFile: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: string;
  _count: { chapters: number };
}

export function EbookList() {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [srtFiles, setSrtFiles] = useState<SrtFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchEbooks = useCallback(async () => {
    const res = await fetch("/api/ebooks");
    const data = await res.json();
    setEbooks(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEbooks();
  }, [fetchEbooks]);

  const fetchSrtFiles = async () => {
    const res = await fetch("/api/srt");
    if (res.ok) {
      setSrtFiles(await res.json());
    }
  };

  const handleProcess = async (filename: string) => {
    setProcessing(filename);
    setDialogOpen(false);

    await fetch("/api/ebooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename }),
    });

    setProcessing(null);
    fetchEbooks();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/ebooks/${id}`, { method: "DELETE" });
    fetchEbooks();
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "default" as const;
      case "PROCESSING":
        return "secondary" as const;
      case "FAILED":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Ebooks</h2>
          <p className="text-muted-foreground">
            {ebooks.length} ebook{ebooks.length !== 1 && "s"}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={<Button disabled={!!processing} />}
            onClick={fetchSrtFiles}
          >
            {processing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {processing ? "Processing..." : "Process New SRT"}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select SRT File</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {srtFiles.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No .srt files found. Check your SRT_FOLDER_PATH.
                </p>
              ) : (
                srtFiles.map((file) => (
                  <button
                    key={file.filename}
                    onClick={() => handleProcess(file.filename)}
                    className="w-full flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-medium">{file.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.sizeBytes / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {ebooks.length === 0 && !processing ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No ebooks yet. Process an SRT file to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {processing && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </CardTitle>
                <CardDescription>{processing}</CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          )}

          {ebooks.map((ebook) => (
            <Card key={ebook.id} className="group relative">
              <Link href={`/my-ebook/${ebook.id}`} className="absolute inset-0 z-10" />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base line-clamp-2">
                    {ebook.title}
                  </CardTitle>
                  <Badge variant={statusColor(ebook.status)}>
                    {ebook.status.toLowerCase()}
                  </Badge>
                </div>
                {ebook.description && (
                  <CardDescription className="line-clamp-2">
                    {ebook.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{ebook._count.chapters} chapters</span>
                  <span>
                    {new Date(ebook.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(ebook.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
