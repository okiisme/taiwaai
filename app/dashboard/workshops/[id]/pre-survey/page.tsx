"use client"

import type React from "react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { CheckCircle, Lock } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function PreSurveyPage() {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)
  const [responses, setResponses] = useState({
    teamSatisfaction: 5,
    communicationQuality: 5,
    psychologicalSafety: 5,
    workload: 5,
    openFeedback: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Pre-workshop survey submitted:", responses)
    setSubmitted(true)
    setTimeout(() => {
      router.push("/dashboard/workshops")
    }, 2000)
  }

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-16 text-center">
          <div className="glass rounded-3xl p-12 space-y-6">
            <div className="bg-accent/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-accent" />
            </div>
            <h2 className="text-3xl font-bold">回答ありがとうございます</h2>
            <p className="text-muted-foreground leading-relaxed">
              あなたの回答は匿名で保存されました。ワークショップ当日にお会いしましょう。
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">事前アンケート</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4 text-primary" />
            <span>このアンケートは完全匿名です。あなたの回答は個人を特定できない形で集計されます。</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Team Satisfaction */}
          <Card className="glass rounded-2xl p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-lg font-semibold">チームへの満足度</Label>
              <p className="text-sm text-muted-foreground">現在のチームでの働きやすさを教えてください</p>
            </div>
            <div className="space-y-4">
              <Slider
                value={[responses.teamSatisfaction]}
                onValueChange={(value) => setResponses({ ...responses, teamSatisfaction: value[0] })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>低い (1)</span>
                <span className="text-primary font-semibold text-lg">{responses.teamSatisfaction}</span>
                <span>高い (10)</span>
              </div>
            </div>
          </Card>

          {/* Communication Quality */}
          <Card className="glass rounded-2xl p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-lg font-semibold">コミュニケーションの質</Label>
              <p className="text-sm text-muted-foreground">チーム内のコミュニケーションは円滑ですか？</p>
            </div>
            <div className="space-y-4">
              <Slider
                value={[responses.communicationQuality]}
                onValueChange={(value) => setResponses({ ...responses, communicationQuality: value[0] })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>低い (1)</span>
                <span className="text-primary font-semibold text-lg">{responses.communicationQuality}</span>
                <span>高い (10)</span>
              </div>
            </div>
          </Card>

          {/* Psychological Safety */}
          <Card className="glass rounded-2xl p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-lg font-semibold">心理的安全性</Label>
              <p className="text-sm text-muted-foreground">自分の意見を自由に言える環境ですか？</p>
            </div>
            <div className="space-y-4">
              <Slider
                value={[responses.psychologicalSafety]}
                onValueChange={(value) => setResponses({ ...responses, psychologicalSafety: value[0] })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>低い (1)</span>
                <span className="text-primary font-semibold text-lg">{responses.psychologicalSafety}</span>
                <span>高い (10)</span>
              </div>
            </div>
          </Card>

          {/* Workload */}
          <Card className="glass rounded-2xl p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-lg font-semibold">業務量</Label>
              <p className="text-sm text-muted-foreground">現在の業務量は適切ですか？</p>
            </div>
            <div className="space-y-4">
              <Slider
                value={[responses.workload]}
                onValueChange={(value) => setResponses({ ...responses, workload: value[0] })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>少ない (1)</span>
                <span className="text-primary font-semibold text-lg">{responses.workload}</span>
                <span>多い (10)</span>
              </div>
            </div>
          </Card>

          {/* Open Feedback */}
          <Card className="glass rounded-2xl p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-lg font-semibold">自由記述</Label>
              <p className="text-sm text-muted-foreground">
                チームについて、改善してほしいことや気になることがあれば教えてください
              </p>
            </div>
            <Textarea
              value={responses.openFeedback}
              onChange={(e) => setResponses({ ...responses, openFeedback: e.target.value })}
              placeholder="例: チーム内のコミュニケーションをもっと改善したいです..."
              className="min-h-32 bg-background/50 rounded-xl"
            />
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-xl">
              キャンセル
            </Button>
            <Button type="submit" className="gradient-teal-lime text-background font-semibold rounded-xl px-8">
              送信する
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
