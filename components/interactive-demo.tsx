"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, RotateCcw, FastForward } from "@/components/icons"

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
        gap: { interpretation: "時間不足が原因で、頻度を上げたい", rootCause: ["時間不足", "優先度"], gap: 4 },
        stance: { energy: 75, mode: "発散", openness: 85 },
        time: 1000,
      },
      {
        participant: "佐藤花子",
        asIs: { fact: "意見を言いづらい雰囲気", score: 4, cause: "心理的安全性不足" },
        toBe: { intent: "自由に提案できるチーム", score: 10, gap: 6 },
        gap: {
          interpretation: "心理的安全性が低く、発言を躊躇してしまう",
          rootCause: ["心理的安全性不足", "文化"],
          gap: 6,
        },
        stance: { energy: 60, mode: "内省", openness: 70 },
        time: 2000,
      },
      {
        participant: "田中健一",
        asIs: { fact: "情報共有が遅い", score: 6, cause: "ツール不足" },
        toBe: { intent: "リアルタイムで情報が流れる", score: 8, gap: 2 },
        gap: { interpretation: "ツールを改善すれば解決できる", rootCause: ["ツール不足", "仕組み"], gap: 2 },
        stance: { energy: 80, mode: "挑戦", openness: 90 },
        time: 3000,
      },
      {
        participant: "鈴木美咲",
        asIs: { fact: "会議が長すぎる", score: 5, cause: "議題が不明確" },
        toBe: { intent: "効率的で生産的な会議", score: 9, gap: 4 },
        gap: { interpretation: "議題を明確にして、時間を短縮したい", rootCause: ["議題不明確", "運営方法"], gap: 4 },
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

export function InteractiveDemo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [participants, setParticipants] = useState<any[]>([])
  const [responses, setResponses] = useState<any[]>([])
  const [speed, setSpeed] = useState(0.5) // Default speed set to 0.5x (slower)

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
    setSpeed((prev) => (prev === 0.5 ? 1 : prev === 1 ? 2 : 0.5))
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
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
        </div>
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
    </div>
  )
}
