"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, AlertCircle, Users, MessageSquare } from "lucide-react"
import { mockSentimentData } from "@/lib/mock-data"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

export default function AnalyticsPage() {
  const latestData = mockSentimentData[mockSentimentData.length - 1]

  const chartData = mockSentimentData.map((data) => ({
    week: `W${data.weekNumber}`,
    positive: data.trends.positive,
    neutral: data.trends.neutral,
    negative: data.trends.negative,
  }))

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">分析レポート</h1>
            <p className="text-muted-foreground">AIが生成した詳細な分析とインサイト</p>
          </div>
          <Button className="gradient-teal-lime text-background font-semibold rounded-xl">
            <Download className="mr-2 h-4 w-4" />
            レポートをダウンロード
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-accent/20 p-2 rounded-lg">
                <TrendingUp className="h-4 w-4 text-accent" />
              </div>
              <div className="text-sm font-medium text-muted-foreground">ポジティブ</div>
            </div>
            <div className="text-3xl font-bold text-accent">{latestData.trends.positive}%</div>
          </Card>

          <Card className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-muted/20 p-2 rounded-lg">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-sm font-medium text-muted-foreground">ニュートラル</div>
            </div>
            <div className="text-3xl font-bold">{latestData.trends.neutral}%</div>
          </Card>

          <Card className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-destructive/20 p-2 rounded-lg">
                <AlertCircle className="h-4 w-4 text-destructive" />
              </div>
              <div className="text-sm font-medium text-muted-foreground">ネガティブ</div>
            </div>
            <div className="text-3xl font-bold text-destructive">{latestData.trends.negative}%</div>
          </Card>

          <Card className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-primary/20 p-2 rounded-lg">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm font-medium text-muted-foreground">回答数</div>
            </div>
            <div className="text-3xl font-bold">48</div>
          </Card>
        </div>

        {/* Sentiment Trend Chart */}
        <Card className="glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">感情トレンド</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="week" stroke="#a1a1aa" />
              <YAxis stroke="#a1a1aa" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20, 20, 20, 0.95)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                }}
              />
              <Legend />
              <Bar dataKey="positive" fill="#a3e635" name="ポジティブ" radius={[8, 8, 0, 0]} />
              <Bar dataKey="neutral" fill="#71717a" name="ニュートラル" radius={[8, 8, 0, 0]} />
              <Bar dataKey="negative" fill="#ef4444" name="ネガティブ" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Detailed Insights */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">主要な発見</h2>
            <div className="space-y-4">
              <div className="glass-light rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-accent/20 p-2 rounded-lg mt-0.5">
                    <TrendingUp className="h-4 w-4 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">チームモラルの向上</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      過去4週間でポジティブな感情が15%増加しています。コミュニケーション改善の取り組みが効果を発揮しています。
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-light rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-500/20 p-2 rounded-lg mt-0.5">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">ワークロードの懸念</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      3名のメンバーから業務量に関する懸念が報告されています。個別の1on1ミーティングを推奨します。
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-light rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/20 p-2 rounded-lg mt-0.5">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">高い心理的安全性</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      メンバーが自由に意見を述べられる環境が維持されています。この状態を継続することが重要です。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">推奨アクション</h2>
            <div className="space-y-4">
              {latestData.recommendations.map((rec, index) => (
                <div key={index} className="glass-light rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-accent/20 p-1.5 rounded-lg mt-0.5">
                      <div className="w-2 h-2 bg-accent rounded-full" />
                    </div>
                    <p className="text-sm leading-relaxed flex-1">{rec}</p>
                  </div>
                </div>
              ))}
              <div className="glass-light rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-accent/20 p-1.5 rounded-lg mt-0.5">
                    <div className="w-2 h-2 bg-accent rounded-full" />
                  </div>
                  <p className="text-sm leading-relaxed flex-1">
                    次回のワークショップで、チーム全体の成功事例を共有する時間を設ける
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
