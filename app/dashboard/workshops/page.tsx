"use client"

import type React from "react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, Users, CheckCircle, Clock, ArrowRight, Plus } from "@/components/icons"
import Link from "next/link"
import { mockWorkshops } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function WorkshopsPage() {
  const { user } = useAuth()
  const [workshops, setWorkshops] = useState(mockWorkshops)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [workshopTheme, setWorkshopTheme] = useState("")

  const upcomingWorkshops = workshops.filter((w) => w.status === "scheduled")
  const completedWorkshops = workshops.filter((w) => w.status === "completed")

  const handleCreateWorkshop = () => {
    if (!workshopTheme.trim()) return

    const newId = `ws-${Date.now()}`

    const workshop = {
      id: newId,
      theme: workshopTheme,
      scheduledDate: new Date().toISOString(),
      status: "scheduled" as const,
      totalMembers: 0,
      preWorkshopCompleted: 0,
      questions: [],
    }

    setWorkshops([workshop, ...workshops])
    setIsCreateDialogOpen(false)
    setWorkshopTheme("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleCreateWorkshop()
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">ワークショップ</h1>
            <p className="text-foreground/70">チームの課題を可視化し、対話を促進します</p>
          </div>
          {user?.role === "manager" && (
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
                    disabled={!workshopTheme.trim()}
                  >
                    QRコードを生成して開始
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Upcoming Workshops */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">予定されているワークショップ</h2>
          {upcomingWorkshops.length === 0 ? (
            <Card className="glass rounded-2xl p-8 text-center">
              <Calendar className="h-12 w-12 text-foreground/60 mx-auto mb-4" />
              <p className="text-foreground/70">予定されているワークショップはありません</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingWorkshops.map((workshop) => (
                <Card key={workshop.id} className="glass rounded-2xl p-6 hover:scale-[1.01] transition-transform">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/20 p-2 rounded-lg">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">
                            {new Date(workshop.scheduledDate).toLocaleDateString("ja-JP", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </h3>
                          <p className="text-sm text-foreground/70">
                            {new Date(workshop.scheduledDate).toLocaleTimeString("ja-JP", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-foreground/60" />
                          <span className="text-foreground/80">
                            {workshop.preWorkshopCompleted} / {workshop.totalMembers} 名が事前アンケート完了
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-foreground/60" />
                          <span className="text-primary font-medium">準備中</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link href={`/dashboard/workshops/${workshop.id}/pre-survey`}>
                          <Button variant="outline" size="sm" className="rounded-xl bg-transparent text-foreground">
                            事前アンケート
                          </Button>
                        </Link>
                        {user?.role === "manager" && (
                          <>
                            <Link href={`/dashboard/workshops/${workshop.id}/facilitate`}>
                              <Button className="gradient-teal-lime text-background rounded-xl">ワークを開始</Button>
                            </Link>
                            <Link href={`/dashboard/workshops/${workshop.id}/captain-log`}>
                              <Button variant="outline" size="sm" className="rounded-xl bg-transparent text-foreground">
                                キャプテンズログ
                              </Button>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>

                    <Link href={`/dashboard/workshops/${workshop.id}`}>
                      <Button size="sm" className="gradient-teal-lime text-background rounded-xl">
                        詳細
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
        {completedWorkshops.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">完了したワークショップ</h2>
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
                            {new Date(workshop.scheduledDate).toLocaleDateString("ja-JP", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </h3>
                          <p className="text-sm text-accent font-medium">完了</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link href={`/dashboard/workshops/${workshop.id}/report`}>
                          <Button variant="outline" size="sm" className="rounded-xl bg-transparent text-foreground">
                            レポートを見る
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
