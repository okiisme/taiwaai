"use client"

import type React from "react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Calendar, Users, MessageSquare, ThumbsUp, Lock, Send, QrCode } from "@/components/icons"
import { useState, useEffect } from "react"
import { mockQuestions, type Question } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"

export default function WorkshopDetailPage() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>(mockQuestions)
  const [newQuestion, setNewQuestion] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [showQR, setShowQR] = useState(false)
  const [workshopUrl, setWorkshopUrl] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWorkshopUrl(`${window.location.origin}/join/ws-1`)
    }
  }, [])

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.trim()) return

    const question: Question = {
      id: `q-${Date.now()}`,
      workshopId: "ws-1",
      userId: user?.id || "user-1",
      userName: isAnonymous ? "匿名" : user?.name || "ユーザー",
      question: newQuestion,
      isAnonymous,
      upvotes: 0,
      answered: false,
      createdAt: new Date().toISOString(),
    }

    setQuestions([question, ...questions])
    setNewQuestion("")
  }

  const handleUpvote = (questionId: string) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q)))
  }

  const sortedQuestions = [...questions].sort((a, b) => b.upvotes - a.upvotes)

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Workshop Header */}
        <div className="glass rounded-2xl p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-3 rounded-xl">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">ワークショップ</h1>
                <p className="text-muted-foreground">2025年1月20日 10:00</p>
              </div>
            </div>
            <Button
              onClick={() => setShowQR(!showQR)}
              className="gradient-teal-lime text-background font-semibold rounded-xl"
            >
              <QrCode className="mr-2 h-4 w-4" />
              QRコード
            </Button>
          </div>

          {showQR && (
            <Card className="glass-light rounded-2xl p-6 text-center space-y-4">
              <p className="text-sm font-medium">スマホで参加</p>
              <div className="bg-white p-4 rounded-xl inline-block">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(workshopUrl)}`}
                  alt="Workshop QR Code"
                  className="w-48 h-48"
                />
              </div>
              <p className="text-xs text-muted-foreground">{workshopUrl}</p>
            </Card>
          )}

          <div className="flex items-center gap-6 text-sm pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>12名参加予定</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span>{questions.length}件の質問</span>
            </div>
          </div>
        </div>

        {/* Question Submission */}
        <Card className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">質問を投稿</h2>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">匿名で投稿</span>
            </div>
          </div>

          <form onSubmit={handleSubmitQuestion} className="space-y-4">
            <Input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="チームについて聞きたいことを入力してください..."
              className="bg-background/50 rounded-xl"
            />
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded"
                />
                <span>匿名で投稿する</span>
              </label>
              <Button type="submit" className="gradient-teal-lime text-background font-semibold rounded-xl">
                <Send className="mr-2 h-4 w-4" />
                投稿
              </Button>
            </div>
          </form>
        </Card>

        {/* Questions List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">質問一覧</h2>
          {sortedQuestions.length === 0 ? (
            <Card className="glass rounded-2xl p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">まだ質問がありません</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedQuestions.map((question) => (
                <Card
                  key={question.id}
                  className={`glass rounded-2xl p-6 space-y-4 ${question.answered ? "border-accent/50" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">{question.userName}</span>
                        {question.isAnonymous && <Lock className="h-3 w-3 text-primary" />}
                        {question.answered && (
                          <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full font-medium">
                            回答済み
                          </span>
                        )}
                      </div>
                      <p className="text-lg">{question.question}</p>
                      {question.answer && (
                        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 mt-3">
                          <p className="text-sm font-medium text-accent mb-1">回答:</p>
                          <p className="text-sm">{question.answer}</p>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpvote(question.id)}
                      className="flex-col h-auto py-2 px-3 rounded-xl hover:bg-primary/10"
                    >
                      <ThumbsUp className="h-4 w-4 mb-1" />
                      <span className="text-sm font-semibold">{question.upvotes}</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
