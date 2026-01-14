"use client"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Users, Sparkles, Play, RotateCcw, FastForward, TrendingUp, FileText, BarChart } from "@/components/icons"

const DEMO_SCRIPT = [
  {
    stage: "intro",
    title: "TAIWA AI デモンストレーション",
    description: "As is / To beギャップアプローチで対話を促進",
    duration: 2000,
  },
  {
    stage: "qr-display",
    title: "1. QRコードを表示",
    description: "参加者はスマホでQRコードをスキャンして参加",
    duration: 2000,
  },
  {
    stage: "participants-join",
    title: "2. 参加者が入室",
    description: "名前を入力して匿名で参加",
    participants: [
      { name: "山田太郎", joinTime: 500 },
      { name: "佐藤花子", joinTime: 1000 },
      { name: "田中健一", joinTime: 1500 },
      { name: "鈴木美咲", joinTime: 2000 },
    ],
    duration: 3000,
  },
  {
    stage: "question-display",
    title: "3. テーマを表示",
    description: "As is（現状）とTo be（理想）を入力してもらいます",
    question: "チームのコミュニケーション",
    duration: 2000,
  },
  {
    stage: "responses-coming",
    title: "4. 回答が集まる",
    description: "As is、To be、ギャップを構造化して回答",
    responses: [
      {
        participant: "山田太郎",
        asIs: { fact: "週1回しか話し合いがない", score: 5, cause: "時間不足" },
        toBe: { intent: "毎日気軽に話せる環境", score: 9, gap: 4 },
        gap: { interpretation: "時間不足が原因で、頻度を上げたい", rootCause: ["時間不足", "優先度"] },
        stance: { energy: 75, mode: "発散", openness: 85 },
        time: 1000,
      },
      {
        participant: "佐藤花子",
        asIs: { fact: "意見を言いづらい雰囲気", score: 4, cause: "心理的安全性不足" },
        toBe: { intent: "自由に提案できるチーム", score: 10, gap: 6 },
        gap: { interpretation: "心理的安全性が低く、発言を躊躇してしまう", rootCause: ["心理的安全性不足", "文化"] },
        stance: { energy: 60, mode: "内省", openness: 70 },
        time: 2000,
      },
      {
        participant: "田中健一",
        asIs: { fact: "情報共有が遅い", score: 6, cause: "ツール不足" },
        toBe: { intent: "リアルタイムで情報が流れる", score: 8, gap: 2 },
        gap: { interpretation: "ツールを改善すれば解決できる", rootCause: ["ツール不足", "仕組み"] },
        stance: { energy: 80, mode: "挑戦", openness: 90 },
        time: 3000,
      },
      {
        participant: "鈴木美咲",
        asIs: { fact: "会議が長すぎる", score: 5, cause: "議題が不明確" },
        toBe: { intent: "効率的で生産的な会議", score: 9, gap: 4 },
        gap: { interpretation: "議題を明確にして、時間を短縮したい", rootCause: ["議題不明確", "運営方法"] },
        stance: { energy: 65, mode: "収束", openness: 75 },
        time: 4000,
      },
    ],
    duration: 5000,
  },
  {
    stage: "gap-analysis",
    title: "5. ギャップ分析",
    description: "マネージャーとメンバーの認識の乖離を可視化",
    gapData: {
      overallAsIs: 5.0,
      overallToBe: 9.0,
      averageGap: 4.0,
      topGapAreas: [
        { area: "コミュニケーション頻度", managerView: 7, memberView: 4, gap: 3 },
        { area: "意見の言いやすさ", managerView: 8, memberView: 3, gap: 5 },
        { area: "情報共有のスピード", managerView: 6, memberView: 4, gap: 2 },
      ],
    },
    duration: 4000,
  },
  {
    stage: "report",
    title: "6. 詳細レポート生成完了",
    description: "参加者ごとの詳細分析とギャップ領域を特定しました",
    reportData: {
      participantDetails: [
        {
          name: "山田太郎",
          role: "マネージャー",
          stance: { energy: 75, mode: "発散", openness: 85 },
          asIsScore: 5,
          toBeScore: 9,
          gap: 4,
          insight: "時間不足が原因と認識。具体的な改善策を求めている",
        },
        {
          name: "佐藤花子",
          role: "メンバー",
          stance: { energy: 60, mode: "内省", openness: 70 },
          asIsScore: 4,
          toBeScore: 10,
          gap: 6,
          insight: "心理的安全性の欠如を感じている。自由な発言環境を強く望む",
        },
        {
          name: "田中健一",
          role: "メンバー",
          stance: { energy: 80, mode: "挑戦", openness: 90 },
          asIsScore: 6,
          toBeScore: 8,
          gap: 2,
          insight: "ツールの改善で解決可能と考えている。実装意欲が高い",
        },
        {
          name: "鈴木美咲",
          role: "メンバー",
          stance: { energy: 65, mode: "収束", openness: 75 },
          asIsScore: 5,
          toBeScore: 9,
          gap: 4,
          insight: "会議の効率化を求めている。具体的なアクションを期待",
        },
      ],
      keyFindings: [
        {
          title: "認識の乖離が最大の領域",
          description: "「意見の言いやすさ」でマネージャーとメンバーの認識に5点の差",
          action: "1on1で個別に状況をヒアリングし、具体的な改善策を一緒に考える",
        },
        {
          title: "共通する理想像",
          description: "全員が「自由で効率的なコミュニケーション」を望んでいる",
          action: "チーム全体で理想の状態を明文化し、行動指針として掲げる",
        },
        {
          title: "即座に改善可能な項目",
          description: "ツールや会議運営など、制度面での改善が期待されている",
          action: "次回の会議で具体的な改善案を提示し、実行計画を立てる",
        },
      ],
    },
    duration: 3000,
  },
]

