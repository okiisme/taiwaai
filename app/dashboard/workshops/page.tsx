"use client"

import type React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, Users, CheckCircle, Clock, ArrowRight, Plus } from "@/components/icons"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Workshop = {
  id: string
  theme: string | null
  status: string
  created_at: string
  participant_count: number
  response_count: number
  analysis: unknown
}

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [workshopTheme, setWorkshopTheme] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const fetchWorkshops = useCallback(async () => {
    try {
      const res = await fetch("/api/workshops")
      if (res.ok) {
        const data = await res.json()
        setWorkshops(data.workshops || [])
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWorkshops()
  }, [fetchWorkshops])

  const handleCreateWorkshop = async () => {
    if (!workshopTheme.trim() || isCreating) return
    setIsCreating(true)
    try {
      const res = await fetch("/api/workshops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: workshopTheme }),
      })
      if (res.ok) {
        const newWorkshop = await res.json()
        setIsCreateDialogOpen(false)
        setWorkshopTheme("")
        window.location.href = `/dashboard/workshops/${newWorkshop.id}/facilitate`
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleCreateWorkshop()
    }
  }

  const activeWorkshops = workshops.filter((w) => w.status !== "completed" && w.status !== "summary")
  const completedWorkshops = workshops.filter((w) => w.status === "completed" || w.status === "summary")

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      preparation: "準備中",
      "question-display": "質問表示中",
      collecting: "回答収集中",
      analysis: "分析中",
      summary: "完了",
      completed: "完了",
    }
    return map[status] || status
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">ワークショップ</h1>
            <p className="text-foreground/70">チームの課題を可視化し、対話を促進します</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-teal-lime text-background font-semibold rounded-xl">
                <Plus className="mr-2 h-4 w-4" />
                新規ワークショップ
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-foreground/20">
              <DialogHeader>
                <DialogTitle className="text-foreground">新しいワークショップ</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="theme" className="text-foreground">
                    テーマ
                  </Label>
                  <Input
                    id="theme"
                    type="text"
                    value={workshopTheme}
                    onChange={(e) => setWorkshopTheme(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="例：チームの心理的安全性"
                    className="bg-background/50 border-foreground/20 text-foreground"
                    autoFocus
                  />
                </div>
                <Button
                  onClick={handleCreateWorkshop}
                  className="w-full gradient-teal-lime text-background font-semibold rounded-xl"
                  disabled={!workshopTheme.trim() || isCreating}
                >
                  {isCreating ? "作成中..." : "QRコードを生成して開始"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-foreground/50">読み込み中...</div>
        ) : (
          <>
            {/* Active Workshops */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">進行中のワークショップ</h2>
              {activeWorkshops.length === 0 ? (
                <Card className="glass rounded-2xl p-8 text-center">
                  <Calendar className="h-12 w-12 text-foreground/60 mx-auto mb-4" />
                  <p className="text-foreground/70">進行中のワークショップはありません</p>
                  <p className="text-sm text-foreground/50 mt-2">「新規ワークショップ」から始めましょう</p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {activeWorkshops.map((workshop) => (
                    <Card key={workshop.id} className="glass rounded-2xl p-6 hover:scale-[1.01] transition-transform">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="bg-primary/20 p-2 rounded-lg">
                              <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-foreground">
                                {workshop.theme || "（テーマ未設定）"}
                              </h3>
                              <p className="text-sm text-foreground/70">{formatDate(workshop.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-foreground/60" />
                              <span className="text-foreground/80">{workshop.participant_count}名参加</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-foreground/60" />
                              <span className="text-primary font-medium">{statusLabel(workshop.status)}</span>
                            </div>
                          </div>
                          <Link href={`/dashboard/workshops/${workshop.id}/facilitate`}>
                            <Button className="gradient-teal-lime text-background rounded-xl">
                              ワークを再開
                            </Button>
                          </Link>
                        </div>
                        <Link href={`/dashboard/workshops/${workshop.id}/facilitate`}>
                          <Button size="sm" className="gradient-teal-lime text-background rounded-xl">
                            開く
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Workshops */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">過去のワークショップ</h2>
              {completedWorkshops.length === 0 ? (
                <Card className="glass rounded-2xl p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-foreground/40 mx-auto mb-4" />
                  <p className="text-foreground/50">完了したワークショップはまだありません</p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {completedWorkshops.map((workshop) => (
                    <Card key={workshop.id} className="glass rounded-2xl p-6 hover:scale-[1.01] transition-transform">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="bg-accent/20 p-2 rounded-lg">
                              <CheckCircle className="h-5 w-5 text-accent" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-foreground">
                                {workshop.theme || "（テーマ未設定）"}
                              </h3>
                              <p className="text-sm text-foreground/70">{formatDate(workshop.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-foreground/60" />
                              <span className="text-foreground/80">{workshop.participant_count}名参加 / {workshop.response_count}件の回答</span>
                            </div>
                          </div>
                          <Link href={`/dashboard/workshops/${workshop.id}/facilitate`}>
                            <Button variant="outline" size="sm" className="rounded-xl bg-transparent text-foreground">
                              結果を見る
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
