"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, RotateCcw, Pause, Maximize2, Minimize2, Users, ArrowRight } from "@/components/icons"
import { AnalysisDisplay } from "@/app/dashboard/workshops/[id]/facilitate/analysis-display"
import type { LocalAnalysisStats, AnalysisResult } from "@/lib/types"
import { QRCodeSVG } from "qrcode.react"

const MOCK_STATS: LocalAnalysisStats = {
  warmth: 38,
  heroScores: { hope: 8.2, efficacy: 3.8, resilience: 3.5, optimism: 5.0 },
  focusTags: { mindset: 65, process: 20, environment: 15 },
  responseCount: 4,
  roi: 2.4,
}

const MOCK_ANALYSIS: AnalysisResult = {
  overallSummary: {
    title: "希望と無力感の断絶 — 精神論 vs 構造論の対立",
    description: "マネージャーの高い希望(Hope: 8.2)に対し、メンバーの実行効力感(Efficacy: 3.8)が著しく低く、「理想だけが語られ、手段がない」状態。認識の前提が噛み合っていないため、対話量は増えても質が伴わないリスクがあります。",
  },
  warmth: 38,
  consensus: [
    "「チームをもっと良くしたい」という気持ちは全員が持っている",
    "現状に不満があることは共通認識として存在している",
  ],
  conflicts: [
    "マネージャーは「メンバーの意識・主体性の問題」と捉えている",
    "メンバーは「失敗が許容されない仕組みと環境の問題」と捉えている",
    "解決策がマネージャー=精神論、メンバー=具体的制度変更で全く噛み合っていない",
  ],
  structuralBridge: {
    missingLink: "『精神論』ではなく『失敗しても安全な具体的ルールとリソース』の整備が欠けている",
    bridgeBalance: "Mindset偏重（マネージャー側からのアプローチに偏っている）",
  },
  discussionPoints: [
    "「主体性がない」と感じる具体的な場面はどんな状況か？",
    "「失敗してはいけない空気」はどこから来ているのか？",
    "明日から変えられる、仕組みレベルでの一歩は何か？",
  ],
  sentiment: { positive: 20, neutral: 30, negative: 50 },
  tags: MOCK_STATS.focusTags,
  cognitiveDissonance: {
    pointsOfFriction: [
      "マネージャー「指示待ちが多い」⇔ メンバー「何を言っても変わらないから諦めた」",
      "マネージャー「意識改革が必要」⇔ メンバー「制度と評価制度を変えてほしい」",
    ],
    discussionTopics: [
      "メンバーが「言っても無駄」と感じた具体的な経験を一つ共有してもらう",
      "「失敗しても評価されない」ルールを明文化できるか話し合う",
    ],
    lemonMarketRisk: "高リスク — 認識の前提が噛み合わないまま対話が続くと、本音が失われ建前だけが残る「レモン市場化」が起きやすい状態です。",
  },
  heroInsight: {
    parameterAnalysis: "Hope(8.2)とEfficacy(3.8)のギャップが4.4ptと非常に大きく、「理想は高いが自分たちには実現できない」という学習性無力感に陥りかけています。ResilienceとOptimismも低く、1度の失敗で挽回できないと感じているシグナルです。",
    strength: "マネージャー層を中心に未来への強い希望があり、チームを良くしたいという意志は本物。この熱量を正しい方向に向けることができれば、大きな変化の起爆剤になれます。",
    scores: MOCK_STATS.heroScores,
  },
  interventionQuestions: {
    mutualUnderstanding: "メンバーが「やりたくてもできない」と感じている具体的な物理的・制度的障壁は何だと思いますか？（マネージャーへ）",
    suspendedJudgment: "もし「失敗しても評価が下がらない」としたら、まず何を変えたいですか？（メンバーへ）",
    smallAgreement: "「意識を変えずに、仕組みだけで解決できること」を明日から1つだけ試しませんか？（全員へ）",
  },
  keyFindings: [
    "Hope-Efficacyギャップ(4.4pt): 理想と手段の乖離が深刻",
    "本音度が平均40%以下 — 面従腹背リスクが高い",
    "Mindset解決策が65%を占め、環境・制度改善視点が少ない",
  ],
  roiScore: 62,
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
      { name: "マネージャーA", role: "manager", joinTime: 500, avatar: "👔" },
      { name: "メンバーB", role: "member", joinTime: 1200, avatar: "👩‍💻" },
      { name: "メンバーC", role: "member", joinTime: 1800, avatar: "👨‍💻" },
      { name: "メンバーD", role: "member", joinTime: 2400, avatar: "🤔" },
    ],
    duration: 4000,
    showQR: true,
  },
  {
    stage: "responses-coming",
    title: "3. 本音と課題の収集",
    description: "As-Is/To-Be/Solution の構造化入力と HERO・本音度をリアルタイム収集。",
    responses: [
      {
        participant: "マネージャーA",
        role: "manager",
        asIs: "メンバーの主体性が足りない",
        toBe: "全員が自走するチーム",
        honesty: 95,
        resistance: 15,
        hero: { hope: 90, efficacy: 80, resilience: 60, optimism: 70 },
        time: 500,
      },
      {
        participant: "メンバーB",
        role: "member",
        asIs: "何を言っても変わらない空気がある",
        toBe: "失敗を許容するルールが欲しい",
        honesty: 20,
        resistance: 85,
        hero: { hope: 40, efficacy: 20, resilience: 30, optimism: 35 },
        time: 1500,
      },
      {
        participant: "メンバーC",
        role: "member",
        asIs: "理想ばかり語られて疲れる",
        toBe: "リソースを増やしてほしい",
        honesty: 40,
        resistance: 75,
        hero: { hope: 50, efficacy: 30, resilience: 35, optimism: 45 },
        time: 2500,
      },
      {
        participant: "メンバーD",
        role: "member",
        asIs: "入力中...",
        toBe: "",
        honesty: 0,
        resistance: 0,
        hero: null,
        time: 3500,
        typing: true,
      },
    ],
    duration: 5000,
  },
  {
    stage: "realtime-analysis",
    title: "4. リアルタイム集計",
    description: "AIを待たずに、本音度・抵抗感・HEROスコアが即座に可視化されます。",
    showStats: true,
    duration: 3500,
  },
  {
    stage: "ai-insight",
    title: "5. AIによる構造分析",
    description: "「断絶」や「語られない本音」をAIが鋭く指摘します。",
    showAnalysis: true,
    duration: 10000,
  },
]

