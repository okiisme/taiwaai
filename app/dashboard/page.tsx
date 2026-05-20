"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useUser } from "@clerk/nextjs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ArrowRight, QrCode, Calendar, Users, TrendingUp } from "@/components/icons"
import Link from "next/link"
import { useState, useEffect } from "react"
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
}

export default function DashboardPage() {
  const { user } = useUser()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    fetch("/api/workshops")
      .then((r) => r.json())
      .then((data) => setWorkshops(data.workshops || []))
      .catch(() => {})
  }, [])

  const handleCreate = async () => {
    if (!title.trim() || isCreating) return
    setIsCreating(true)
    try {
      const res = await fetch("/api/workshops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: title }),
      })
      if (res.ok) {
        const newWorkshop = await res.json()
        setIsCreateOpen(false)
        setTitle("")
        window.location.href = `/dashboard/workshops/${newWorkshop.id}/facilitate`
      }
    } finally {
      setIsCreating(false)
    }
  }

  const recentWorkshops = workshops.slice(0, 5)

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-6 py-12">
          <div className="space-y-3">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-500 to-lime-500 bg-clip-text text-transparent">
              TAIWA AI
            </h1>
            <p className="text-2xl text-gray-600">As is / To beギャップ対話ワークショップ</p>
            <p className="text-gray-500">
              こんにちは、{user?.fullName || user?.emailAddresses[0]?.emailAddress || ""}さん
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="bg-gradient-to-r from-teal-400 to-lime-400 hover:from-teal-500 hover:to-lime-500 text-white font-semibold rounded-2xl px-12 py-8 text-xl group shadow-lg"
              >
                <Plus className="mr-3 h-7 w-7" />
                ワークショップを開始
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>新しいワークショップ</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">テーマ</Label>
                  <Input
                    id="title"
                    placeholder="例：チームの心理的安全性"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    autoFocus
                  />
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={!title.trim() || isCreating}
                  className="w-full bg-gradient-to-r from-teal-400 to-lime-400 text-white font-semibold rounded-xl"
                >
                  <QrCode className="mr-2 h-5 w-5" />
                  {isCreating ? "作成中..." : "QRコードを生成して開始"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="rounded-3xl p-8 border-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">過去のワークショップ</h2>
            <Link href="/dashboard/workshops">
              <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                すべて見る
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentWorkshops.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>まだワークショップがありません</p>
                <p className="text-sm mt-2">上のボタンから新しいワークショップを開始してください</p>
              </div>
            ) : (
              recentWorkshops.map((workshop) => (
                <div
                  key={workshop.id}
                  className="bg-gradient-to-r from-teal-50 to-lime-50 rounded-2xl p-5 border border-teal-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="bg-gradient-to-r from-teal-400 to-lime-400 p-3 rounded-xl">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg mb-1">{workshop.theme || "（テーマ未設定）"}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>
                            {new Date(workshop.created_at).toLocaleDateString("ja-JP", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {workshop.participant_count}名参加 / {workshop.response_count}件の回答
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" asChild className="rounded-xl">
                      <Link href={`/dashboard/workshops/${workshop.id}/facilitate`}>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        結果を見る
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
