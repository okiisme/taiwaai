"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, RotateCcw, FastForward, Pause } from "@/components/icons"
import { AnalysisDisplay } from "@/app/dashboard/workshops/[id]/facilitate/analysis-display"
import type { LocalAnalysisStats, AnalysisResult } from "@/lib/types"

// Dummy stats matching the final state of the demo
const MOCK_STATS: LocalAnalysisStats = {
  warmth: 35, // Low warmth -> Vulnerability issue
  heroScores: { hope: 8.5, efficacy: 4.0, resilience: 3.5, optimism: 5.0 }, // High Hope, Low Efficacy (Dreamer)
  focusTags: { mindset: 70, process: 10, environment: 20 }, // Mindset focused (Manager bias)
  responseCount: 4
}

// Dummy analysis result matching the "Disconnect" and "Action Blocker" scenario
const MOCK_ANALYSIS: AnalysisResult = {
  gravityStatus: "🛸 浮遊する理想郷 (Floating Utopia)",
  warmth: 35,
  heroInsight: {
    scores: MOCK_STATS.heroScores,
    pathology: "高い希望(Hope)に対し、それを実行する効力感(Efficacy)が著しく不足しています。「夢は語るが足元がおぼつかない」状態です。",
    risks: ["学習性無力感", "具体策の欠如"]
  },
  gapAnalysis: {
    managerView: "意識改革(Mindset)が必要",
    memberView: "具体的な仕組み(Process)が必要",
    cognitiveGap: "マネージャーは「やる気」の問題と捉えていますが、メンバーは「手段」がないことに絶望しています。",
    lemonMarketAlert: "High"
  },
  structuralBridge: {
    missingLink: "「精神論」ではなく「明日使えるツール」の提供",
    bridgeQuality: "Fragile"
  },
  intervention: {
    mutualUnderstanding: "「やる気はあるのに、動けない」と感じた瞬間はいつですか？",
    suspendedJudgment: "もし「意識」の問題ではないとしたら、何が手かせ足かせになっていますか？",
    smallAgreement: "明日、会議の時間を「5分」短くすることから始めませんか？"
  },
  tags: MOCK_STATS.focusTags,
  roi: 3.2
}

const DEMO_SCRIPT = [
  {
    stage: "intro",
    title: "1. TAIWA AI デモンストレーション",
    description: "「見えない課題」を可視化し、対話の質を変えるプロセスを体験します。",
    duration: 2500,
  },
  {
    stage: "participants-join",
    title: "2. 参加者が匿名で入室",
    description: "心理的安全性を担保するため、全ての参加者は匿名で扱われます。",
    participants: [
      { name: "User1 (Manager)", joinTime: 500 },
      { name: "User2 (Member)", joinTime: 1000 },
      { name: "User3 (Member)", joinTime: 1500 },
      { name: "User4 (Member)", joinTime: 2000 },
    ],
    duration: 3000,
  },
  {
    stage: "responses-coming",
    title: "3. 本音と課題の収集",
    description: "「現状(As-is)」と「理想(To-be)」、そして「隠れた感情(Vulnerability)」を収集します。",
    responses: [
      {
        participant: "User1 (Manager)",
        asIs: "メンバーの主体性が足りない",
        solution: "もっと当事者意識を持つべき (Mindset)",
        hero: "Hope: 9, Efficacy: 8",
        vulnerability: "Honesty: 100% (High)",
        time: 500,
      },
      {
        participant: "User2 (Member)",
        asIs: "何を言っても変わらない空気がある",
        solution: "失敗を許容するルールが欲しい (Process)",
        hero: "Hope: 4, Efficacy: 2",
        vulnerability: "Honesty: 20% (Low) -> 面従腹背",
        time: 1500,
      },
      {
        participant: "User3 (Member)",
        asIs: "理想ばかり語られて疲れる",
        solution: "リソースを増やしてほしい (Environment)",
        hero: "Hope: 5, Efficacy: 3",
        vulnerability: "Honesty: 40% (Low)",
        time: 2500,
      },
    ],
    duration: 4000,
  },
  {
    stage: "realtime-analysis",
    title: "4. リアルタイム集計 (Deterministic)",
    description: "AIを待たずに、場の「温かさ」や「心理資本」が即座に可視化されます。",
    showStats: true,
    duration: 3000,
  },
  {
    stage: "ai-insight",
    title: "5. AIによる構造分析 (Generative)",
    description: "「断絶」や「語られない本音」をAIが鋭く指摘します。",
    showAnalysis: true,
    duration: 10000, // Longer duration to read analysis
  },
]

