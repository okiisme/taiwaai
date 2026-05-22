"use client"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, RotateCcw, Pause, Maximize2, Minimize2, Users, ArrowRight } from "@/components/icons"
import { AnalysisDisplay } from "@/app/dashboard/workshops/[id]/facilitate/analysis-display"
import type { LocalAnalysisStats, AnalysisResult } from "@/lib/types"
import { QRCodeSVG } from "qrcode.react"

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_STATS: LocalAnalysisStats = {
  warmth: 38,
  heroScores: { hope: 82, efficacy: 38, resilience: 35, optimism: 50 },
  focusTags: { mindset: 65, process: 20, environment: 15 },
  responseCount: 4,
  roi: 2.4,
}

const MOCK_ANALYSIS: AnalysisResult = {
  overallSummary: {
    title: "「希望の空回り」— 熱量はあるのに現場が動かない構造的断絶",
    description:
      "マネージャーの高い希望(Hope: 82%)に対し、メンバーの実行効力感(Efficacy: 38%)が著しく低い状態です。「もっとやる気を持て」という精神論と「まず仕組みを変えてくれ」という構造論が平行線をたどっており、対話量は増えても質が伴わないまま疲弊が進んでいます。このままでは「言っても無駄」という諦めがチーム全体に定着するリスクがあります。",
  },
  warmth: 38,
  consensus: [
    "「チームをもっと良くしたい」という気持ちは全員が共有している",
    "現状に不満・課題感があることは誰もが認めている",
    "変化が必要だという認識は一致している",
  ],
  conflicts: [
    "マネージャー：「メンバーの当事者意識・主体性の問題」と認識",
    "メンバー：「失敗が許容されない評価制度と環境の問題」と認識",
    "解決策の方向性が精神論(Manager) vs 制度改革(Member)で根本的に噛み合っていない",
  ],
  structuralBridge: {
    missingLink:
      "「気持ちの問題」ではなく「失敗しても安全な具体的ルールとリソース配分」の整備が根本的に欠けている。心理的安全性の土台なしに主体性は生まれない。",
    bridgeBalance: "Mindset偏重（マネージャー側の解決策アプローチに強く偏っている）",
  },
  discussionPoints: [
    "「主体性がない」と感じる具体的な場面・行動はどんな状況か？",
    "「失敗してはいけない空気」はどこから来ているのか、誰がそれを作っているか？",
    "評価されなくても自分がやりたいと思える仕事とはどんなものか？",
  ],
  sentiment: { positive: 18, neutral: 27, negative: 55 },
  tags: MOCK_STATS.focusTags,
  cognitiveDissonance: {
    pointsOfFriction: [
      "マネージャー「指示待ちが多く自走しない」⇔ メンバー「何を言っても変わらないと学習した結果」",
      "マネージャー「意識改革・マインドセット研修が必要」⇔ メンバー「評価制度と承認プロセスを変えてほしい」",
      "マネージャー「失敗を恐れずチャレンジを」⇔ メンバー「実際に失敗したら評価が下がった経験がある」",
    ],
    discussionTopics: [
      "メンバーが「言っても無駄」と感じた具体的な経験を1つ共有してもらい、その場で一緒に振り返る",
      "「失敗しても評価が下がらない条件」を明文化し、まず小さな実験として合意できるか話し合う",
      "マネージャーが「主体性がある」と感じた瞬間の具体例を挙げ、メンバーとギャップを確認する",
    ],
    lemonMarketRisk:
      "高リスク — 本音度が平均38%と低く、面従腹背が定着しつつある状態。このままでは本音が失われ建前だけが残る「対話の形骸化」が加速します。",
  },
  heroInsight: {
    parameterAnalysis:
      "Hope(82%)とEfficacy(38%)のギャップが44ptと非常に大きい。「理想は高いが自分たちには実現できない」という学習性無力感の典型パターン。Resilience(35%)も低く、1度の失敗で挽回できないと感じているシグナルです。Optimism(50%)は中程度で、まだ諦め切っていない段階——今が介入の最適タイミングです。",
    strength:
      "マネージャーを中心に未来への強い希望(Hope)があり、チームを良くしたいという意志は本物。この熱量を「精神論」から「構造改革」へ向け直すことができれば、大きな変化の起爆剤になれます。",
    scores: MOCK_STATS.heroScores,
  },
  interventionQuestions: {
    mutualUnderstanding:
      "メンバーが「やりたくてもできない」と感じている具体的な物理的・制度的な障壁は何だと思いますか？（マネージャーへ）",
    suspendedJudgment:
      "もし「失敗しても評価が一切下がらない」としたら、まず何を変えてみたいですか？（メンバーへ）",
    smallAgreement:
      "「意識を変えずに、仕組みだけで解決できること」を、明日から1つだけ試してみませんか？（全員へ）",
  },
  keyFindings: [
    "Hope-Efficacyギャップ 44pt：理想と実行力の乖離が深刻なレベル",
    "本音度 平均38%：面従腹背リスクが高く、表面的な合意が危険",
    "解決策の65%がMindset偏重：構造・環境の改善視点が著しく少ない",
    "抵抗感 平均72%：この内容を共有することへの不安が非常に強い",
  ],
  roiScore: 62,
}