export default function DemoPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [participants, setParticipants] = useState<any[]>([])
  const [responses, setResponses] = useState<any[]>([])
  const [speed, setSpeed] = useState(1)

  const currentStep = DEMO_SCRIPT[currentStepIndex]

  useEffect(() => {
    if (!isPlaying) return

    if (currentStep.stage === "participants-join" && currentStep.participants) {
      currentStep.participants.forEach((p) => {
        setTimeout(() => {
          setParticipants((prev) => [...prev, p])
        }, p.joinTime / speed)
      })
    }

    if (currentStep.stage === "responses-coming" && currentStep.responses) {
      currentStep.responses.forEach((r) => {
        setTimeout(() => {
          setResponses((prev) => [...prev, r])
        }, r.time / speed)
      })
    }

    const timer = setTimeout(() => {
      if (currentStepIndex < DEMO_SCRIPT.length - 1) {
        setCurrentStepIndex((prev) => prev + 1)
      } else {
        setIsPlaying(false)
      }
    }, currentStep.duration / speed)

    return () => clearTimeout(timer)
  }, [isPlaying, currentStepIndex, currentStep, speed])

  const handleStart = () => {
    setIsPlaying(true)
    setCurrentStepIndex(0)
    setParticipants([])
    setResponses([])
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentStepIndex(0)
    setParticipants([])
    setResponses([])
  }

  const handleSpeedChange = () => {
    setSpeed((prev) => (prev === 1 ? 2 : prev === 2 ? 3 : 1))
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-500 to-lime-500 bg-clip-text text-transparent">
              TAIWA AI デモ
            </h1>
            <p className="text-gray-600 mt-2">As is / To beギャップ対話の流れを体験</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSpeedChange}
              variant="outline"
              size="lg"
              className="rounded-2xl border-2 bg-transparent"
            >
              <FastForward className="mr-2 h-5 w-5" />
              {speed}x速度
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg" className="rounded-2xl border-2 bg-transparent">
              <RotateCcw className="mr-2 h-5 w-5" />
              リセット
            </Button>
            <Button
              onClick={handleStart}
              disabled={isPlaying}
              size="lg"
              className="bg-gradient-to-r from-teal-400 to-lime-400 hover:from-teal-500 hover:to-lime-500 text-white font-semibold rounded-2xl px-8"
            >
              <Play className="mr-2 h-5 w-5" />
              {isPlaying ? "再生中..." : "デモを開始"}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="bg-white rounded-2xl p-4 border-2">
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-400 to-lime-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${((currentStepIndex + 1) / DEMO_SCRIPT.length) * 100}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-600">
              {currentStepIndex + 1} / {DEMO_SCRIPT.length}
            </span>
          </div>
        </Card>

        {/* Current Stage Display */}
        <Card className="bg-gradient-to-r from-teal-50 to-lime-50 rounded-3xl p-10 border-2 border-teal-200">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">{currentStep.title}</h2>
            <p className="text-xl text-gray-600">{currentStep.description}</p>
          </div>
        </Card>

        {/* Stage-specific content */}
        {currentStep.stage === "qr-display" && (
          <Card className="bg-white rounded-3xl p-8">
            <div className="text-center">
              <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 inline-block">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://example.com/join/demo"
                  alt="Demo QR Code"
                  className="w-48 h-48"
                />
              </div>
              <p className="mt-4 text-gray-600">スマホでスキャンして参加</p>
            </div>
          </Card>
        )}

        {(currentStep.stage === "participants-join" || currentStep.stage === "question-display") && (
          <Card className="bg-white rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-xl flex items-center gap-3">
                <Users className="h-6 w-6 text-teal-500" />
                参加者
              </h3>
              <span className="bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-lg font-semibold">
                {participants.length}名
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {participants.map((participant, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-teal-50 to-lime-50 rounded-xl border border-teal-100"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-lime-400 rounded-full flex items-center justify-center text-white font-semibold">
                    {participant.name.charAt(0)}
                  </div>
                  <span className="font-medium text-gray-700">{participant.name}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {currentStep.stage === "responses-coming" && (
          <div className="space-y-6">
            <Card className="bg-white rounded-3xl p-6">
              <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-500" />
                回答の生データ
              </h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {responses.map((response, index) => (
                  <div
                    key={index}
                    className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {response.participant.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-800">{response.participant}</span>
                      {response.stance && (
                        <div className="ml-auto flex gap-2">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                            ⚡ {response.stance.energy}/10
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                            {response.stance.mode}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-lg p-3 border-l-4 border-blue-500">
                        <p className="text-xs text-blue-600 font-semibold mb-1">As is</p>
                        <p className="text-sm text-gray-700 mb-2">{response.asIs.fact}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{ width: `${(response.asIs.score / 10) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-blue-600">{response.asIs.score}</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border-l-4 border-green-500">
                        <p className="text-xs text-green-600 font-semibold mb-1">To be</p>
                        <p className="text-sm text-gray-700 mb-2">{response.toBe.intent}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-green-500 h-1.5 rounded-full"
                              style={{ width: `${(response.toBe.score / 10) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-green-600">{response.toBe.score}</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border-l-4 border-orange-500">
                        <p className="text-xs text-orange-600 font-semibold mb-1">Gap</p>
                        <p className="text-sm text-gray-700 mb-2">{response.gap.interpretation}</p>
                        <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-semibold">
                          {response.gap.gap}pt
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white rounded-3xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-teal-500" />
                  スコア比較グラフ
                </h3>
                <div className="space-y-3">
                  {responses.map((response, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{response.participant}</span>
                        <span className="text-orange-600 font-semibold">Gap: {response.gap.gap}</span>
                      </div>
                      <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
                        <div className="absolute inset-0 flex">
                          <div
                            className="bg-blue-400 flex items-center justify-center text-white text-xs font-semibold"
                            style={{ width: `${(response.asIs.score / 10) * 100}%` }}
                          >
                            {response.asIs.score > 2 && response.asIs.score}
                          </div>
                        </div>
                        <div className="absolute inset-0 flex justify-end">
                          <div
                            className="bg-green-400 opacity-70 flex items-center justify-center text-white text-xs font-semibold"
                            style={{ width: `${(response.toBe.score / 10) * 100}%` }}
                          >
                            {response.toBe.score > 2 && response.toBe.score}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-white rounded-3xl p-6">
                <h3 className="font-semibold mb-4">回答進捗とスタンス</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">進捗率</span>
                      <span className="text-2xl font-bold text-teal-600">
                        {Math.round((responses.length / 4) * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-teal-400 to-lime-400 h-full rounded-full transition-all"
                          style={{ width: `${(responses.length / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  {responses.some((r) => r.stance) && (
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-semibold text-gray-600 mb-3">エネルギーレベル平均</h4>
                      <div className="space-y-2">
                        {responses
                          .filter((r) => r.stance)
                          .map((response, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 w-20 truncate">{response.participant}</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-yellow-400 h-2 rounded-full"
                                  style={{ width: `${(response.stance!.energy / 10) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-yellow-600 w-8">{response.stance!.energy}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {currentStep.stage === "gap-analysis" && currentStep.gapData && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                <div className="text-sm text-blue-600 mb-1">As is平均</div>
                <div className="text-4xl font-bold text-blue-600">{currentStep.gapData.overallAsIs}</div>
              </Card>
              <Card className="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                <div className="text-sm text-green-600 mb-1">To be平均</div>
                <div className="text-4xl font-bold text-green-600">{currentStep.gapData.overallToBe}</div>
              </Card>
              <Card className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-200">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <span className="text-sm text-orange-600">平均ギャップ</span>
                </div>
                <div className="text-4xl font-bold text-orange-600">{currentStep.gapData.averageGap}</div>
              </Card>
            </div>

            <Card className="bg-white rounded-3xl p-6">
              <h3 className="font-semibold text-xl mb-4">ギャップが大きい領域</h3>
              <div className="space-y-3">
                {currentStep.gapData.topGapAreas.map((area, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800">{area.area}</span>
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">
                        ギャップ: {area.gap}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        マネージャー: <span className="font-semibold">{area.managerView}</span>
                      </span>
                      <span className="text-gray-400">vs</span>
                      <span className="text-gray-600">
                        メンバー: <span className="font-semibold">{area.memberView}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {currentStep.stage === "report" && currentStep.reportData && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-teal-50 to-lime-50 rounded-3xl p-8 border-2 border-teal-200">
              <div className="text-center space-y-3 mb-8">
                <div className="text-5xl mb-3">📊</div>
                <h2 className="text-3xl font-bold text-gray-800">詳細レポート生成完了！</h2>
                <p className="text-lg text-gray-600">参加者の本音とギャップが可視化されました</p>
              </div>
            </Card>

            {/* Participant Details */}
            <Card className="bg-white rounded-3xl p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Users className="h-6 w-6 text-teal-500" />
                参加者ごとの詳細分析
              </h3>
              <div className="space-y-4">
                {currentStep.reportData.participantDetails.map((participant, index) => (
                  <div
                    key={index}
                    className="p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-teal-400 to-lime-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {participant.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">{participant.name}</div>
                          <div className="text-sm text-gray-500">{participant.role}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                          As is: {participant.asIsScore}
                        </span>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                          To be: {participant.toBeScore}
                        </span>
                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">
                          Gap: {participant.gap}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-xs text-gray-500 mb-1">エネルギー</div>
                        <div className="text-lg font-bold text-teal-600">{participant.stance.energy}%</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-xs text-gray-500 mb-1">モード</div>
                        <div className="text-lg font-bold text-blue-600">{participant.stance.mode}</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-xs text-gray-500 mb-1">オープンネス</div>
                        <div className="text-lg font-bold text-lime-600">{participant.stance.openness}%</div>
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      <div className="text-xs text-yellow-700 font-semibold mb-1">💡 インサイト</div>
                      <p className="text-sm text-gray-700">{participant.insight}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Key Findings */}
            <Card className="bg-white rounded-3xl p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-teal-500" />
                主要な発見と推奨アクション
              </h3>
              <div className="space-y-4">
                {currentStep.reportData.keyFindings.map((finding, index) => (
                  <div
                    key={index}
                    className="p-5 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border-2 border-orange-200"
                  >
                    <h4 className="font-bold text-lg text-gray-800 mb-2">{finding.title}</h4>
                    <p className="text-gray-600 mb-3">{finding.description}</p>
                    <div className="bg-white p-4 rounded-lg border-2 border-teal-200">
                      <div className="text-xs text-teal-600 font-semibold mb-1">🎯 推奨アクション</div>
                      <p className="text-sm text-gray-700">{finding.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Download Button */}
            <Card className="bg-gradient-to-r from-teal-100 to-lime-100 rounded-3xl p-8 border-2 border-teal-300">
              <div className="text-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-teal-500 to-lime-500 hover:from-teal-600 hover:to-lime-600 text-white rounded-2xl px-12 py-6 text-lg font-bold"
                >
                  📄 詳細レポートをPDFでダウンロード
                </Button>
                <p className="text-sm text-gray-600 mt-3">
                  参加者詳細、ギャップ分析、推奨アクションを含む完全なレポート
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
