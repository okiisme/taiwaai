"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, TrendingUp, Download } from "@/components/icons"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function MonitoringPage() {
  const [workshops, setWorkshops] = useState<any[]>([])

  useEffect(() => {
    // Load sample workshops with calculated metrics
    const sampleWorkshops = [
      {
        id: "sample-workshop-1",
        title: "心理的安全性を深める",
        date: new Date(Date.now() - 86400000).toLocaleString("ja-JP", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        responses: 3,
        asIsAvg: 5.0,
        toBeAvg: 8.7,
        gapScore: 3.7,
        topGap: "心理的安全性の向上",
      },
      {
        id: "sample-workshop-2",
        title: "チームの成長機会",
        date: new Date(Date.now() - 172800000).toLocaleString("ja-JP", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        responses: 2,
        asIsAvg: 4.0,
        toBeAvg: 8.5,
        gapScore: 4.5,
        topGap: "学習時間の確保",
      },
    ]
    setWorkshops(sampleWorkshops)
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-lime-600 bg-clip-text text-transparent mb-2">
            過去のワークショップデータ
          </h1>
          <p className="text-gray-600">QRコードから集まった回答の記録と分析</p>
        </div>

        <div className="space-y-4">
          {workshops.length === 0 ? (
            <Card className="rounded-3xl p-12 border-2 text-center">
              <p className="text-gray-500 text-lg">まだワークショップデータがありません</p>
              <p className="text-sm text-gray-400 mt-2">ダッシュボードから新しいワークショップを開始してください</p>
              <Link href="/dashboard">
                <Button className="mt-6 bg-gradient-to-r from-teal-400 to-lime-400 text-white rounded-xl">
                  ダッシュボードへ
                </Button>
              </Link>
            </Card>
          ) : (
            workshops.map((workshop) => (
              <Card key={workshop.id} className="rounded-3xl p-6 border-2 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-gradient-to-r from-teal-400 to-lime-400 p-2 rounded-xl">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{workshop.title}</h3>
                        <p className="text-sm text-gray-500">{workshop.date}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div className="bg-gray-50 rounded-xl p-3 border">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-4 w-4 text-gray-600" />
                          <span className="text-xs text-gray-600">回答数</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{workshop.responses}名</p>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                        <div className="text-xs text-blue-600 mb-1">As is平均</div>
                        <p className="text-2xl font-bold text-blue-600">{workshop.asIsAvg.toFixed(1)}</p>
                      </div>

                      <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                        <div className="text-xs text-green-600 mb-1">To be平均</div>
                        <p className="text-2xl font-bold text-green-600">{workshop.toBeAvg.toFixed(1)}</p>
                      </div>

                      <div className="bg-orange-50 rounded-xl p-3 border border-orange-200">
                        <div className="flex items-center gap-1 mb-1">
                          <TrendingUp className="h-4 w-4 text-orange-600" />
                          <span className="text-xs text-orange-600">ギャップ</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-600">{workshop.gapScore.toFixed(1)}</p>
                      </div>
                    </div>

                    <div className="mt-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 border border-orange-200">
                      <p className="text-sm text-gray-600 mb-1">最大のギャップ領域</p>
                      <p className="font-semibold text-orange-700">{workshop.topGap}</p>
                    </div>
                  </div>

                  <div className="ml-4 space-y-2">
                    <Button
                      size="sm"
                      asChild
                      className="rounded-xl bg-gradient-to-r from-teal-400 to-lime-400 text-white hover:from-teal-500 hover:to-lime-500"
                    >
                      <Link href={`/dashboard/workshops/${workshop.id}/facilitate`}>
                        <Download className="mr-2 h-4 w-4" />
                        レポート
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