// ─── Demo Script ─────────────────────────────────────────────────────────────

const DEMO_SCRIPT = [
  {
    stage: "intro",
    title: "TAIWA AI — デモンストレーション",
    duration: 3500,
    narration: {
      headline: "TAIWA AI とは？",
      body: "チームの「見えない本音」を可視化し、対話の質を変えるAIファシリテーターです。ワークショップ形式で参加者が匿名入力した回答をAIが構造分析し、ファシリテーターに「次の問い」を提案します。",
      points: ["📱 参加者はスマホから匿名で回答", "📊 リアルタイムで本音度・HERO指標を可視化", "🤖 AIが認識のズレと介入の問いを生成"],
    },
  },
  {
    stage: "participants-join",
    title: "Step 1 — 匿名参加",
    duration: 4500,
    participants: [
      { name: "マネージャーA", role: "manager", joinTime: 600, avatar: "👔" },
      { name: "メンバーB", role: "member", joinTime: 1400, avatar: "👩‍💻" },
      { name: "メンバーC", role: "member", joinTime: 2200, avatar: "👨‍💻" },
      { name: "メンバーD", role: "member", joinTime: 3000, avatar: "🤔" },
    ],
    narration: {
      headline: "なぜ「匿名」なのか？",
      body: "心理的安全性が低い環境では、人は本音を言わず建前で回答します。QRコード1つで匿名参加できる設計により、役職や人間関係のプレッシャーなしに本音を引き出します。",
      points: [
        "🔒 名前・顔出し不要でスマホからアクセス",
        "🎯 役職フィルターなしで生の声を収集",
        "⚡ リアルタイムで参加状況をファシリテーターが確認",
      ],
    },
  },
  {
    stage: "responses-coming",
    title: "Step 2 — 4ステップ入力",
    duration: 6000,
    responses: [
      {
        participant: "マネージャーA", role: "manager",
        asIs: "メンバーの主体性が足りず、指示待ちになっている",
        toBe: "全員が当事者意識を持って自走するチーム",
        solution: "意識改革・マインドセット研修を実施する",
        honesty: 95, resistance: 12,
        hero: { hope: 90, efficacy: 80, resilience: 65, optimism: 70 },
        time: 600,
      },
      {
        participant: "メンバーB", role: "member",
        asIs: "何を言っても変わらない空気があって諦めている",
        toBe: "失敗しても責められない心理的安全性のあるチーム",
        solution: "失敗を許容する評価制度のルール化",
        honesty: 22, resistance: 88,
        hero: { hope: 38, efficacy: 20, resilience: 28, optimism: 32 },
        time: 1800,
      },
      {
        participant: "メンバーC", role: "member",
        asIs: "理想ばかり語られて現場が疲弊している",
        toBe: "具体的なリソースと権限が与えられた環境",
        solution: "意思決定の権限移譲と予算配分の見直し",
        honesty: 38, resistance: 75,
        hero: { hope: 50, efficacy: 32, resilience: 38, optimism: 45 },
        time: 3200,
      },
      {
        participant: "メンバーD", role: "member",
        asIs: "入力中...", toBe: "", solution: "",
        honesty: 0, resistance: 0, hero: null,
        time: 4800, typing: true,
      },
    ],
    narration: {
      headline: "4ステップ構造化入力",
      body: "「なんとなく不満」を構造化することで、AIが分析しやすいデータになります。感情ではなく事実と理想を分けて入力することで、認識のズレが数値として可視化されます。",
      points: [
        "⚡ Step1: エネルギーレベル（今の状態チェック）",
        "📝 Step2: As-Is / To-Be / Solution（思考の構造化）",
        "🦸 Step3: HERO心理資本（Hope/Efficacy/Resilience/Optimism）",
        "💬 Step4: 本音度 & 抵抗感（どのくらい正直に答えたか）",
      ],
    },
  },
  {
    stage: "realtime-analysis",
    title: "Step 3 — リアルタイム集計",
    duration: 4000,
    narration: {
      headline: "AIを待たずに即座に可視化",
      body: "回答が集まるたびにリアルタイムで集計されます。「本音度が低い」「抵抗感が高い」といった指標が見えることで、ファシリテーターが場のコンディションを把握し、対話の進め方を調整できます。",
      points: [
        "💬 本音度：どれだけ正直に答えたかの平均",
        "😰 抵抗感：共有することへの不安の強さ",
        "🦸 HERO：チームの心理資本の現在地",
        "🎯 解決策比重：Mindset/Process/Environmentの偏り",
      ],
    },
  },
  {
    stage: "ai-insight",
    title: "Step 4 — AI構造分析",
    duration: 12000,
    narration: {
      headline: "AIが「語られない本音」を読む",
      body: "全参加者の回答を横断的に分析し、「誰と誰の認識がどうズレているか」「次にどんな問いを投げかけるべきか」をAIが提案します。ファシリテーターはこれを見ながら対話を進めます。",
      points: [
        "🔍 認識のズレ（Friction）を具体的に特定",
        "🦸 HEROスコアで心理状態の構造を把握",
        "💡 3種類の介入の問い（Intervention Questions）を提示",
        "⚠️ 対話不全リスク（レモン市場化）を警告",
      ],
    },
  },
]

