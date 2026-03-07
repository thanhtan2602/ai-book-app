import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";
import { EbookList } from "./_components/ebook-list";

export default function MyEbookPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">My Project</h1>
            <Badge variant="secondary">Ebooks</Badge>
          </div>
          <Avatar>
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="p-6">
        <EbookList />
      </main>
    </div>
  );
}
