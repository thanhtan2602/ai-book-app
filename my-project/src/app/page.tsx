import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const stats = [
  { title: "Total Users", value: "1,234", change: "+12%", icon: "👤" },
  { title: "Revenue", value: "$45,231", change: "+8.2%", icon: "💰" },
  { title: "Active Sessions", value: "573", change: "+3.1%", icon: "📊" },
  { title: "API Calls", value: "12,543", change: "+18%", icon: "🔗" },
];

const recentActivity = [
  { user: "Nguyen Van A", action: "Created a new project", time: "2 min ago", status: "success" },
  { user: "Tran Thi B", action: "Uploaded audio file", time: "5 min ago", status: "success" },
  { user: "Le Van C", action: "Generated transcript", time: "12 min ago", status: "pending" },
  { user: "Pham Thi D", action: "Updated profile", time: "1 hour ago", status: "success" },
  { user: "Hoang Van E", action: "API key regenerated", time: "2 hours ago", status: "warning" },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <main className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <span className="text-2xl">{stat.icon}</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-600">{stat.change} from last month</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {item.user.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{item.user}</p>
                          <p className="text-xs text-muted-foreground">{item.action}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            item.status === "success"
                              ? "default"
                              : item.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {item.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                      </div>
                    </div>
                    {i < recentActivity.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/my-ebook">
                <Button className="w-full justify-start" variant="outline">
                  📚 My Ebooks
                </Button>
              </Link>
              <Button className="w-full justify-start" variant="outline">
                🎤 Transcribe Audio
              </Button>
              <Button className="w-full justify-start" variant="outline">
                💬 Chat with AI
              </Button>
              <Button className="w-full justify-start" variant="outline">
                👤 Manage Users
              </Button>
              <Button className="w-full justify-start" variant="outline">
                📈 View Analytics
              </Button>
              <Button className="w-full justify-start" variant="outline">
                ⚙️ API Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