// ─── Mobile Wizard Mock ───────────────────────────────────────────────────────

function TypingText({ text, speed = 40 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)
  useEffect(() => {
    setDisplayed("")
    setDone(false)
    let i = 0
    const timer = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { clearInterval(timer); setDone(true) }
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed])
  return (
    <span>
      {displayed}
      {!done && <span className="inline-block w-0.5 h-3 bg-slate-500 animate-pulse ml-0.5 align-middle" />}
    </span>
  )
}

function AnimatedSlider({ value, color }: { value: number; color: string }) {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    let v = 0
    const timer = setInterval(() => {
      v = Math.min(v + 3, value)
      setCurrent(v)
      if (v >= value) clearInterval(timer)
    }, 20)
    return () => clearInterval(timer)
  }, [value])
  return (
    <div className="bg-slate-200 h-2 rounded-full relative">
      <div className={`absolute top-0 left-0 h-full ${color} rounded-full transition-all`} style={{ width: `${current}%` }} />
      <div className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 bg-white rounded-full shadow border border-slate-200 transition-all" style={{ left: `calc(${current}% - 7px)` }} />
    </div>
  )
}

function MockMobileClient({ step }: { step: number }) {
  return (
    <div className="w-[270px] h-[560px] bg-slate-900 rounded-[3rem] border-[7px] border-slate-800 shadow-2xl overflow-hidden relative mx-auto">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-800 rounded-b-2xl z-20" />
      <div className="h-full w-full bg-gradient-to-br from-teal-50 via-lime-50 to-cyan-50 pt-9 px-3.5 pb-3 flex flex-col overflow-hidden">
        {/* Progress */}
        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-teal-500" : "bg-gray-200"}`} />
          ))}
          <span className="text-[9px] text-gray-400 ml-1 font-bold">{step}/4</span>
        </div>

        {/* Current question */}
        <div className="bg-slate-900 text-white rounded-xl p-2.5 mb-3">
          <p className="text-[8px] font-bold text-teal-400 uppercase tracking-widest mb-0.5">今回の問い</p>
          <p className="text-[10px] font-bold leading-snug">チームの主体性を高めるために、あなたが感じる最大の障壁は？</p>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="flex-1 flex flex-col">
            <p className="text-[11px] font-bold text-slate-700 mb-0.5">① 今のコンディション</p>
            <p className="text-[9px] text-slate-500 mb-3">正直な今の状態を教えてください</p>
            <p className="text-[9px] font-bold text-slate-600 mb-1.5">エネルギーレベル</p>
            <div className="flex text-base justify-between px-0.5 mb-1"><span>💤</span><span>😐</span><span>🔥</span></div>
            <AnimatedSlider value={72} color="bg-yellow-400" />
            <p className="text-[10px] font-black text-yellow-600 text-center mt-1">72%</p>
            <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
              <p className="text-[9px] text-yellow-700 font-medium">⚡ やや高め。積極的に発言できる状態です</p>
            </div>
            <div className="mt-auto pt-2">
              <div className="w-full h-9 bg-gradient-to-r from-teal-500 to-lime-500 rounded-xl flex items-center justify-center text-white text-[11px] font-bold">次へ →</div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <p className="text-[11px] font-bold text-slate-700 mb-0.5">② 思考の構造化</p>
            <p className="text-[9px] text-slate-500 mb-2">事実と理想を分けて考えましょう</p>
            <div className="space-y-1.5 flex-1 overflow-hidden">
              <div className="p-2 bg-red-50 rounded-lg border-l-[3px] border-red-400">
                <span className="text-[8px] font-bold text-red-500 uppercase tracking-wider block mb-0.5">As-Is（現状の事実）</span>
                <p className="text-[10px] text-slate-700 font-medium leading-snug">
                  <TypingText text="何を言っても変わらない空気があって諦めている" speed={35} />
                </p>
              </div>
              <div className="p-2 bg-teal-50 rounded-lg border-l-[3px] border-teal-400">
                <span className="text-[8px] font-bold text-teal-500 uppercase tracking-wider block mb-0.5">To-Be（理想の状態）</span>
                <p className="text-[10px] text-slate-700 font-medium leading-snug">失敗しても責められない安全なチーム</p>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg border-l-[3px] border-orange-400 h-14">
                <span className="text-[8px] font-bold text-orange-500 uppercase tracking-wider block mb-0.5">Solution（解決策）</span>
                <p className="text-[10px] text-slate-400 animate-pulse">入力中...</p>
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full h-9 bg-gradient-to-r from-teal-500 to-lime-500 rounded-xl flex items-center justify-center text-white text-[11px] font-bold">次へ →</div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="flex-1 flex flex-col">
            <p className="text-[11px] font-bold text-slate-700 mb-0.5">③ HERO 心理資本</p>
            <p className="text-[9px] text-slate-500 mb-2.5">この課題への感覚（直感で答えてください）</p>
            <div className="space-y-2.5">
              {[
                { label: "Hope（希望）", val: 38, col: "bg-teal-500", desc: "改善できると思う？" },
                { label: "Efficacy（効力感）", val: 20, col: "bg-indigo-500", desc: "自分が変えられると思う？" },
                { label: "Resilience（回復力）", val: 28, col: "bg-orange-500", desc: "失敗しても立ち直れる？" },
                { label: "Optimism（楽観性）", val: 32, col: "bg-lime-500", desc: "最終的には良くなると思う？" },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-[9px] font-bold mb-0.5 text-slate-600">
                    <span>{item.label}</span><span className="text-slate-400">{item.val}%</span>
                  </div>
                  <AnimatedSlider value={item.val} color={item.col} />
                </div>
              ))}
            </div>
            <div className="mt-auto pt-2.5">
              <div className="w-full h-9 bg-gradient-to-r from-teal-500 to-lime-500 rounded-xl flex items-center justify-center text-white text-[11px] font-bold">次へ →</div>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="flex-1 flex flex-col">
            <p className="text-[11px] font-bold text-slate-700 mb-0.5">④ 本音度 & 抵抗感</p>
            <p className="text-[9px] text-slate-500 mb-3">正直に答えてください（本当の気持ち）</p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[9px] font-bold mb-0.5 text-slate-600">
                  <span>💬 本音度</span><span className="text-red-500">22%</span>
                </div>
                <p className="text-[8px] text-slate-400 mb-1">今の回答、どれくらい本音ですか？</p>
                <AnimatedSlider value={22} color="bg-red-400" />
                <p className="text-[8px] text-red-600 font-medium mt-1">⚠️ かなり建前が混じっています</p>
              </div>
              <div>
                <div className="flex justify-between text-[9px] font-bold mb-0.5 text-slate-600">
                  <span>😰 抵抗感</span><span className="text-orange-500">88%</span>
                </div>
                <p className="text-[8px] text-slate-400 mb-1">この内容を共有することへの不安は？</p>
                <AnimatedSlider value={88} color="bg-orange-400" />
                <p className="text-[8px] text-orange-600 font-medium mt-1">⚠️ 共有することに強い抵抗を感じています</p>
              </div>
            </div>
            <div className="mt-auto pt-2.5">
              <div className="w-full h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white text-[11px] font-bold animate-pulse">
                📤 回答を送信する
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Realtime Stats ───────────────────────────────────────────────────────────

