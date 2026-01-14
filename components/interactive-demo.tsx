"use client"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, RotateCcw, FastForward, Pause, Maximize2, Minimize2, Users, ArrowRight } from "@/components/icons"
import { AnalysisDisplay } from "@/app/dashboard/workshops/[id]/facilitate/analysis-display"
import type { LocalAnalysisStats, AnalysisResult } from "@/lib/types"
import { QRCodeSVG } from "qrcode.react"

// Dummy stats matching the final state of the demo
const MOCK_STATS: LocalAnalysisStats = {
  warmth: 35, // Low warmth -> Vulnerability issue
  heroScores: { hope: 8.5, efficacy: 4.0, resilience: 3.5, optimism: 5.0 }, // Avg 5.25
  focusTags: { mindset: 70, process: 10, environment: 20 }, // Mindset focused (Manager bias)
  responseCount: 4,
  roi: 2.6 // (5.25 / 2) * 1.0 approx
}

// Dummy analysis result matching the "Disconnect" and "Action Blocker" scenario
const MOCK_ANALYSIS: AnalysisResult = {
  gravityStatus: "🛸 浮遊する理想郷 (Floating Utopia)",
  warmth: 35,
  heroInsight: {
    scores: MOCK_STATS.heroScores,
    strength: "未来への希望(Hope)は非常に高く維持されています。",
    pathology: "高い希望(Hope)に対し、それを実行する効力感(Efficacy)が不足。「夢は語るが足元がおぼつかない」状態です。",
    risks: ["学習性無力感", "具体策の欠如"]
  },
  gapAnalysis: {
    managerView: "意識改革(Mindset)が必要",
    memberView: "具体的な仕組み(Process)が必要",
    cognitiveGap: "マネージャーは「やる気」の問題と捉えていますが、メンバーは「手段」がないことに絶望しています。",
    lemonMarketRisk: "High",
    asymmetryLevel: "High"
  },
  structuralBridge: {
    missingLink: "「精神論」ではなく「明日使えるツール」の提供",
    bridgeQuality: "Fragile"
  },
  interventionQuestions: {
    mutualUnderstanding: "「やる気はあるのに、動けない」と感じた瞬間はいつですか？",
    suspendedJudgment: "もし「意識」の問題ではないとしたら、何が手かせ足かせになっていますか？",
    smallAgreement: "明日、会議の時間を「5分」短くすることから始めませんか？"
  },
  tags: MOCK_STATS.focusTags,
  roiScore: 2.6
}

