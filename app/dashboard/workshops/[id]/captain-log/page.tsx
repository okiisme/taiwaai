"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Save } from "lucide-react"
import { useState } from "react"
import { mockCaptainLogs, type CaptainLog } from "@/lib/mock-data"

export default function CaptainLogPage() {
  const [logs, setLogs] = useState<CaptainLog[]>(mockCaptainLogs)
  const [newLog, setNewLog] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveLog = () => {
    if (!newLog.trim()) return

    setIsSaving(true)
    const log: CaptainLog = {
      id: `log-${Date.now()}`,
      workshopId: "ws-1",
      userId: "user-1",
      content: newLog,
      createdAt: new Date().toISOString(),
    }

    setTimeout(() => {
      setLogs([log, ...logs])
      setNewLog("")
      setIsSaving(false)
      console.log("[v0] Captain log saved:", log)
    }, 500)
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-xl">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">キャプテンズログ</h1>
              <p className="text-muted-foreground">ワークショップの気づきや学びを記録しましょう</p>
            </div>
          </div>
        </div>

        {/* New Log Entry */}
        <Card className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">新しいログを追加</h2>
          <Textarea
            value={newLog}
            onChange={(e) => setNewLog(e.target.value)}
            placeholder="ワークショップで気づいたこと、チームの課題、今後のアクションプランなどを記録してください..."
            className="min-h-40 bg-background/50 rounded-xl"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSaveLog}
              disabled={!newLog.trim() || isSaving}
              className="gradient-teal-lime text-background font-semibold rounded-xl"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "保存中..." : "保存する"}
            </Button>
          </div>
        </Card>

        {/* Previous Logs */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">過去のログ</h2>
          {logs.length === 0 ? (
            <Card className="glass rounded-2xl p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">まだログがありません</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <Card key={log.id} className="glass rounded-2xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {new Date(log.createdAt).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{log.content}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