export function InteractiveDemo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [participants, setParticipants] = useState<any[]>([])
  const [responses, setResponses] = useState<any[]>([])
  const [speed, setSpeed] = useState(0.5) // Default slower for readability

  const currentStep = DEMO_SCRIPT[currentStepIndex]

  useEffect(() => {
    if (!isPlaying || isPaused) return

    let timer: NodeJS.Timeout

    // Handle step-specific logic
    if (currentStep.stage === "participants-join" && currentStep.participants) {
      // Simple visualization logic handled in render
    }

    if (currentStep.stage === "responses-coming" && currentStep.responses) {
      // Simple visualization logic handled in render
    }

    timer = setTimeout(() => {
      if (currentStepIndex < DEMO_SCRIPT.length - 1) {
        setCurrentStepIndex((prev) => prev + 1)
      } else {
        setIsPlaying(false)
        setIsPaused(false)
      }
    }, currentStep.duration / speed)

    return () => clearTimeout(timer)
  }, [isPlaying, isPaused, currentStepIndex, currentStep, speed])

  const handleStart = () => {
    setIsPlaying(true)
    setIsPaused(false)
    setCurrentStepIndex(0)
    setParticipants([])
    setResponses([])
  }

  const handleTogglePause = () => {
    if (!isPlaying) return
    setIsPaused(!isPaused)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentStepIndex(0)
    setParticipants([])
    setResponses([])
  }

  const handleSpeedChange = () => {
    setSpeed((prev) => (prev === 0.5 ? 1 : prev === 1 ? 2 : 0.5))
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Controls */}
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
        <div className="flex gap-3">
          {isPlaying && (
            <Button
              onClick={handleTogglePause}
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-2xl px-8"
            >
              <Pause className="mr-2 h-5 w-5" />
              {isPaused ? "再開" : "一時停止"}
            </Button>
          )}
          <Button
            onClick={handleStart}
            disabled={isPlaying && !isPaused}
            size="lg"
            className="bg-gradient-to-r from-teal-400 to-lime-400 hover:from-teal-500 hover:to-lime-500 text-white font-semibold rounded-2xl px-8"
          >
            <Play className="mr-2 h-5 w-5" />
            {isPlaying && !isPaused ? "再生中..." : "デモを開始"}
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card className="bg-white rounded-2xl p-4 border-2">
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isPaused ? "bg-yellow-400" : "bg-gradient-to-r from-teal-400 to-lime-400"}`}
              style={{ width: `${((currentStepIndex + 1) / DEMO_SCRIPT.length) * 100}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-600">
            {currentStepIndex + 1} / {DEMO_SCRIPT.length} : {currentStep.title}
          </span>
        </div>
      </Card>

      {/* Main Display Area */}
      <div className="min-h-[400px]">
        {/* Intro / Questions */}
        {!currentStep.showStats && !currentStep.showAnalysis && (
          <Card className="bg-gradient-to-r from-teal-50 to-lime-50 rounded-3xl p-10 border-2 border-teal-200 h-full flex flex-col items-center justify-center text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">{currentStep.title}</h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl leading-relaxed">{currentStep.description}</p>

            {/* Visuals for intermediate steps */}
            {currentStep.stage === "responses-coming" && (
              <div className="mt-8 grid gap-4 w-full max-w-2xl text-left">
                {DEMO_SCRIPT[2].responses?.map((r, i) => (
                  <div key={i} className="bg-white/80 p-4 rounded-xl border border-teal-100 animate-in slide-in-from-bottom-2 fade-in duration-500" style={{ animationDelay: `${i * 500}ms` }}>
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-teal-700">{r.participant}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{r.hero}</span>
                    </div>
                    <div className="text-sm text-gray-700">"{r.asIs}"</div>
                    <div className="text-xs text-red-500 mt-1">⚠️ {r.vulnerability}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Analysis Display (Simulated) */}
        {(currentStep.showStats || currentStep.showAnalysis) && (
          <div className="animate-in fade-in zoom-in duration-500">
            {currentStep.showAnalysis ? (
              // Show Full Analysis
              <AnalysisDisplay
                analysis={MOCK_ANALYSIS}
                stats={MOCK_STATS}
                onSelectQuestion={() => { }}
              />
            ) : (
              // Show Only Stats (Simulating real-time update)
              <AnalysisDisplay
                analysis={null}
                stats={MOCK_STATS}
                onSelectQuestion={() => { }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
