"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  Mic,
  MessageSquare,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "My eBook", href: "/my-ebook", icon: BookOpen },
  { label: "Transcribe", href: "#", icon: Mic },
  { label: "Chat AI", href: "#", icon: MessageSquare },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-primary text-primary-foreground shadow-md">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/15">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">AI Book</span>
          </Link>

          <Separator orientation="vertical" className="h-6 bg-primary-foreground/20" />

          <nav className="flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="#"
            className="flex h-8 w-8 items-center justify-center rounded-md text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Settings className="h-4 w-4" />
          </Link>
          <Avatar className="h-8 w-8 border border-primary-foreground/20">
            <AvatarFallback className="bg-primary-foreground/15 text-xs text-primary-foreground">AD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
