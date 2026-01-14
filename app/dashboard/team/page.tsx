"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Mail, Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  joinedDate: string
  recentScore: number
  trend: "up" | "down" | "stable"
  responseRate: number
}

const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "田中 太郎",
    email: "tanaka@example.com",
    role: "シニアエンジニア",
    joinedDate: "2024-01-15",
    recentScore: 8.5,
    trend: "up",
    responseRate: 100,
  },
  {
    id: "2",
    name: "佐藤 花子",
    email: "sato@example.com",
    role: "エンジニア",
    joinedDate: "2024-03-20",
    recentScore: 7.2,
    trend: "stable",
    responseRate: 95,
  },
  {
    id: "3",
    name: "鈴木 一郎",
    email: "suzuki@example.com",
    role: "エンジニア",
    joinedDate: "2024-02-10",
    recentScore: 6.8,
    trend: "down",
    responseRate: 90,
  },
  {
    id: "4",
    name: "高橋 美咲",
    email: "takahashi@example.com",
    role: "デザイナー",
    joinedDate: "2024-04-05",
    recentScore: 8.0,
    trend: "up",
    responseRate: 100,
  },
]

export default function TeamPage() {
  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-accent" />
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-destructive" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const getTrendColor = (trend: string) => {
    if (trend === "up") return "text-accent"
    if (trend === "down") return "text-destructive"
    return "text-muted-foreground"
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">チーム管理</h1>
            <p className="text-muted-foreground">メンバーの状態と活動を確認できます</p>
          </div>
          <Button className="gradient-teal-lime text-background font-semibold rounded-xl">
            <Users className="mr-2 h-4 w-4" />
            メンバーを追加
          </Button>
        </div>

        {/* Team Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-primary/20 p-2 rounded-lg">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm font-medium text-muted-foreground">総メンバー数</div>
            </div>
            <div className="text-3xl font-bold">12</div>
          </Card>

          <Card className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-accent/20 p-2 rounded-lg">
                <TrendingUp className="h-4 w-4 text-accent" />
              </div>
              <div className="text-sm font-medium text-muted-foreground">平均スコア</div>
            </div>
            <div className="text-3xl font-bold">7.6</div>
          </Card>

          <Card className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-primary/20 p-2 rounded-lg">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm font-medium text-muted-foreground">平均回答率</div>
            </div>
            <div className="text-3xl font-bold">96%</div>
          </Card>

          <Card className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-accent/20 p-2 rounded-lg">
                <Users className="h-4 w-4 text-accent" />
              </div>
              <div className="text-sm font-medium text-muted-foreground">アクティブ</div>
            </div>
            <div className="text-3xl font-bold">11</div>
          </Card>
        </div>

        {/* Team Members List */}
        <Card className="glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">チームメンバー</h2>
          <div className="space-y-4">
            {mockTeamMembers.map((member) => (
              <div key={member.id} className="glass-light rounded-xl p-6 hover:scale-[1.01] transition-transform">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-gradient-to-br from-primary to-accent w-12 h-12 rounded-full flex items-center justify-center text-background font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>{member.role}</span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">最新スコア</div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{member.recentScore}</span>
                        {getTrendIcon(member.trend)}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">回答率</div>
                      <div className="text-2xl font-bold">{member.responseRate}%</div>
                    </div>

                    <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                      詳細
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