// Mobile wizard matching the current join page (4-step)
const MockMobileClient = ({ step }: { step: number }) => {
  const totalSteps = 4
  return (
    <div className="w-[280px] h-[580px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden relative mx-auto">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-800 rounded-b-2xl z-20" />
      <div className="h-full w-full bg-gradient-to-br from-teal-50 via-lime-50 to-cyan-50 pt-10 px-4 pb-4 flex flex-col overflow-hidden">
        {/* Progress bar */}
        <div className="flex items-center gap-1 mb-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i + 1 <= step ? "bg-teal-500" : "bg-gray-200"}`} />
          ))}
        </div>

        {/* Question card */}
        <div className="bg-slate-900 text-white rounded-xl p-3 mb-4">
          <p className="text-[9px] font-bold text-teal-400 uppercase tracking-widest mb-1">今回の問い</p>
          <p className="text-xs font-bold leading-snug">チームの主体性を高めるために、あなたが感じる最大の障壁は？</p>
        </div>

        {/* Step 1: エネルギーレベル */}
        {step === 1 && (
          <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-400">
            <h3 className="font-bold text-slate-800 text-sm mb-1">1. 今のコンディション</h3>
            <p className="text-[10px] text-slate-500 mb-4">正直な今の状態を教えてください</p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-2">
                  <span>エネルギーレベル</span>
                  <span className="text-yellow-600">72%</span>
                </div>
                <div className="flex text-lg justify-between px-1 mb-1">
                  <span>💤</span><span>😐</span><span>🔥</span>
                </div>
                <div className="bg-slate-200 h-2.5 rounded-full relative">
                  <div className="absolute top-0 left-0 h-full bg-yellow-500 rounded-full" style={{ width: "72%" }} />
                  <div className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-white rounded-full shadow border border-slate-200" style={{ left: "calc(72% - 8px)" }} />
                </div>
              </div>
            </div>
            <div className="mt-auto">
              <div className="w-full h-10 bg-gradient-to-r from-teal-500 to-lime-500 rounded-xl flex items-center justify-center text-white text-xs font-bold">
                次へ →
              </div>
            </div>
          </div>
        )}

        {/* Step 2: As-Is / To-Be / Solution */}
        {step === 2 && (
          <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-400 overflow-hidden">
            <h3 className="font-bold text-slate-800 text-sm mb-1">2. 思考の構造化</h3>
            <p className="text-[10px] text-slate-500 mb-3">事実と理想を分けて考えましょう</p>
            <div className="space-y-2 flex-1 overflow-hidden">
              <div className="p-2.5 bg-red-50 rounded-xl border-l-4 border-red-400">
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider block mb-1">As-Is (現状の事実)</span>
                <p className="text-[11px] text-slate-700 font-medium">何を言っても変わらない空気がある</p>
              </div>
              <div className="p-2.5 bg-teal-50 rounded-xl border-l-4 border-teal-400">
                <span className="text-[9px] font-bold text-teal-500 uppercase tracking-wider block mb-1">To-Be (理想の状態)</span>
                <p className="text-[11px] text-slate-700 font-medium">失敗を許容するルールがあるチーム</p>
              </div>
              <div className="p-2.5 bg-orange-50 rounded-xl border-l-4 border-orange-400 h-16">
                <span className="text-[9px] font-bold text-orange-500 uppercase tracking-wider block mb-1">Solution (行動)</span>
                <p className="text-[11px] text-slate-400 animate-pulse">入力中...</p>
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full h-10 bg-gradient-to-r from-teal-500 to-lime-500 rounded-xl flex items-center justify-center text-white text-xs font-bold">
                次へ →
              </div>
            </div>
          </div>
        )}

        {/* Step 3: HERO */}
        {step === 3 && (
          <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-400">
            <h3 className="font-bold text-slate-800 text-sm mb-1">3. HERO 心理資本</h3>
            <p className="text-[10px] text-slate-500 mb-3">この課題への感覚（直感で）</p>
            <div className="space-y-3">
              {[
                { label: "Hope (希望)", val: 40, col: "bg-teal-500" },
                { label: "Efficacy (効力感)", val: 20, col: "bg-indigo-500" },
                { label: "Resilience (回復力)", val: 30, col: "bg-orange-500" },
                { label: "Optimism (楽観性)", val: 35, col: "bg-lime-500" },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[10px] font-bold mb-1 text-slate-600">
                    <span>{item.label}</span>
                    <span className="text-slate-400">{item.val}%</span>
                  </div>
                  <div className="bg-slate-100 h-2 rounded-full relative overflow-hidden">
                    <div className={`absolute top-0 left-0 h-full ${item.col} rounded-full`} style={{ width: `${item.val}%` }} />
                    <div className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 bg-white rounded-full shadow border border-slate-200" style={{ left: `calc(${item.val}% - 7px)` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-auto pt-3">
              <div className="w-full h-10 bg-gradient-to-r from-teal-500 to-lime-500 rounded-xl flex items-center justify-center text-white text-xs font-bold">
                次へ →
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Vulnerability */}
        {step === 4 && (
          <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-400">
            <h3 className="font-bold text-slate-800 text-sm mb-1">4. 本音度 & 抵抗感</h3>
            <p className="text-[10px] text-slate-500 mb-4">正直に答えてください</p>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1 text-slate-600">
                  <span>💬 本音度</span>
                  <span className="text-red-500">20%</span>
                </div>
                <p className="text-[9px] text-slate-400 mb-2">今の回答、どのくらい本音ですか？</p>
                <div className="bg-slate-100 h-2 rounded-full relative">
                  <div className="absolute top-0 left-0 h-full bg-red-400 rounded-full" style={{ width: "20%" }} />
                  <div className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 bg-white rounded-full shadow border border-slate-200" style={{ left: "calc(20% - 7px)" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1 text-slate-600">
                  <span>😰 抵抗感</span>
                  <span className="text-orange-500">85%</span>
                </div>
                <p className="text-[9px] text-slate-400 mb-2">この内容を共有することへの抵抗は？</p>
                <div className="bg-slate-100 h-2 rounded-full relative">
                  <div className="absolute top-0 left-0 h-full bg-orange-400 rounded-full" style={{ width: "85%" }} />
                  <div className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 bg-white rounded-full shadow border border-slate-200" style={{ left: "calc(85% - 7px)" }} />
                </div>
              </div>
            </div>
            <div className="mt-auto pt-3">
              <div className="w-full h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xs font-bold animate-pulse">
                回答を送信 →
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Real-time stats display for stage 4
const RealtimeStatsDisplay = () => {
  const avgHonesty = 38
  const avgResistance = 70
  const avgEnergy = 62
  const hero = MOCK_STATS.heroScores

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Meta badges */}
      <div className="flex flex-wrap gap-3 justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold text-red-700 bg-red-50 border-red-200">
          💬 本音度 <span className="text-xl font-black">{avgHonesty}%</span>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold text-orange-700 bg-orange-50 border-orange-200">
          😰 抵抗感 <span className="text-xl font-black">{avgResistance}%</span>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold text-yellow-700 bg-yellow-50 border-yellow-200">
          🔥 エネルギー <span className="text-xl font-black">{avgEnergy}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Alert */}
        <div className="col-span-2 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-sm">
          ⚠️ <span><strong>建前モードの可能性。</strong> 本音度38%は低く、面従腹背リスクがあります。</span>
        </div>

        {/* HERO scores */}
        <Card className="p-4 rounded-2xl bg-white border border-gray-100">
          <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">HERO 心理資本 (チーム平均)</p>
          <div className="space-y-2">
            {[
              { label: "Hope", val: Math.round(hero.hope * 10), col: "bg-teal-400" },
              { label: "Efficacy", val: Math.round(hero.efficacy * 10), col: "bg-indigo-400" },
              { label: "Resilience", val: Math.round(hero.resilience * 10), col: "bg-orange-400" },
              { label: "Optimism", val: Math.round(hero.optimism * 10), col: "bg-lime-400" },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="font-medium text-gray-600">{item.label}</span>
                  <span className="font-bold text-gray-700">{item.val}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.col} rounded-full`} style={{ width: `${item.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Focus tags */}
        <Card className="p-4 rounded-2xl bg-white border border-gray-100">
          <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">解決策の観点 比重</p>
          <div className="space-y-2">
            {[
              { label: "Mindset (意識)", val: MOCK_STATS.focusTags.mindset, col: "bg-purple-400" },
              { label: "Process (仕組み)", val: MOCK_STATS.focusTags.process, col: "bg-blue-400" },
              { label: "Environment (環境)", val: MOCK_STATS.focusTags.environment, col: "bg-green-400" },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="font-medium text-gray-600">{item.label}</span>
                  <span className="font-bold text-gray-700">{item.val}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.col} rounded-full`} style={{ width: `${item.val}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-orange-600 font-semibold mt-3">⚠️ Mindset偏重 — 構造的解決策が少ない</p>
        </Card>
      </div>
    </div>
  )
}

type DemoResponse = {
  participant: string
  role: string
  asIs: string
  toBe: string
  honesty: number
  resistance: number
  hero: { hope: number; efficacy: number; resilience: number; optimism: number } | null
  time: number
  typing?: boolean
}

export function InteractiveDemo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [participants, setParticipants] = useState<{ name: string; role: string; avatar: string }[]>([])
  const [responses, setResponses] = useState<DemoResponse[]>([])
  const [speed, setSpeed] = useState(1)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [mobileStep, setMobileStep] = useState(1)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  const currentStep = DEMO_SCRIPT[currentStepIndex]

  useEffect(() => {
    if (currentStepIndex === 0 && !isPlaying) {
      setParticipants([])
      setResponses([])
      setMobileStep(1)
    }
  }, [currentStepIndex, isPlaying])

  useEffect(() => {
    if (!isPlaying || isPaused) return

    let timer: NodeJS.Timeout
    let cycleTimer: NodeJS.Timeout | null = null
    const stepDuration = currentStep.duration / speed

    if (currentStep.stage === "participants-join" && currentStep.participants) {
      if (participants.length === 0) {
        currentStep.participants.forEach(p => {
          setTimeout(() => { setParticipants(prev => [...prev, p]) }, p.joinTime / speed)
        })
      }
    }

    if (currentStep.stage === "responses-coming" && currentStep.responses) {
      if (responses.length === 0) {
        const cycleInterval = 1800 / speed
        cycleTimer = setInterval(() => {
          setMobileStep(prev => prev >= 4 ? 1 : prev + 1)
        }, cycleInterval)
        currentStep.responses.forEach(r => {
          setTimeout(() => { setResponses(prev => [...prev, r as DemoResponse]) }, r.time / speed)
        })
      }
    }

    timer = setTimeout(() => {
      if (currentStepIndex < DEMO_SCRIPT.length - 1) {
        setCurrentStepIndex(prev => prev + 1)
      } else {
        setIsPlaying(false)
        setIsPaused(false)
      }
    }, stepDuration)

    return () => {
      clearTimeout(timer)
      if (cycleTimer) clearInterval(cycleTimer)
    }
  }, [isPlaying, isPaused, currentStepIndex, currentStep, speed])

  const handleStart = () => {
    setIsPlaying(true)
    setIsPaused(false)
    setCurrentStepIndex(0)
    setParticipants([])
    setResponses([])
    if (window.innerWidth > 768) setIsFullScreen(true)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentStepIndex(0)
    setParticipants([])
    setResponses([])
    setIsFullScreen(false)
    setMobileStep(1)
  }

  const handleSpeedChange = () => {
    setSpeed(prev => {
      if (prev === 1) return 1.5
      if (prev === 1.5) return 2
      return 1
    })
  }

  if (!isMounted) return null

  const containerClasses = isFullScreen ? "fixed inset-0 z-50 bg-slate-50 overflow-y-auto" : "relative w-full"
  const contentClasses = isFullScreen ? "min-h-screen p-8 max-w-7xl mx-auto flex flex-col" : "w-full"

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>

        {/* Controls bar */}
        <div className="flex items-center justify-between mb-6 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border shadow-sm sticky top-4 z-40">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-teal-400 to-lime-400 p-2 rounded-xl text-white">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm sm:text-base">{currentStep.title}</h3>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-400 transition-all duration-300" style={{ width: `${((currentStepIndex + 1) / DEMO_SCRIPT.length) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-400">{currentStepIndex + 1}/{DEMO_SCRIPT.length}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isPlaying && (
              <Button onClick={() => setIsPaused(p => !p)} variant="ghost" size="icon" className="text-gray-500">
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </Button>
            )}
            <Button onClick={handleSpeedChange} variant="ghost" className="text-xs font-mono text-gray-500 hidden sm:flex">
              {speed}x
            </Button>
            <Button onClick={() => setIsFullScreen(f => !f)} variant="ghost" size="icon" className="text-gray-500">
              {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm" className="rounded-xl hidden sm:flex">
              <RotateCcw className="w-4 h-4 mr-1" /> Reset
            </Button>
          </div>
        </div>

        {/* Start overlay */}
        {!isFullScreen && !isPlaying && currentStepIndex === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-3xl">
            <Button onClick={handleStart} size="lg" className="bg-gradient-to-r from-teal-400 to-lime-400 text-white font-bold text-xl px-12 py-8 rounded-full shadow-2xl hover:scale-105 transition-transform">
              <Play className="w-8 h-8 mr-3 fill-current" />
              デモを開始する
            </Button>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col relative min-h-[500px]">

          {/* Intro */}
          {currentStep.stage === "intro" && (
            <div className="flex flex-col items-center justify-center text-center h-full my-auto py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-lime-600 mb-6 leading-tight">
                TAIWA AI<br />Interactive Demo
              </h1>
              <p className="text-xl md:text-2xl text-gray-500 max-w-2xl">{currentStep.description}</p>
              {!isPlaying && isFullScreen && (
                <Button onClick={handleStart} size="lg" className="mt-12 bg-black text-white rounded-full px-8">スタート</Button>
              )}
            </div>
          )}

          {/* Participants joining */}
          {currentStep.stage === "participants-join" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full my-auto animate-in fade-in duration-500">
              <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-gray-100 flex flex-col items-center text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-4">参加用QRコード</h3>
                <div className="bg-white p-4 rounded-xl shadow-inner border">
                  <QRCodeSVG value="https://taiwaai-livid.vercel.app/join/demo" size={200} />
                </div>
                <p className="mt-4 text-sm text-gray-400">スマートフォンでスキャンして参加</p>
              </div>
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-700 flex items-center gap-3">
                  <Users className="w-6 h-6" /> 参加者 ({participants.length})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {participants.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="text-3xl">{p.avatar}</div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{p.name}</p>
                        <p className="text-xs text-gray-500 uppercase font-semibold">{p.role}</p>
                      </div>
                      <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    </div>
                  ))}
                  {participants.length === 0 && <p className="text-gray-400 italic col-span-2 text-sm">待機中...</p>}
                </div>
              </div>
            </div>
          )}

          {/* Responses coming (split: dashboard + mobile) */}
          {currentStep.stage === "responses-coming" && (
            <div className="h-full flex flex-col md:flex-row gap-8 animate-in fade-in duration-500">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-teal-500" />
                  ファシリテーション画面（リアルタイム）
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {responses.map((r, i) => {
                    const honestyColor = r.honesty >= 70 ? "text-green-700 bg-green-50 border-green-200" : r.honesty >= 40 ? "text-yellow-700 bg-yellow-50 border-yellow-200" : "text-red-700 bg-red-50 border-red-200"
                    const resistanceColor = r.resistance < 30 ? "text-green-700 bg-green-50 border-green-200" : r.resistance <= 70 ? "text-yellow-700 bg-yellow-50 border-yellow-200" : "text-red-700 bg-red-50 border-red-200"
                    return (
                      <div key={i} className={`bg-white p-4 rounded-2xl shadow-md border-l-4 ${r.role === "manager" ? "border-l-indigo-500" : "border-l-teal-500"} animate-in zoom-in fade-in slide-in-from-bottom-2 duration-500`}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.role === "manager" ? "bg-indigo-100 text-indigo-700" : "bg-teal-100 text-teal-700"}`}>
                            {r.participant}
                          </span>
                          {!r.typing && (
                            <>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${honestyColor}`}>💬 {r.honesty}%</span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${resistanceColor}`}>😰 {r.resistance}%</span>
                            </>
                          )}
                        </div>
                        {r.typing ? (
                          <p className="text-sm text-gray-400 animate-pulse">入力中...</p>
                        ) : (
                          <div className="space-y-1.5">
                            <div>
                              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">As-Is</p>
                              <p className="text-sm text-gray-800 font-medium">"{r.asIs}"</p>
                            </div>
                            {r.toBe && (
                              <div>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">To-Be</p>
                                <p className="text-sm text-gray-600">"{r.toBe}"</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center p-8 opacity-50">
                    <span className="animate-pulse text-gray-400 text-sm">待機中...</span>
                  </div>
                </div>
              </div>

              {/* Mobile mockup */}
              <div className="w-full md:w-[300px] shrink-0 border-l pl-8 border-gray-100 hidden md:block">
                <div className="text-center mb-4">
                  <span className="bg-gray-900 text-white text-xs px-3 py-1 rounded-full">参加者の入力画面</span>
                </div>
                <MockMobileClient step={mobileStep} />
              </div>
            </div>
          )}

          {/* Realtime stats */}
          {currentStep.stage === "realtime-analysis" && (
            <div className="h-full flex flex-col animate-in fade-in duration-700">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span className="text-3xl">📊</span> リアルタイム集計
                </h2>
                <span className="animate-pulse text-teal-600 font-bold bg-teal-50 px-3 py-1 rounded-full border border-teal-200 text-sm">
                  AI分析を準備中...
                </span>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border shadow-sm flex-1 overflow-y-auto">
                <RealtimeStatsDisplay />
              </div>
            </div>
          )}

          {/* AI analysis */}
          {currentStep.stage === "ai-insight" && (
            <div className="h-full flex flex-col animate-in fade-in duration-700">
              <div className="mb-6 flex items-center gap-2">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span className="text-3xl">🤖</span> AI 構造分析レポート
                </h2>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border shadow-sm flex-1 overflow-y-auto">
                <AnalysisDisplay
                  analysis={MOCK_ANALYSIS}
                  stats={MOCK_STATS}
                  onSelectQuestion={() => {}}
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