const DEMO_SCRIPT = [
  {
    stage: "intro",
    title: "1. TAIWA AI デモンストレーション",
    description: "「見えない課題」を可視化し、対話の質を変えるプロセスを体験します。",
    duration: 3000,
  },
  {
    stage: "participants-join",
    title: "2. 参加者が匿名で入室",
    description: "QRコードから、メンバーが匿名でセッションに参加します。",
    participants: [
      { name: "Manager A", role: "manager", joinTime: 500, avatar: "👔" },
      { name: "Member B", role: "member", joinTime: 1200, avatar: "👩‍💻" },
      { name: "Member C", role: "member", joinTime: 1800, avatar: "👨‍💻" },
      { name: "Member D", role: "member", joinTime: 2400, avatar: "🤔" },
    ],
    duration: 4000,
    showQR: true
  },
  {
    stage: "responses-coming",
    title: "3. 本音と課題の収集",
    description: "「現状(As-is)」と「理想(To-be)」、そして「隠れた感情(Vulnerability)」をリアルタイムに収集。",
    responses: [
      {
        participant: "Manager A",
        role: "manager",
        asIs: "メンバーの主体性が足りない",
        solution: "もっと当事者意識を持つべき (Mindset)",
        hero: "Hope: 9, Efficacy: 8",
        vulnerability: "Honesty: 100% (High)",
        time: 500,
      },
      {
        participant: "Member B",
        role: "member",
        asIs: "何を言っても変わらない空気がある",
        solution: "失敗を許容するルールが欲しい (Process)",
        hero: "Hope: 4, Efficacy: 2",
        vulnerability: "Honesty: 20% (Low) -> 面従腹背",
        time: 1500,
      },
      {
        participant: "Member C",
        role: "member",
        asIs: "理想ばかり語られて疲れる",
        solution: "リソースを増やしてほしい (Environment)",
        hero: "Hope: 5, Efficacy: 3",
        vulnerability: "Honesty: 40% (Low)",
        time: 2500,
        highlight: true
      },
    ],
    duration: 5000,
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
  const [speed, setSpeed] = useState(1)
  const [isFullScreen, setIsFullScreen] = useState(false)

  const currentStep = DEMO_SCRIPT[currentStepIndex]

  // Reset state when step changes or demo resets
  useEffect(() => {
    if (currentStepIndex === 0 && !isPlaying) {
      setParticipants([])
      setResponses([])
    }
  }, [currentStepIndex, isPlaying])

  useEffect(() => {
    if (!isPlaying || isPaused) return

    let timer: NodeJS.Timeout
    const stepDuration = currentStep.duration / speed

    // Handle step-specific logic
    if (currentStep.stage === "participants-join" && currentStep.participants) {
      // Reset for this step if just started
      if (participants.length === 0) {
        currentStep.participants.forEach(p => {
          setTimeout(() => {
            setParticipants(prev => [...prev, p])
          }, p.joinTime / speed)
        })
      }
    }

    if (currentStep.stage === "responses-coming" && currentStep.responses) {
      if (responses.length === 0) {
        currentStep.responses.forEach(r => {
          setTimeout(() => {
            setResponses(prev => [...prev, r])
          }, r.time / speed)
        })
      }
    }

    timer = setTimeout(() => {
      if (currentStepIndex < DEMO_SCRIPT.length - 1) {
        setCurrentStepIndex((prev) => prev + 1)
      } else {
        setIsPlaying(false)
        setIsPaused(false)
      }
    }, stepDuration)

    return () => clearTimeout(timer)
  }, [isPlaying, isPaused, currentStepIndex, currentStep, speed])

  const handleStart = () => {
    setIsPlaying(true)
    setIsPaused(false)
    setCurrentStepIndex(0)
    setParticipants([])
    setResponses([])
    if (window.innerWidth > 768) {
      setIsFullScreen(true) // Auto fullscreen on start for desktop
    }
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
    setIsFullScreen(false)
  }

  const handleSpeedChange = () => {
    setSpeed((prev) => (prev === 0.5 ? 1 : prev === 1 ? 2 : 0.5))
  }

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  // Render content based on full screen state
  const containerClasses = isFullScreen
    ? "fixed inset-0 z-50 bg-slate-50 overflow-y-auto"
    : "relative w-full"

  const contentClasses = isFullScreen
    ? "min-h-screen p-8 max-w-7xl mx-auto flex flex-col justify-center"
    : "w-full"

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>

        {/* Header Controls (Always visible in full screen) */}
        <div className="flex items-center justify-between mb-8 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border shadow-sm sticky top-4 z-40">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-teal-400 to-lime-400 p-2 rounded-xl text-white">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm sm:text-base">{currentStep.title}</h3>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-400 transition-all duration-300"
                    style={{ width: `${((currentStepIndex + 1) / DEMO_SCRIPT.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{currentStepIndex + 1}/{DEMO_SCRIPT.length}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPlaying && (
              <Button onClick={handleTogglePause} variant="ghost" size="icon" className="text-gray-500">
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </Button>
            )}
            <Button onClick={handleSpeedChange} variant="ghost" className="text-xs font-mono text-gray-500 hidden sm:flex">
              {speed}x
            </Button>
            <Button onClick={toggleFullScreen} variant="ghost" size="icon" className="text-gray-500">
              {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm" className="rounded-xl hidden sm:flex">
              <RotateCcw className="w-4 h-4 mr-1" /> Reset
            </Button>
          </div>
        </div>

        {/* Start Screen Overlay if not full screen and not playing */}
        {!isFullScreen && !isPlaying && currentStepIndex === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[2px] rounded-3xl">
            <Button onClick={handleStart} size="lg" className="bg-gradient-to-r from-teal-400 to-lime-400 text-white font-bold text-xl px-12 py-8 rounded-full shadow-2xl hover:scale-105 transition-transform">
              <Play className="w-8 h-8 mr-3 fill-current" />
              デモを開始する
            </Button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative min-h-[500px]">

          {/* Intro Stage */}
          {currentStep.stage === "intro" && (
            <div className="flex flex-col items-center justify-center text-center h-full my-auto py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-lime-600 mb-6 leading-tight">
                TAIWA AI<br />Interactive Demo
              </h1>
              <p className="text-xl md:text-2xl text-gray-500 max-w-2xl">
                {currentStep.description}
              </p>
              {!isPlaying && isFullScreen && (
                <Button onClick={handleStart} size="lg" className="mt-12 bg-black text-white rounded-full px-8">
                  スタート
                </Button>
              )}
            </div>
          )}

          {/* Participants Joining (Lobby) */}
          {currentStep.stage === "participants-join" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full my-auto animate-in fade-in duration-500">
              <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-gray-100 flex flex-col items-center text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-4">参加用QRコード</h3>
                <div className="bg-white p-4 rounded-xl shadow-inner border">
                  <QRCodeSVG value="https://taiwa-ai.com/demo" size={240} />
                </div>
                <p className="mt-6 text-2xl font-mono font-bold text-gray-700 tracking-widest">A7x-92</p>
                <p className="text-sm text-gray-400 mt-2">参加者はスマートフォンからアクセス</p>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-700 flex items-center gap-3">
                  <Users className="w-6 h-6" />
                  参加者 ({participants.length})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {participants.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-500"
                    >
                      <div className="text-3xl">{p.avatar}</div>
                      <div>
                        <p className="font-bold text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-500 uppercase font-semibold">{p.role}</p>
                      </div>
                      <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    </div>
                  ))}
                  {participants.length === 0 && (
                    <p className="text-gray-400 italic col-span-2">待機中...</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Responses Coming */}
          {currentStep.stage === "responses-coming" && (
            <div className="h-full flex flex-col animate-in fade-in duration-500">
              <h3 className="text-2xl font-bold text-gray-700 mb-6 flex items-center gap-3">
                <ArrowRight className="w-6 h-6 text-teal-500" />
                リアルタイム回答受信中...
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {responses.map((r, i) => (
                  <div
                    key={i}
                    className={`bg-white p-6 rounded-2xl shadow-md border-l-4 ${r.role === 'manager' ? 'border-l-indigo-500' : 'border-l-teal-500'} relative overflow-hidden animate-in zoom-in fade-in slide-in-from-bottom-2 duration-500`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${r.role === 'manager' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'}`}>
                        {r.participant}
                      </span>
                      <span className="text-xs font-mono text-gray-400">{r.hero}</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">As is (現状)</p>
                        <p className="font-medium text-gray-800">"{r.asIs}"</p>
                      </div>
                      {r.solution && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Solution</p>
                          <p className="text-sm text-gray-600">{r.solution}</p>
                        </div>
                      )}
                    </div>
                    {/* Simulated Vulnerability Scorer */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-red-400 font-semibold">Honesty Signal</span>
                      <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-400"
                          style={{ width: r.vulnerability.includes('100%') ? '100%' : r.vulnerability.includes('20%') ? '20%' : '40%' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {(currentStep.showStats || currentStep.showAnalysis) && (
            <div className="h-full flex flex-col animate-in fade-in duration-700">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span className="text-3xl">📊</span>
                  {currentStep.showAnalysis ? "AI Analysis Result" : "Realtime Stats"}
                </h2>
                {!currentStep.showAnalysis && (
                  <span className="animate-pulse text-teal-500 font-bold bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                    Calculating...
                  </span>
                )}
              </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border shadow-sm flex-1 overflow-y-auto">
                <AnalysisDisplay
                  analysis={currentStep.showAnalysis ? MOCK_ANALYSIS : undefined}
                  stats={MOCK_STATS}
                  onSelectQuestion={() => { }}
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
