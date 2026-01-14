"use client"

import type React from "react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { CheckCircle, Lock, Calendar, TrendingUp } from "lucide-react"
import { useState } from "react"
import { mockWeeklySurveys } from "@/lib/mock-data"

export default function SurveysPage() {
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [responses, setResponses] = useState({
    mood: 5,
    productivity: 5,
    teamCollaboration: 5,
    concerns: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Weekly survey submitted:", responses)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setShowForm(false)
      setResponses({
        mood: 5,
        productivity: 5,
        teamCollaboration: 5,
        concerns: "",
      })
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
              あなたの回答は匿名で保存されました。来週もよろしくお願いします。
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (showForm) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">週次パルスチェック</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4 text-primary" />
              <span>このアンケートは完全匿名です。あなたの回答は個人を特定できない形で集計されます。</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mood */}
            <Card className="glass rounded-2xl p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-lg font-semibold">今週の気分</Label>
                <p className="text-sm text-muted-foreground">今週の全体的な気分を教えてください</p>
              </div>
              <div className="space-y-4">
                <Slider
                  value={[responses.mood]}
                  onValueChange={(value) => setResponses({ ...responses, mood: value[0] })}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>悪い (1)</span>
                  <span className="text-primary font-semibold text-lg">{responses.mood}</span>
                  <span>良い (10)</span>
                </div>
              </div>
            </Card>

            {/* Productivity */}
            <Card className="glass rounded-2xl p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-lg font-semibold">生産性</Label>
                <p className="text-sm text-muted-foreground">今週の生産性はどうでしたか？</p>
              </div>
              <div className="space-y-4">
                <Slider
                  value={[responses.productivity]}
                  onValueChange={(value) => setResponses({ ...responses, productivity: value[0] })}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>低い (1)</span>
                  <span className="text-primary font-semibold text-lg">{responses.productivity}</span>
                  <span>高い (10)</span>
                </div>
              </div>
            </Card>

            {/* Team Collaboration */}
            <Card className="glass rounded-2xl p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-lg font-semibold">チーム協力</Label>
                <p className="text-sm text-muted-foreground">チームとの協力はうまくいきましたか？</p>
              </div>
              <div className="space-y-4">
                <Slider
                  value={[responses.teamCollaboration]}
                  onValueChange={(value) => setResponses({ ...responses, teamCollaboration: value[0] })}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>悪い (1)</span>
                  <span className="text-primary font-semibold text-lg">{responses.teamCollaboration}</span>
                  <span>良い (10)</span>
                </div>
              </div>
            </Card>

            {/* Concerns */}
            <Card className="glass rounded-2xl p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-lg font-semibold">気になること（任意）</Label>
                <p className="text-sm text-muted-foreground">今週気になったことや懸念事項があれば教えてください</p>
              </div>
              <Textarea
                value={responses.concerns}
                onChange={(e) => setResponses({ ...responses, concerns: e.target.value })}
                placeholder="例: プロジェクトの優先順位が不明確です..."
                className="min-h-32 bg-background/50 rounded-xl"
              />
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">週次アンケート</h1>
            <p className="text-muted-foreground">毎週の状態を記録して、チームの改善に貢献しましょう</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="gradient-teal-lime text-background font-semibold rounded-xl"
          >
            <Calendar className="mr-2 h-4 w-4" />
            今週のアンケート
          </Button>
        </div>

        {/* Current Week */}
        <Card className="glass rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Week 5 - 2025年2月3日</h2>
              <p className="text-muted-foreground">今週のパルスチェックに回答してください</p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="gradient-teal-lime text-background font-semibold rounded-xl"
            >
              回答する
            </Button>
          </div>
        </Card>

        {/* Past Surveys */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">過去の回答</h2>
          <div className="grid gap-4">
            {mockWeeklySurveys.map((survey) => (
              <Card key={survey.id} className="glass rounded-2xl p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="bg-accent/20 p-2 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Week {survey.weekNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(survey.submittedAt).toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="glass-light rounded-xl p-3">
                        <div className="text-xs text-muted-foreground mb-1">気分</div>
                        <div className="text-xl font-bold">{survey.responses.mood}</div>
                      </div>
                      <div className="glass-light rounded-xl p-3">
                        <div className="text-xs text-muted-foreground mb-1">生産性</div>
                        <div className="text-xl font-bold">{survey.responses.productivity}</div>
                      </div>
                      <div className="glass-light rounded-xl p-3">
                        <div className="text-xs text-muted-foreground mb-1">協力</div>
                        <div className="text-xl font-bold">{survey.responses.teamCollaboration}</div>
                      </div>
                    </div>

                    {survey.responses.concerns && (
                      <div className="bg-muted/20 rounded-xl p-3 mt-2">
                        <p className="text-sm text-muted-foreground mb-1">気になること:</p>
                        <p className="text-sm">{survey.responses.concerns}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <Card className="glass rounded-2xl p-6 border-primary/30">
          <div className="flex items-start gap-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">継続的な改善</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                週次アンケートの回答は、AIが分析してチームの状態を可視化します。あなたの正直な回答が、チーム全体の改善につながります。
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