function RealtimeStatsDisplay() {
  const avgHonesty = 38
  const avgResistance = 72
  const avgEnergy = 64
  const hero = MOCK_STATS.heroScores

  return (
    <div className="space-y-5 animate-in fade-in duration-700">
      {/* Meta badges */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "💬 本音度", val: avgHonesty, color: "text-red-700 bg-red-50 border-red-200", alert: true },
          { label: "😰 抵抗感", val: avgResistance, color: "text-orange-700 bg-orange-50 border-orange-200", alert: true },
          { label: "🔥 エネルギー", val: avgEnergy, color: "text-yellow-700 bg-yellow-50 border-yellow-200", alert: false },
        ].map(b => (
          <div key={b.label} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm ${b.color}`}>
            {b.label} <span className="text-xl font-black">{b.val}%</span>
          </div>
        ))}
      </div>

      {/* Alert */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-sm">
        ⚠️ <span><strong>建前モードの可能性。</strong> 本音度38%は低く、面従腹背リスクがあります。対話の前に場の安心感づくりを推奨します。</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* HERO */}
        <Card className="p-4 rounded-2xl bg-white border border-gray-100">
          <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">🦸 HERO 心理資本（チーム平均）</p>
          <div className="space-y-2.5">
            {[
              { label: "Hope（希望）", val: hero.hope, col: "bg-teal-400" },
              { label: "Efficacy（効力感）", val: hero.efficacy, col: "bg-indigo-400" },
              { label: "Resilience（回復力）", val: hero.resilience, col: "bg-orange-400" },
              { label: "Optimism（楽観性）", val: hero.optimism, col: "bg-lime-400" },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-gray-600 font-medium">{item.label}</span>
                  <span className={`font-black ${item.val < 50 ? "text-red-500" : "text-gray-700"}`}>{item.val}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.col} rounded-full`} style={{ width: `${item.val}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-red-600 font-semibold mt-3">⚠️ Hope-Efficacy ギャップ 44pt — 希望はあるが実行力が伴っていない</p>
        </Card>

        {/* Focus tags */}
        <Card className="p-4 rounded-2xl bg-white border border-gray-100">
          <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">🎯 解決策の観点 比重</p>
          <div className="space-y-2.5">
            {[
              { label: "Mindset（意識改革）", val: MOCK_STATS.focusTags.mindset, col: "bg-purple-400" },
              { label: "Process（仕組み）", val: MOCK_STATS.focusTags.process, col: "bg-blue-400" },
              { label: "Environment（環境）", val: MOCK_STATS.focusTags.environment, col: "bg-green-400" },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-gray-600 font-medium">{item.label}</span>
                  <span className="font-black text-gray-700">{item.val}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.col} rounded-full`} style={{ width: `${item.val}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-purple-700 font-semibold mt-3">⚠️ Mindset偏重 — 「意識の問題」という認識が支配的。構造的解決策が少ない。</p>

          {/* Response count */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">回答済み</span>
              <div className="flex gap-1">
                {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">{i}</div>)}
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-[10px] animate-pulse">...</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ─── Narration Panel ──────────────────────────────────────────────────────────

function NarrationPanel({ narration }: { narration: { headline: string; body: string; points: string[] } }) {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1.5">解説</p>
        <h3 className="text-base font-black leading-snug">{narration.headline}</h3>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed">{narration.body}</p>
      <ul className="space-y-2">
        {narration.points.map((pt, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-slate-200 leading-snug">
            <span className="shrink-0">{pt}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

type DemoResponse = {
  participant: string; role: string
  asIs: string; toBe: string; solution: string
  honesty: number; resistance: number
  hero: { hope: number; efficacy: number; resilience: number; optimism: number } | null
  time: number; typing?: boolean
}

export function InteractiveDemo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [participants, setParticipants] = useState<{ name: string; role: string; avatar: string; joinTime: number }[]>([])
  const [responses, setResponses] = useState<DemoResponse[]>([])
  const [speed, setSpeed] = useState(1)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [mobileStep, setMobileStep] = useState(1)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  const currentStep = DEMO_SCRIPT[currentStepIndex]

  useEffect(() => {
    if (currentStepIndex === 0 && !isPlaying) {
      setParticipants([]); setResponses([]); setMobileStep(1)
    }
  }, [currentStepIndex, isPlaying])

  useEffect(() => {
    if (!isPlaying || isPaused) return
    let timer: NodeJS.Timeout
    let cycleTimer: NodeJS.Timeout | null = null
    const dur = currentStep.duration / speed

    if (currentStep.stage === "participants-join" && currentStep.participants && participants.length === 0) {
      currentStep.participants.forEach(p => {
        setTimeout(() => setParticipants(prev => [...prev, p]), p.joinTime / speed)
      })
    }
    if (currentStep.stage === "responses-coming" && currentStep.responses && responses.length === 0) {
      cycleTimer = setInterval(() => setMobileStep(prev => prev >= 4 ? 1 : prev + 1), 2000 / speed)
      currentStep.responses.forEach(r => {
        setTimeout(() => setResponses(prev => [...prev, r as DemoResponse]), r.time / speed)
      })
    }

    timer = setTimeout(() => {
      if (currentStepIndex < DEMO_SCRIPT.length - 1) setCurrentStepIndex(p => p + 1)
      else { setIsPlaying(false); setIsPaused(false) }
    }, dur)

    return () => { clearTimeout(timer); if (cycleTimer) clearInterval(cycleTimer) }
  }, [isPlaying, isPaused, currentStepIndex, currentStep, speed])

  const handleStart = () => {
    setIsPlaying(true); setIsPaused(false); setCurrentStepIndex(0)
    setParticipants([]); setResponses([]); setMobileStep(1)
    if (typeof window !== "undefined" && window.innerWidth > 768) setIsFullScreen(true)
  }
  const handleReset = () => {
    setIsPlaying(false); setIsPaused(false); setCurrentStepIndex(0)
    setParticipants([]); setResponses([]); setIsFullScreen(false); setMobileStep(1)
  }

  if (!isMounted) return null

  const containerClasses = isFullScreen ? "fixed inset-0 z-50 bg-slate-50 overflow-y-auto" : "relative w-full"
  const contentClasses = isFullScreen ? "min-h-screen p-6 max-w-7xl mx-auto flex flex-col" : "w-full"

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6 bg-white/90 backdrop-blur-sm p-4 rounded-2xl border shadow-sm sticky top-4 z-40">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-teal-400 to-lime-400 p-2 rounded-xl text-white shrink-0">
              {isPlaying && !isPaused ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm sm:text-base">{currentStep.title}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-400 transition-all duration-500" style={{ width: `${((currentStepIndex + 1) / DEMO_SCRIPT.length) * 100}%` }} />
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
            <Button onClick={() => setSpeed(p => p === 1 ? 1.5 : p === 1.5 ? 2 : 1)} variant="ghost" className="text-xs font-mono text-gray-500 hidden sm:flex">
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
              <Play className="w-8 h-8 mr-3 fill-current" /> デモを開始する
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-h-[520px]">

          {/* Intro */}
          {currentStep.stage === "intro" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-lime-600 mb-4 leading-tight">
                  TAIWA AI<br />Interactive Demo
                </h1>
                <p className="text-lg text-gray-500 leading-relaxed mb-6">チームの「見えない本音」を可視化し、対話の質を変えるプロセスを体験します。</p>
                {!isPlaying && isFullScreen && (
                  <Button onClick={handleStart} size="lg" className="bg-black text-white rounded-full px-8">スタート</Button>
                )}
              </div>
              {"narration" in currentStep && <NarrationPanel narration={currentStep.narration} />}
            </div>
          )}

          {/* Participants joining */}
          {currentStep.stage === "participants-join" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full items-start animate-in fade-in duration-500">
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-gray-100 flex flex-col items-center text-center">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">参加用QRコード</h3>
                  <div className="bg-white p-3 rounded-xl shadow-inner border mb-3">
                    <QRCodeSVG value="https://taiwaai-livid.vercel.app/join/demo" size={180} />
                  </div>
                  <p className="text-xs text-gray-400">スキャンするだけ。アカウント不要。</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2"><Users className="w-5 h-5" /> 入室状況</h3>
                  <div className="space-y-3">
                    {participants.map((p, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-2xl">{p.avatar}</div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800 text-sm">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.role === "manager" ? "マネージャー" : "メンバー"}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          <span className="text-xs text-green-600 font-semibold">参加済み</span>
                        </div>
                      </div>
                    ))}
                    {participants.length < 4 && (
                      <div className="flex items-center gap-2 text-sm text-gray-400 italic p-3">
                        <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" /> 参加待ち...
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {"narration" in currentStep && <NarrationPanel narration={currentStep.narration} />}
            </div>
          )}

          {/* Responses coming */}
          {currentStep.stage === "responses-coming" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full animate-in fade-in duration-500">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-teal-500" /> ファシリテーター画面（リアルタイム）
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {responses.map((r, i) => {
                    const hColor = r.honesty >= 70 ? "bg-green-50 border-green-200 text-green-700" : r.honesty >= 40 ? "bg-yellow-50 border-yellow-200 text-yellow-700" : "bg-red-50 border-red-200 text-red-700"
                    const rColor = r.resistance < 30 ? "bg-green-50 border-green-200 text-green-700" : r.resistance <= 70 ? "bg-yellow-50 border-yellow-200 text-yellow-700" : "bg-red-50 border-red-200 text-red-700"
                    return (
                      <div key={i} className={`bg-white p-4 rounded-2xl shadow-sm border-l-4 ${r.role === "manager" ? "border-l-indigo-400" : "border-l-teal-400"} animate-in zoom-in fade-in duration-500`}>
                        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.role === "manager" ? "bg-indigo-100 text-indigo-700" : "bg-teal-100 text-teal-700"}`}>{r.participant}</span>
                          {!r.typing && (
                            <>
                              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full border ${hColor}`}>💬 {r.honesty}%</span>
                              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full border ${rColor}`}>😰 {r.resistance}%</span>
                            </>
                          )}
                        </div>
                        {r.typing ? (
                          <p className="text-sm text-gray-400 animate-pulse">入力中...</p>
                        ) : (
                          <div className="space-y-1.5">
                            <div>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">As-Is</p>
                              <p className="text-xs text-gray-800 font-medium leading-snug">{r.asIs}</p>
                            </div>
                            {r.toBe && (
                              <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">To-Be</p>
                                <p className="text-xs text-gray-600 leading-snug">{r.toBe}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {responses.length < 4 && (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center p-8 opacity-40">
                      <span className="animate-pulse text-gray-400 text-sm">待機中...</span>
                    </div>
                  )}
                </div>

                {/* Mobile mockup inline for lg */}
                <div className="hidden lg:hidden">
                  <div className="text-center mb-3">
                    <span className="bg-gray-900 text-white text-xs px-3 py-1 rounded-full">参加者の入力画面</span>
                  </div>
                  <MockMobileClient step={mobileStep} />
                </div>
              </div>

              {/* Right column: mobile + narration */}
              <div className="space-y-4">
                <div className="text-center">
                  <span className="bg-gray-900 text-white text-xs px-3 py-1 rounded-full">参加者の入力画面（スマホ）</span>
                </div>
                <MockMobileClient step={mobileStep} />
                {"narration" in currentStep && <NarrationPanel narration={currentStep.narration} />}
              </div>
            </div>
          )}

          {/* Realtime stats */}
          {currentStep.stage === "realtime-analysis" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold flex items-center gap-2">📊 リアルタイム集計</h2>
                  <span className="animate-pulse text-teal-600 font-bold bg-teal-50 px-3 py-1.5 rounded-full border border-teal-200 text-sm">AI分析を準備中...</span>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-5 border shadow-sm">
                  <RealtimeStatsDisplay />
                </div>
              </div>
              {"narration" in currentStep && <NarrationPanel narration={currentStep.narration} />}
            </div>
          )}

          {/* AI analysis */}
          {currentStep.stage === "ai-insight" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-5">🤖 AI 構造分析レポート</h2>
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-5 border shadow-sm overflow-y-auto max-h-[700px]">
                  <AnalysisDisplay analysis={MOCK_ANALYSIS} stats={MOCK_STATS} onSelectQuestion={() => {}} />
                </div>
              </div>
              {"narration" in currentStep && (
                <div className="space-y-4">
                  <NarrationPanel narration={currentStep.narration} />
                  {/* Highlight key output */}
                  <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 space-y-2">
                    <p className="text-xs font-bold text-teal-700 uppercase tracking-wider">出力される内容</p>
                    {["認識のズレ（Friction）の特定", "HEROスコアによる心理状態分析", "おすすめの介入の問い（3種類）", "対話不全リスクの警告"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-teal-800">
                        <div className="w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-[9px] shrink-0">{i + 1}</div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
