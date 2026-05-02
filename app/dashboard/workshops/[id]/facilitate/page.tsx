"use client"
import React, { useState, useEffect, useCallback } from "react"
import { AnalysisDisplay } from "./analysis-display"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  Sparkles,
  TrendingUp,
  BarChart,
  ArrowRight,
  CheckCircle,
  Download,
  MessageCircle,
  Lightbulb,
  AlertCircle,
  GitBranch,
  Unplug,
  Target,
  Zap,
} from "@/components/icons"
import type { WorkshopSession, LocalAnalysisStats } from "@/lib/types"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts"
import { ErrorBoundary } from "react-error-boundary"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { QRCodeSVG } from "qrcode.react"

// Helper to calculate stats deterministically
const calculateAnalysisStats = (session: WorkshopSession): LocalAnalysisStats | null => {
  if (!session.responses || session.responses.length === 0) return null

  // 1. Warmth (from Participants Stance)
  let totalWarmth = 0
  let warmCount = 0
  session.participants.forEach(p => {
    if (p.stance) {
      // Normalize 0-5 scale to 0-100
      const openness = (p.stance.openness || 0) * 20
      const energy = (p.stance.energyLevel || 0) * 20
      totalWarmth += (openness + energy) / 2
      warmCount++
    }
  })
  const warmth = warmCount > 0 ? Math.round(totalWarmth / warmCount) : 50

  // 2. HERO Scores (from Responses)
  let totalHope = 0, totalEfficacy = 0, totalResilience = 0, totalOptimism = 0
  let heroCount = 0

  session.responses.forEach(r => {
    if (r.hero) {
      totalHope += r.hero.hope || 0
      totalEfficacy += r.hero.efficacy || 0
      totalResilience += r.hero.resilience || 0
      totalOptimism += r.hero.optimism || 0
      heroCount++
    }
  })

  // Default to mid-range if no data (to avoid 0/0)
  const heroScores = heroCount > 0 ? {
    hope: Math.round((totalHope / heroCount) * 10) / 10,
    efficacy: Math.round((totalEfficacy / heroCount) * 10) / 10,
    resilience: Math.round((totalResilience / heroCount) * 10) / 10,
    optimism: Math.round((totalOptimism / heroCount) * 10) / 10
  } : { hope: 5, efficacy: 5, resilience: 5, optimism: 5 }

  // 3. Focus Tags (Keyword Analysis)
  let mindset = 0, process = 0, environment = 0
  const keywords = {
    mindset: ["意識", "モチベーション", "やる気", "不安", "心理", "気持ち", "納得", "当事者", "主体性", "自信", "本音", "文化", "風土"],
    process: ["ルール", "仕組み", "制度", "時間", "会議", "ツール", "手順", "役割", "責任", "評価", "フロー", "方法", "業務"],
    environment: ["環境", "オフィス", "設備", "雑音", "椅子", "リモート", "空間", "予算", "人員", "リソース", "ｐｃ", "pc", "手当"]
  }

  session.responses.forEach(r => {
    const text = (r.solution?.action || "") + " " + (r.gap?.interpretation || "") + " " + (r.asIs.fact || "") + " " + (r.toBe.will || "")

    const hasMindset = keywords.mindset.some(k => text.includes(k))
    const hasProcess = keywords.process.some(k => text.includes(k))
    const hasEnvironment = keywords.environment.some(k => text.includes(k))

    if (hasMindset) mindset++
    if (hasProcess) process++
    if (hasEnvironment) environment++
  })

  const totalTags = mindset + process + environment
  const focusTags = totalTags > 0 ? {
    mindset: Math.round((mindset / totalTags) * 100),
    process: Math.round((process / totalTags) * 100),
    environment: Math.round((environment / totalTags) * 100)
  } : { mindset: 33, process: 33, environment: 34 }

  // 4. ROI Calculation
  // Formula: Average HERO (0-10) / 2 * Growth Factor
  const avgHero = (heroScores.hope + heroScores.efficacy + heroScores.resilience + heroScores.optimism) / 4
  // If avgHero is 10, ROI = 5.0x. If 5, ROI = 2.5x.
  const roi = Math.round((avgHero / 2) * 10) / 10

  return {
    warmth,
    heroScores,
    focusTags,
    roi,
    responseCount: session.responses.length
  }
}

// Helper function to load data from localStorage
const loadFromLocalStorage = (key: string) => {
  if (typeof window === "undefined") {
    return null
  }
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error(`[v0] Error loading from localStorage (${key}):`, error)
    return null
  }
}

// Helper function to save data to localStorage
const saveToLocalStorage = (key: string, data: any) => {
  if (typeof window === "undefined") {
    return
  }
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`[v0] Error saving to localStorage (${key}):`, error)
  }
}

// Helper function to sync session data
const syncWithLocalStorage = (workshopId: string, sessionData?: WorkshopSession) => {
  if (typeof window === "undefined") {
    return
  }
  const workshopKey = `workshop-${workshopId}`
  const sessionKey = `session-${workshopId}`

  try {
    if (sessionData) {
      // Save current session to workshop-store
      localStorage.setItem(workshopKey, JSON.stringify(sessionData))
    } else {
      // Load from workshop-store, save to session-store if exists and differs
      const storedWorkshop = localStorage.getItem(workshopKey)
      const storedSession = localStorage.getItem(sessionKey)

      if (storedWorkshop) {
        const workshopParsed = JSON.parse(storedWorkshop)
        if (!storedSession || JSON.stringify(workshopParsed) !== storedSession) {
          localStorage.setItem(sessionKey, storedWorkshop)
        }
      } else if (storedSession) {
        // If workshop-store is missing but session-store exists, copy it
        localStorage.setItem(workshopKey, storedSession)
      }
    }
  } catch (error) {
    console.error("[v0] Error syncing localStorage:", error)
  }
}

const THEME_QUESTIONS = {
  心理的安全性: [
    "このチームで「本当はもっと良くできるはず」と感じていることは何ですか？",
    "失敗や間違いを話しやすい環境だと感じますか？具体的なエピソードがあれば教えてください。",
    "意見を言いづらいと感じたことはありますか？それはどんな時ですか？",
  ],
  自律性と明確さ: [
    "自分の仕事の目標や期待値が明確だと感じますか？",
    "もっと裁量や決定権を欲しいと感じる場面はありますか？",
    "チームの目標と自分の役割のつながりを感じていますか？",
  ],
  チームの一体感: [
    "チームの一体感を高めるために、あなたが大切にしたいことは何ですか？",
    "メンバー同士の信頼関係はどの程度築けていると感じますか？",
    "チームで協力して成果を出せた経験を教えてください。",
  ],
  成長機会: [
    "今後チャレンジしてみたいことや、学びたいスキルは何ですか？",
    "自分の成長を実感できていますか？具体的にどんな場面で感じますか？",
    "新しいことに挑戦できる環境だと感じますか？",
  ],
}

// CHANGE: Simplify session initialization to prioritize API data over localStorage
function getInitialSession(workshopId: string): WorkshopSession {
  return {
    id: workshopId,
    workshopId,
    status: "preparation" as const,
    participants: [],
    responses: [],
    currentQuestion: undefined,
    analysis: undefined,
    teamState: undefined,
    createdAt: new Date().toISOString(),
  }
}

const getSession = (id: string) => {
  if (typeof window === "undefined") {
    return {
      id,
      status: "preparation" as const,
      participants: [],
      responses: [],
      currentQuestion: undefined,
      analysis: undefined,
    }
  }

  try {
    const stored = localStorage.getItem(`session-${id}`)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("[v0] Error loading session:", error)
  }

  return {
    id,
    workshopId: id,
    status: "preparation" as const,
    participants: [],
    responses: [],
    currentQuestion: undefined,
    analysis: undefined,
    createdAt: new Date().toISOString(),
  }
}

const generateMarkdownReport = (session: WorkshopSession, selectedTheme: string) => {
  const responses = session.responses || []
  if (responses.length === 0) return ""

  let markdown = `# TAIWA AI - Actionable Dialogue Report\n\n`
  markdown += `**Concept**: 対話を対話で終わらせない（Actionable Dialogue）。AI介入により「心理資本（HERO）」を高め、組織OSをアップデートします。\n\n`
  markdown += `### ワークショップ基本情報\n`
  markdown += `**実施日時**: ${new Date().toLocaleDateString("ja-JP")} ${new Date().toLocaleTimeString("ja-JP")}\n`
  markdown += `**テーマ**: ${selectedTheme}\n`
  markdown += `**質問**: ${session.currentQuestion?.question}\n`
  markdown += `**参加者数**: ${session.participants.length}名\n\n`

  markdown += `---\n\n`

  // Stance Overview
  markdown += `## 📊 参加者のスタンス概要\n\n`
  const avgEnergy = Math.round(
    session.participants.reduce((sum, p) => sum + (p.stance?.energyLevel || 50), 0) / session.participants.length,
  )
  const avgOpenness = Math.round(
    session.participants.reduce((sum, p) => sum + (p.stance?.openness || 50), 0) / session.participants.length,
  )

  markdown += `### 全体の状態\n\n`
  markdown += `- **平均活力レベル**: ${avgEnergy}/100 ${"█".repeat(Math.floor(avgEnergy / 10))}\n`
  markdown += `- **平均オープンネス**: ${avgOpenness}/100 ${"█".repeat(Math.floor(avgOpenness / 10))}\n\n`

  markdown += `### モード分布\n\n`
  const modeCount = session.participants.reduce(
    (acc, p) => {
      const mode = p.stance?.currentMode || "diverge"
      acc[mode] = (acc[mode] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const modeLabels: Record<string, string> = {
    diverge: "🌟 発散 (Diverge)",
    converge: "🎯 収束 (Converge)",
    challenge: "⚡ 挑戦 (Challenge)",
    reflect: "🤔 内省 (Reflect)",
  }

  Object.entries(modeCount).forEach(([mode, count]) => {
    const percentage = Math.round((count / session.participants.length) * 100)
    markdown += `- ${modeLabels[mode] || mode}: ${count}名 (${percentage}%) ${"█".repeat(Math.floor(percentage / 5))}\n`
  })
  markdown += `\n---\n\n`

  // Quantitative Analysis with Graphs
  markdown += `## 📈 定量データ分析\n\n`
  const avgAsIs = Math.round(responses.reduce((sum, r) => sum + r.asIs.score, 0) / responses.length)
  const avgToBe = Math.round(responses.reduce((sum, r) => sum + r.toBe.score, 0) / responses.length)
  const avgGap = avgToBe - avgAsIs

  markdown += `### スコアサマリー\n\n`
  markdown += `\`\`\`\n`
  markdown += `As is:  ${avgAsIs}/100  ${"█".repeat(Math.floor(avgAsIs / 5))}\n`
  markdown += `To be:  ${avgToBe}/100  ${"█".repeat(Math.floor(avgToBe / 5))}\n`
  markdown += `Gap:    +${avgGap}     ${"▲".repeat(Math.max(0, Math.floor(avgGap / 5)))}\n`
  markdown += `\`\`\`\n\n`

  // Gap Distribution
  markdown += `### ギャップ分布\n\n`
  const gapRanges = { small: 0, medium: 0, large: 0 }
  responses.forEach((r) => {
    const gap = r.toBe.score - r.asIs.score
    if (gap < 20) gapRanges.small++
    else if (gap < 40) gapRanges.medium++
    else gapRanges.large++
  })

  markdown += `- 小 (0-19): ${gapRanges.small}名 ${"█".repeat(gapRanges.small)}\n`
  markdown += `- 中 (20-39): ${gapRanges.medium}名 ${"█".repeat(gapRanges.medium)}\n`
  markdown += `- 大 (40+): ${gapRanges.large}名 ${"█".repeat(gapRanges.large)}\n\n`

  // Detailed Score Table
  markdown += `### 個別スコア一覧\n\n`
  markdown += `| 参加者 | 役割 | As is | To be | Gap | エネルギー | オープンネス |\n`
  markdown += `|--------|------|-------|-------|-----|------------|-------------|\n`
  responses.forEach((r) => {
    const participant = session.participants.find((p) => p.id === r.participantId)
    const energy = participant?.stance?.energyLevel || 50
    const openness = participant?.stance?.openness || 50
    markdown += `| ${participant?.name} | ${participant?.role} | ${r.asIs.score} | ${r.toBe.score} | +${r.toBe.score - r.asIs.score} | ${energy} | ${openness} |\n`
  })
  markdown += `\n---\n\n`

  markdown += `## 💭 参加者の声（n=1データ）- 詳細分析\n\n`
  markdown += `各参加者の回答を個別に分析し、背景にある思考パターンや視点を深掘りします。\n\n`

  responses.forEach((response, index) => {
    const participant = session.participants.find((p) => p.id === response.participantId)
    const gap = response.toBe.score - response.asIs.score

    markdown += `### ${index + 1}. ${participant?.name} (${participant?.role}) - 詳細分析\n\n`

    // Stance Context
    if (participant?.stance) {
      markdown += `#### 🎭 参加時のスタンス\n\n`
      markdown += `| 項目 | 値 | 状態 |\n`
      markdown += `|------|-----|------|\n`
      markdown += `| エネルギーレベル | ${participant.stance.energyLevel}/5 | ${participant.stance.energyLevel >= 4 ? "高い 🔥" : participant.stance.energyLevel >= 3 ? "標準 ✓" : "低め 💤"} |\n`
      markdown += `| 現在のモード | ${modeLabels[participant.stance.currentMode] || participant.stance.currentMode} | - |\n`
      markdown += `| オープンネス | ${participant.stance.openness}/5 | ${participant.stance.openness >= 4 ? "非常にオープン 🌈" : participant.stance.openness >= 3 ? "標準的 ✓" : "慎重 🤔"} |\n\n`

      // Stance-based insights
      markdown += `**スタンスからの洞察**:\n`
      if (participant.stance.energyLevel < 3 && gap > 5) {
        markdown += `- エネルギーが低い状態で大きなギャップを認識している → 変化への期待と現状の疲労感 Both Feel.\n`
      }
      if (participant.stance.currentMode === "challenge" && gap > 7) {
        markdown += `-挑戦モードで大きなギャップ → 積極的に現状を変えたいという強い意志が読み取れる\n`
      }
      if (participant.stance.openness > 3) {
        markdown += `- 高いオープンネス → 新しい視点や変化を受け入れる準備ができている状態\n`
      }
      markdown += `\n`
    }

    markdown += `#### 📍 As is (現状認識) - スコア: ${response.asIs.score}/10\n\n`
    markdown += `**回答内容**:\n`
    markdown += `> ${response.asIs.fact}\n\n`

    // As is Analysis
    markdown += `**分析**:\n`
    if (response.asIs.score < 4) {
      markdown += `- 現状を厳しく評価している（スコア: ${response.asIs.score}）\n`
      markdown += `- 改善の必要性を強く感じている可能性が高い\n`
    } else if (response.asIs.score > 7) {
      markdown += `- 現状をポジティブに捉えている（スコア: ${response.asIs.score}）\n`
      markdown += `- 既に良い状態にあるという認識\n`
    } else {
      markdown += `- 現状を中立的に評価（スコア: ${response.asIs?.score}）\n`
      markdown += `- 改善余地があると認識しつつも、完全に否定的ではない\n`
    }
    markdown += `\n`

    markdown += `#### 🎯 To be (理想状態) - スコア: ${response.toBe?.score}/10\n\n`
    markdown += `**回答内容**:\n`
    markdown += `> ${response.toBe?.will}\n\n`

    // To be Analysis
    markdown += `**分析**:\n`
    if (response.toBe?.score > 8) {
      markdown += `- 非常に高い理想を掲げている（スコア: ${response.toBe?.score}）\n`
      markdown += `- 完璧に近い状態を目指している\n`
    } else if (response.toBe?.score < 6) {
      markdown += `- 理想像が控えめ（スコア: ${response.toBe?.score}）\n`
      markdown += `- 現実的な目標設定、または期待値の調整が行われている可能性\n`
    }
    markdown += `\n`

    markdown += `#### 🔍 Solution (解決策)\n\n`
    markdown += `**ギャップ**: +${gap} (As is: ${response.asIs?.score} → To be: ${response.toBe?.score})\n\n`

    markdown += `**回答内容**:\n`
    markdown += `> ${response.solution?.action || response.gap?.interpretation || "（回答なし）"}\n\n`

    const tags = response.solution?.tags || response.gap?.tags
    if (tags && tags.length > 0) {
      markdown += `**アクションタグ**: ${tags.map((tag) => `\`${tag}\``).join(", ")}\n\n`
      markdown += `**タグから見える思考パターン**:\n` // Simple placeholder
      tags.forEach((tag) => {
        if (tag === "communication") markdown += `- 対話や情報共有を重視\n`
        if (tag === "process") markdown += `- 仕組みやルール作りを重視\n`
        if (tag === "mindset") markdown += `- 意識や文化の変革を重視\n`
        if (tag === "environment") markdown += `- 環境やツールの整備を重視\n`
      })
      markdown += `\n`
    }

    // Cross-reference with role
    markdown += `#### 🔗 役割との関連性\n\n`
    const pRole = session.participants.find(p => p.id === response.participantId)?.role;
    if (pRole === "manager") {
      markdown += `- **マネージャーとしての視点**: `
      if (gap > 5) {
        markdown += `変化のビジョンを明確に持っている。チーム全体を理想に導くリーダーシップが期待される。\n`
      } else {
        markdown += `現状維持または漸進的な改善を志向。安定性を重視している可能性。\n`
      }
    } else {
      markdown += `- **メンバーとしての視点**: `
      if (gap > 5) {
        markdown += `現場レベルでの課題を強く認識している。改善への意欲が高い。\n`
      } else {
        markdown += `現状を受け入れているか、または小さな改善で満足できる状態。\n`
      }
    }
    markdown += `\n`

    markdown += `---\n\n`
  })

  markdown += `## 🔄 回答間のパターン分析\n\n`
  markdown += `複数の回答を横断的に分析し、チーム全体のパターンを抽出します。\n\n`

  // Pattern 1: Gap clustering
  markdown += `### パターン1: ギャップのクラスタリング\n\n`
  const highGapResponses = responses.filter((r) => r.toBe.score - r.asIs.score > 5)
  const lowGapResponses = responses.filter((r) => r.toBe.score - r.asIs.score <= 2)

  if (highGapResponses.length > 0) {
    markdown += `**大きなギャップを感じているメンバー** (${highGapResponses.length}名):\n`
    highGapResponses.forEach((r) => {
      const participant = session.participants.find((p) => p.id === r.participantId)
      markdown += `- ${participant?.name} (${participant?.role}): +${r.toBe.score - r.asIs.score}\n`
    })
    markdown += `\n**洞察**: これらのメンバーは変化への強い動機を持っている可能性が高い。リーダーシップや変革の推進力として活用できる。\n\n`
  }

  if (lowGapResponses.length > 0) {
    markdown += `**小さなギャップのメンバー** (${lowGapResponses.length}名):\n`
    lowGapResponses.forEach((r) => {
      const participant = session.participants.find((p) => p.id === r.participantId)
      markdown += `- ${participant?.name} (${participant?.role}): +${r.toBe.score - r.asIs.score}\n`
    })
    markdown += `\n**洞察**: これらのメンバーは現状に比較的満足しているか、または段階的な改善を好む傾向。急激な変化には慎重な対応が必要。\n\n`
  }

  // Pattern 2: Stance correlation
  markdown += `### パターン2: スタンスと回答の関連性\n\n`
  const challengeModeResponses = responses.filter((r) => {
    const p = session.participants.find((p) => p.id === r.participantId)
    return p?.stance?.currentMode === "challenge"
  })

  if (challengeModeResponses.length > 0) {
    const avgChallengeGap =
      challengeModeResponses.reduce((sum, r) => sum + (r.toBe.score - r.asIs.score), 0) / challengeModeResponses.length
    markdown += `- **挑戦モードの参加者**: ${challengeModeResponses.length}名、平均ギャップ +${Math.round(avgChallengeGap)}\n`
    markdown += `  -挑戦モードの人ほど大きなギャップを認識する傾向${avgChallengeGap > avgGap ? "が見られる ✓" : "は見られない"}\n\n`
  }

  markdown += `---\n\n`

  // Role-based Analysis
  markdown += `## 👥 役割別の認識比較\n\n`
  const managerResponses = responses.filter((r) => {
    const p = session.participants.find((p) => p.id === r.participantId)
    return p?.role === "manager"
  })
  const memberResponses = responses.filter((r) => {
    const p = session.participants.find((p) => p.id === r.participantId)
    return p?.role === "member"
  })

  if (managerResponses.length > 0 && memberResponses.length > 0) {
    const managerAvgAsIs = Math.round(
      managerResponses.reduce((sum, r) => sum + r.asIs.score, 0) / managerResponses.length,
    )
    const managerAvgToBe = Math.round(
      managerResponses.reduce((sum, r) => sum + r.toBe.score, 0) / managerResponses.length,
    )
    const memberAvgAsIs = Math.round(memberResponses.reduce((sum, r) => sum + r.asIs.score, 0) / memberResponses.length)
    const memberAvgToBe = Math.round(memberResponses.reduce((sum, r) => sum + r.toBe.score, 0) / memberResponses.length)

    markdown += `### 認識のズレ分析\n\n`
    markdown += `| 項目 | マネージャー | メンバー | 差分 |\n`
    markdown += `|------|-------------|----------|------|\n`
    markdown += `| As is平均 | ${managerAvgAsIs} | ${memberAvgAsIs} | ${Math.abs(managerAvgAsIs - memberAvgAsIs)} |\n`
    markdown += `| To be平均 | ${managerAvgToBe} | ${memberAvgToBe} | ${Math.abs(managerAvgToBe - memberAvgToBe)} |\n`
    markdown += `| Gap平均 | +${managerAvgToBe - managerAvgAsIs} | +${memberAvgToBe - memberAvgAsIs} | ${Math.abs(managerAvgToBe - managerAvgAsIs - (memberAvgToBe - memberAvgAsIs))} |\n\n`

    if (Math.abs(managerAvgAsIs - memberAvgAsIs) > 1.5) {
      markdown += `⚠️ **現状認識に大きなズレがあります** (差分: ${Math.abs(managerAvgAsIs - memberAvgAsIs).toFixed(1)})\n`
      markdown += `- マネージャーとメンバーで現状の見え方が異なっている可能性が高い\n`
      markdown += `- 対話を通じて、それぞれの視点を共有することが重要\n\n`
    }
    if (Math.abs(managerAvgToBe - memberAvgToBe) > 1.5) {
      markdown += `⚠️ **理想像に大きなズレがあります** (差分: ${Math.abs(managerAvgToBe - memberAvgToBe).toFixed(1)})\n`
      markdown += `- 目指す方向性に認識のズレがある\n`
      markdown += `- ビジョンの共有とすり合わせが必要\n\n`
    }
  }
  markdown += `---\n\n`

  // AI Analysis
  if (session.analysis) {
    markdown += `## 🔮 AI分析結果\n\n`

    if (session.analysis.summary) {
      markdown += `${session.analysis.summary}\n\n`
    }

    if (session.analysis.consensus && session.analysis.consensus.length > 0) {
      markdown += `### 🤝 合意点 (Consensus)\n`
      session.analysis.consensus.forEach((point: string) => {
        markdown += `- ${point}\n`
      })
      markdown += `\n`
    }

    if (session.analysis.conflicts && session.analysis.conflicts.length > 0) {
      markdown += `### ⚡ 対立点・相違点 (Conflicts)\n`
      session.analysis.conflicts.forEach((point: string) => {
        markdown += `- ${point}\n`
      })
      markdown += `\n`
    }

    if (session.analysis.discussionPoints && session.analysis.discussionPoints.length > 0) {
      markdown += `### 💬 ディスカッションポイント\n`
      session.analysis.discussionPoints.forEach((point: string) => {
        markdown += `- ${point}\n`
      })
      markdown += `\n`
    }

    // Fallback/Legacy
    if (session.analysis.keyFindings && session.analysis.keyFindings.length > 0) {
      markdown += `### 主要な発見\n`
      session.analysis.keyFindings.forEach((finding: string, i: number) => {
        markdown += `${i + 1}. **${finding}**\n`
      })
      markdown += `\n`
    }
  }

  // Curiosity Triggers
  markdown += `---\n\n`
  markdown += `## 🎯 Curiosity Triggers（対話を深める問い）\n\n`
  markdown += `このデータから生まれる、チームで探求すべき問い：\n\n`

  if (avgGap > 5) {
    markdown += `- 「理想の状態」と「現状」のギャップが大きい領域について、何が障壁になっているのか？\n`
  }
  if (managerResponses.length > 0 && memberResponses.length > 0) {
    markdown += `- マネージャーとメンバーで認識が異なる部分について、それぞれの視点から何が見えているのか？\n`
  }
  markdown += `- 各メンバーが持つ異なる視点（Diversity）を、チームの強みに変えるにはどうすればいいか？\n`
  if (highGapResponses.length > 0) {
    markdown += `- 大きなギャップを感じているメンバーの声に、どう応答していくか？\n`
  }
  markdown += `- 理想に近づくために、まず小さく始められることは何か？\n\n`

  markdown += `---\n\n`
  // Logic Model Analysis (HERO)
  markdown += `## 🧠 心理資本（HERO）に基づく組織診断\n\n`
  markdown += `本セッションのデータを、組織の持続的パフォーマンスの源泉である「心理資本（PsyCap）」の4要素に基づいて分析しました。\n\n`

  const stats = calculateAnalysisStats(session)

  if (stats) {
    markdown += `### 📊 HERO Stats & ROI\n\n`
    markdown += `- **組織心理資本 (Total HERO)**: ${((stats.heroScores.hope + stats.heroScores.efficacy + stats.heroScores.resilience + stats.heroScores.optimism) / 4).toFixed(1)}/10\n`
    markdown += `  - Hope (意志): ${stats.heroScores.hope}\n`
    markdown += `  - Efficacy (効力感): ${stats.heroScores.efficacy}\n`
    markdown += `  - Resilience (回復力): ${stats.heroScores.resilience}\n`
    markdown += `  - Optimism (楽観性): ${stats.heroScores.optimism}\n`
    markdown += `\n`
    markdown += `- **Warmth (組織体温)**: ${stats.warmth}/100\n`
    markdown += `- **Expected ROI (投資対効果)**: **${stats.roi}x** (${stats.roi * 100}%)\n\n`

    markdown += `### 🔍 Focus Areas (関心の所在)\n`
    markdown += `- Mindset (意識): ${stats.focusTags.mindset}%\n`
    markdown += `- Process (仕組み): ${stats.focusTags.process}%\n`
    markdown += `- Environment (環境): ${stats.focusTags.environment}%\n\n`
  }

  // Hope (Waypower)
  markdown += `### 1. Hope (希望・意志)\n`
  if (avgGap > 5) {
    markdown += `- **状態**: 現状と理想のギャップが明確になっており、「変わりたい」という意志（Willpower）は強い状態です。\n`
    markdown += `- **推奨介入**: 曖昧な不満を「理想への経路（Waypower）」へ構造化する必要があります。「誰に」「何を」相談すればよいかを具体化しましょう。\n\n`
  } else {
    markdown += `- **状態**: 現状への満足度が高いか、あるいは諦め（学習性無力感）の可能性があります。\n`
    markdown += `- **推奨介入**: 「もし制約がなかったら？」という問い直しにより、隠れた理想を引き出すことが有効です。\n\n`
  }

  // Efficacy (Self-Efficacy)
  markdown += `### 2. Efficacy (自己効力感)\n`
  markdown += `- **Small Winの蓄積**: 今回、${responses.length}件の「Solution（具体的なアクション）」が提案されました。\n`
  markdown += `- **推奨介入**: これらを「誰かの許可」ではなく「助言プロセス（Advice Process）」として実行に移すことで、「自分たちで決められる」という効力感を高められます。\n\n`

  // Resilience & Optimism
  markdown += `### 3. Resilience (回復力) & Optimism (楽観性)\n`
  markdown += `- **リフレーミング**: 出てきた課題（Conflict）は、組織が進化するための重要な「学習機会」です。\n`
  markdown += `- **ポジティブ・フィードバック**: 異なる意見が出たこと自体が、心理的安全性の高まり（防御的沈黙の打破）を示唆しています。\n\n`

  markdown += `---\n\n`
  markdown += `## 🔄 システム思考による「悪循環」の断絶\n\n`
  markdown += `**現状のループ (Bad Cycle)**:\n`
  markdown += `対話不足 → 認識のズレ → 心理的安全性の低下 → 防御的沈黙\n\n`
  markdown += `**TAIWA AIによる介入 (Intervention)**:\n`
  markdown += `このレポートの「問い」を起点に対話を始めることで、**「外在化（個人の責任ではなく構造の問題として捉える）」**が可能になります。これが悪循環を逆回転させる第一歩です。\n\n`

  markdown += `---\n\n`
  markdown += `## 📝 次のステップ（Action Translation）\n\n`
  markdown += `1. **対話の場を設ける**: このレポートをもとに、チーム全体で対話の時間を持つ\n`
  markdown += `2. **関係性のプロトタイピング**: デザイン思考に基づき、「とりあえずこのルールで1週間やってみよう」という小さな合意（MVP）を形成する\n`
  markdown += `3. **マイクロ助言プロセスの実践**: 上司の承認を待つのではなく、周囲に助言を求めた上で自律的にアクションを実行する\n`
  markdown += `4. **継続的なモニタリング**: 定期的にTAIWA AIを使って、チームの状態変化（Good Cycleへの転換）を確認する\n\n`

  markdown += `---\n\n`
  markdown += `*Generated by TAIWA AI - ${new Date().toLocaleString("ja-JP")}*\n`

  return markdown
}

const downloadReport = (session: WorkshopSession, selectedTheme: string) => {
  const markdown = generateMarkdownReport(session, selectedTheme)
  const blob = new Blob([markdown], { type: "text/markdown" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `taiwa-report-${Date.now()}.md`
  a.click()
  URL.revokeObjectURL(url)
}

// CHANGE: Remove async from component and extract params.id using React.use() (Next.js 15)
export default function FacilitatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: workshopId } = React.use(params)


  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false) // For useEffect cleanup

  // CHANGE: Initialize with empty/loading state
  const [session, setSession] = useState<WorkshopSession>({
    id: workshopId,
    workshopId: workshopId,
    status: "preparation",
    participants: [],
    responses: [],
    currentQuestion: undefined,
    analysis: undefined,
    createdAt: new Date().toISOString()
  })

  const [selectedTheme, setSelectedTheme] = useState("")
  const [questionMode, setQuestionMode] = useState<"predefined" | "custom">("predefined")
  const [predefinedQuestions, setPredefinedQuestions] = useState<string[]>([])
  const [customQuestion, setCustomQuestion] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const workshopUrl = typeof window !== "undefined" ? `${window.location.origin}/join/${workshopId}` : ""
  const encodedUrl = encodeURIComponent(workshopUrl)

  const updateSessionStatus = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/workshop/${workshopId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) {
        console.error("[v0] Failed to update session status")
      } else {
        // Optimistic update
        setSession(prev => ({ ...prev, status: newStatus as any }))
      }
    } catch (error) {
      console.error("[v0] Error updating session status:", error)
    }
  }


  // CHANGE: Poll API for real-time updates
  const fetchSession = useCallback(async () => {
    if (!mounted) return

    try {
      const dbResponse = await fetch(`/api/workshop/${workshopId}`)

      if (dbResponse.ok) {
        const body = await dbResponse.json()
        setSession(prev => {
          // Basic diff prevention
          if (JSON.stringify(prev) !== JSON.stringify(body)) {
            return { ...prev, ...body, workshopId }
          }
          return prev
        })
      }
    } catch (error) {
      console.error("[v0] Error fetching session:", error)
    } finally {
      setIsLoading(false)
    }
  }, [workshopId, mounted])

  useEffect(() => {
    setMounted(true)
    setIsLoading(true)

    // Initial fetch
    fetch(`/api/workshop/${workshopId}`)
      .then(res => res.json())
      .then(data => {
        setSession(prev => ({ ...prev, ...data, workshopId }))
        setIsLoading(false)
      })
      .catch(err => {
        console.error(err)
        setIsLoading(false)
      })

    const interval = setInterval(() => {
      fetch(`/api/workshop/${workshopId}`)
        .then(res => res.json())
        .then(data => {
          setSession(prev => {
            if (JSON.stringify(prev.responses) !== JSON.stringify(data.responses) ||
              prev.participants.length !== data.participants.length ||
              prev.status !== data.status) {
              return { ...prev, ...data, workshopId }
            }
            return prev
          })
        })
        .catch(e => console.error(e))
    }, 3000)

    return () => clearInterval(interval)
  }, [workshopId])

  // CHANGE: Poll API every 2 seconds for real-time updates


  // CHANGE: Save session to localStorage whenever it changes (backup only)
  useEffect(() => {
    if (session && !isLoading) {
      saveToLocalStorage(`session-${workshopId}`, session)
    }
  }, [session, workshopId, isLoading])

  // useEffect(() => {
  //   if (!id) return

  //   const fetchSession = async () => {
  //     try {
  //       const response = await fetch(`/api/workshop/session/${id}`)
  //       if (response.ok) {
  //         const data = await response.json()
  //         // Log participant data when received from API
  //         console.log("[v0] Facilitate - Fetched session data:", {
  //           participantsCount: data.participants?.length,
  //           participants: data.participants?.map((p: any) => ({
  //             id: p.id,
  //             name: p.name,
  //             nameType: typeof p.name,
  //             nameValue: JSON.stringify(p.name)
  //           }))
  //         })

  //         setSession(data)
  //         if (!mounted) setMounted(true)
  //       }
  //     } catch (error) {
  //       console.error("[v0] Facilitate - Error fetching session:", error)
  //     }
  //   }

  //   fetchSession()
  //   return () => setMounted(false) // Cleanup on unmount
  // }, [id, mounted])

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="p-6 max-w-md">
            <h2 className="text-xl font-bold text-red-600 mb-2">エラーが発生しました</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>再読み込み</Button>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const themes = [
    { id: "心理的安全性", label: "心理的安全性", icon: "🛡️", description: "本音で話せる環境" },
    { id: "自律性と明確さ", label: "自律性と明確さ", icon: "🎯", description: "目標と役割の理解" },
    { id: "チームの一体感", label: "チームの一体感", icon: "👥", description: "協力と信頼関係" },
    { id: "成長機会", label: "成長機会", icon: "🌱", description: "学びとチャレンジ" },
  ]

  const handleStartSession = async () => {
    setSession((prev) => ({ ...prev, status: "stance-review" }))
    await updateSessionStatus("stance-review")
  }

  const handleSelectTheme = (theme: string) => {
    setSelectedTheme(theme)
    setPredefinedQuestions(THEME_QUESTIONS[theme as keyof typeof THEME_QUESTIONS] || [])
    setQuestionMode("predefined")
  }

  const handleSelectQuestion = async (question: string) => {
    try {
      await fetch(`/api/workshop/${workshopId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          currentQuestion: {
            id: `q-${Date.now()}`,
            question,
            theme: selectedTheme,
            selected: true,
          }
        }),
      })

      setSession((prev) => ({
        ...prev,
        status: "question-display",
        currentQuestion: {
          id: `q-${Date.now()}`,
          question,
          theme: selectedTheme,
          selected: true,
        },
      }))
      await updateSessionStatus("question-display") // Persist stage change
    } catch (error) {
      console.error("[v0] Error setting question:", error)
    }
  }

  const handleSubmitCustomQuestion = async () => {
    if (!customQuestion.trim()) return
    await handleSelectQuestion(customQuestion)
    setCustomQuestion("")
  }

  const handleAnalyze = async () => {
    try {
      setIsGenerating(true)
      await updateSessionStatus("analysis") // Persist stage change

      console.log("[v0] Sending analysis request for workshop:", workshopId);

      const response = await fetch("/api/workshop/analyze-responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: session.currentQuestion?.question,
          responses: session.responses,
          participants: session.participants,
          workshopId,
        }),
      })

      if (!response.ok) {
        console.error(`[v0] Analysis API failed with status: ${response.status}`);
        const errorText = await response.text();
        console.error(`[v0] Analysis API Error Body:`, errorText);
        throw new Error(`API analysis failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json()
      console.log("[v0] Analysis API Response:", data);

      if (data.analysis) {
        setSession((prev) => ({
          ...prev,
          status: "analysis",
          analysis: data.analysis, // Assuming the API returns the full analysis object
        }))
      } else {
        console.warn("[v0] Analysis data missing in response:", data);
        throw new Error("No analysis data received from API");
      }
    } catch (error: any) {
      console.error("[v0] Error analyzing:", error)
      setError(`分析中にエラーが発生しました: ${error.message || "Unknown error"}. コンソールを確認してください。`);
    } finally {
      setIsGenerating(false)
    }
  }

  const handleShowSummary = () => {
    const teamState = {
      psychologicalSafety: 8.2,
      grit: 7.8,
      goalClarity: 7.5,
      collaboration: 8.5,
      alignmentScore: 7.2,
    }
    setSession((prev) => ({ ...prev, status: "summary", teamState }))
    updateSessionStatus("summary") // Persist stage change
  }

  const radarData = session.teamState
    ? [
      { subject: "心理的安全性", value: session.teamState.psychologicalSafety, fullMark: 10 },
      { subject: "GRIT", value: session.teamState.grit, fullMark: 10 },
      { subject: "目標の明確さ", value: session.teamState.goalClarity, fullMark: 10 },
      { subject: "協働意欲", value: session.teamState.collaboration, fullMark: 10 },
      { subject: "認識一致度", value: session.teamState.alignmentScore, fullMark: 10 },
    ]
    : []

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
        {session.status === "preparation" && (
          <div className="space-y-6">
            <Card className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hidden">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-teal-500 to-lime-500 bg-clip-text text-transparent">
                TAIWA AI
              </h2>
              <p className="text-gray-600 mt-2">対話型ワークショップ - ファシリテーション画面</p>
            </Card>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-teal-500 to-lime-500 bg-clip-text text-transparent">
                  TAIWA AI
                </h1>
                <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                  対話型ワークショップ - ファシリテーション画面
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-2 bg-teal-50 rounded-xl border border-teal-200">
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                <span className="text-xs sm:text-sm font-medium text-teal-700">
                  準備中
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <div className="bg-gradient-to-r from-teal-400 to-lime-400 p-2 sm:p-3 rounded-2xl">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  1. メンバーを招待
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-teal-50 to-lime-50 p-4 sm:p-6 rounded-2xl border border-teal-100">
                      <p className="font-medium text-gray-700 mb-2 text-sm sm:text-base">📱 参加方法</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        メンバーにこのQRコードをスキャンしてもらうか、URLを共有してください
                      </p>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-2xl border-2 border-gray-200 inline-block mx-auto">
                      {workshopUrl ? (
                        <QRCodeSVG
                          value={workshopUrl}
                          size={220}
                          level="H"
                          className="w-40 h-40 sm:w-56 sm:h-56"
                        />
                      ) : (
                        <div className="w-40 h-40 sm:w-56 sm:h-56 bg-gray-100 animate-pulse rounded-lg" />
                      )}
                    </div>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-500 break-all">{workshopUrl}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-1 sm:gap-2 text-gray-700 text-sm sm:text-base">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-teal-500" />
                        参加者リスト
                      </h3>
                      <span className="bg-teal-100 text-teal-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                        {session.participants.length}名
                      </span>
                    </div>

                    {/* Add error boundary for participant rendering */}
                    {session.participants &&
                      Array.isArray(session.participants) &&
                      session.participants.length === 0 ? (
                      <div className="text-center py-8 sm:py-12 text-gray-500">
                        <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">参加者が入室するのを待っています...</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {session.participants &&
                          Array.isArray(session.participants) &&
                          session.participants.map((participant) => {
                            let joinTimeDisplay = ""
                            try {
                              if (participant.joinedAt) {
                                const joinDate = new Date(participant.joinedAt)
                                if (!isNaN(joinDate.getTime())) {
                                  joinTimeDisplay = joinDate.toLocaleTimeString("ja-JP", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                }
                              }
                            } catch (err) {
                              console.error("[v0] Error parsing joinedAt:", err)
                            }

                            return (
                              <div
                                key={participant.id}
                                className="bg-gradient-to-r from-teal-50 to-lime-50 border border-teal-100 rounded-xl p-3 sm:p-4 flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-teal-400 to-lime-400 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                                    {participant.name?.charAt(0) || "?"}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-800 text-sm sm:text-base">
                                      {participant.name || "名前なし"}
                                    </div>
                                    <div className="text-xs text-gray-500 capitalize">
                                      {participant.role || "member"}
                                    </div>
                                  </div>
                                </div>
                                {joinTimeDisplay && (
                                  <span className="ml-auto text-xs text-gray-500">{joinTimeDisplay}</span>
                                )}
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 sm:mt-8 flex justify-center">
                  <Button
                    onClick={handleStartSession}
                    disabled={session.participants.length === 0}
                    size="lg"
                    className="bg-gradient-to-r from-teal-400 to-lime-400 hover:from-teal-500 hover:to-lime-500 text-white font-semibold rounded-2xl px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ワークショップを開始
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {session.status === "stance-review" && (
          <div className="space-y-6">
            <Card className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
                <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-2 sm:p-3 rounded-2xl">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                1.5. 参加者のスタンス確認
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                メンバーの今の状態を確認してから、最適な質問を設計しましょう
              </p>

              {session.participants.length === 0 ? (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-yellow-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-2">参加者が見つかりません</h4>
                      <p className="text-yellow-700 text-sm">
                        まだ参加者が登録されていないようです。QRコードをスキャンして参加者を招待してください。
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
                    {/* Average Energy Level */}
                    <Card className="bg-gradient-to-br from-orange-50 to-red-50 p-5 sm:p-6 border-2 border-orange-200">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h3 className="font-semibold text-gray-700 text-sm sm:text-base">⚡ 平均活力レベル</h3>
                        <span className="text-2xl sm:text-3xl font-bold text-orange-600">
                          {Math.round(
                            session.participants.reduce((sum, p) => sum + (p.stance?.energyLevel || 50), 0) /
                            session.participants.length,
                          )}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {session.participants.map((p) => (
                          <div key={p.id} className="flex items-center gap-2">
                            <div className="flex-1 bg-white rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-orange-400 to-red-400"
                                style={{ width: `${p.stance?.energyLevel || 50}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 w-16">{p.name}</span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Mode Distribution */}
                    <Card className="bg-gradient-to-br from-teal-50 to-lime-50 p-5 sm:p-6 border-2 border-teal-200">
                      <h3 className="font-semibold text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">💭 モード分布</h3>
                      <div className="space-y-3">
                        {Object.entries(
                          session.participants.reduce(
                            (acc, p) => {
                              const mode = p.stance?.currentMode || "diverge"
                              acc[mode] = (acc[mode] || 0) + 1
                              return acc
                            },
                            {} as Record<string, number>,
                          ),
                        ).map(([mode, count]) => (
                          <div key={mode} className="flex items-center gap-2">
                            <span className="text-lg">
                              {mode === "diverge" && "🌈"}
                              {mode === "converge" && "🎯"}
                              {mode === "challenge" && "💪"}
                              {mode === "reflect" && "🤔"}
                            </span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
                                <span className="capitalize text-gray-700">{mode}</span>
                                <span className="font-semibold text-teal-600">{count}名</span>
                              </div>
                              <div className="bg-white rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-teal-400 to-lime-400"
                                  style={{ width: `${(count / session.participants.length) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Average Openness */}
                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 sm:p-6 border-2 border-purple-200">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h3 className="font-semibold text-gray-700 text-sm sm:text-base">🌈 平均オープンネス</h3>
                        <span className="text-2xl sm:text-3xl font-bold text-purple-600">
                          {Math.round(
                            session.participants.reduce((sum, p) => sum + (p.stance?.openness || 50), 0) /
                            session.participants.length,
                          )}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {session.participants.map((p) => (
                          <div key={p.id} className="flex items-center gap-2">
                            <div className="flex-1 bg-white rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                                style={{ width: `${p.stance?.openness || 50}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 w-16">{p.name}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-5 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-teal-500 mt-1" />
                      <div>
                        <h4 className="font-semibold text-teal-900 mb-1 sm:mb-2 text-sm sm:text-base">
                          💡 AIからの提案
                        </h4>
                        <p className="text-teal-700 leading-relaxed text-xs sm:text-sm">
                          チームの活力レベルは高めです。発散モードの方が多いので、まずは幅広い意見を集めることから始めましょう。
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="mt-6 sm:mt-8 flex justify-center">
                <Button
                  onClick={() => setSession((prev) => ({ ...prev, status: "theme-selection" }))}
                  size="lg"
                  className="bg-gradient-to-r from-teal-400 to-lime-400 hover:from-teal-500 hover:to-lime-500 text-white font-semibold rounded-2xl px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg shadow-lg"
                >
                  質問を設計する
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {session.status === "theme-selection" && (
          <div className="space-y-6">
            <Card className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
                <div className="bg-gradient-to-r from-teal-400 to-lime-400 p-2 sm:p-3 rounded-2xl">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                2. テーマを選択して質問を設定
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                チームの対話を深めたいテーマを選択してください
              </p>

              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleSelectTheme(theme.id)}
                      className={`p-4 sm:p-6 rounded-2xl border-2 transition-all text-center ${selectedTheme === theme.id
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 border-purple-400 text-white shadow-lg scale-105"
                        : "bg-white border-gray-200 hover:border-purple-300 hover:shadow-md"
                        }`}
                    >
                      <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{theme.icon}</div>
                      <div
                        className={`font-semibold mb-1 text-sm sm:text-base ${selectedTheme === theme.id ? "text-white" : "text-gray-700"}`}
                      >
                        {theme.label}
                      </div>
                      <div
                        className={`text-xs sm:text-sm ${selectedTheme === theme.id ? "text-white/90" : "text-gray-500"}`}
                      >
                        {theme.description}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedTheme && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom">
                    <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl">
                      <button
                        onClick={() => setQuestionMode("predefined")}
                        className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base ${questionMode === "predefined"
                          ? "bg-white text-teal-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-800"
                          }`}
                      >
                        📋 既存の質問
                      </button>
                      <button
                        onClick={() => setQuestionMode("custom")}
                        className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base ${questionMode === "custom"
                          ? "bg-white text-teal-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-800"
                          }`}
                      >
                        ✏️ カスタム質問
                      </button>
                    </div>

                    {questionMode === "predefined" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-teal-500" />
                          <h3 className="font-semibold text-gray-700 text-sm sm:text-base">
                            {selectedTheme}の質問（1つ選択してください）
                          </h3>
                        </div>
                        <div className="grid gap-3 sm:gap-4">
                          {predefinedQuestions.map((question, index) => (
                            <button
                              key={index}
                              onClick={() => handleSelectQuestion(question)}
                              className="text-left p-4 sm:p-6 rounded-2xl border-2 border-gray-200 hover:border-teal-400 cursor-pointer transition-all hover:shadow-lg group"
                            >
                              <div className="flex items-start gap-3 sm:gap-4">
                                <div className="bg-gradient-to-r from-teal-400 to-lime-400 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg group-hover:scale-110 transition-transform">
                                  {index + 1}
                                </div>
                                <p className="text-base sm:text-lg text-gray-700 flex-1 leading-relaxed">{question}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {questionMode === "custom" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-teal-500" />
                          <h3 className="font-semibold text-gray-700 text-sm sm:text-base">オリジナルの質問を入力</h3>
                        </div>
                        <div className="space-y-3">
                          <Textarea
                            value={customQuestion}
                            onChange={(e) => setCustomQuestion(e.target.value)}
                            placeholder="チームに聞きたい質問を入力してください..."
                            className="min-h-[100px] sm:min-h-[120px] text-base sm:text-lg rounded-2xl border-2 border-gray-200 focus:border-teal-400 p-3 sm:p-4"
                          />
                          <Button
                            onClick={handleSubmitCustomQuestion}
                            disabled={!customQuestion.trim()}
                            size="lg"
                            className="w-full bg-gradient-to-r from-teal-400 to-lime-400 hover:from-teal-500 hover:to-lime-500 text-white font-semibold rounded-2xl px-6 sm:px-8 py-3 sm:py-6 text-base sm:text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            この質問を使用
                            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {session.status === "question-display" && session.currentQuestion && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-6 sm:p-10 border-2 border-purple-200 shadow-lg text-center">
              <div className="space-y-4 sm:space-y-6">
                <div className="inline-block bg-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-purple-600">
                  ✨ 魔法の質問
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance text-gray-800 leading-relaxed">
                  {session.currentQuestion.question}
                </h2>
                <p className="text-sm sm:text-base text-gray-600">参加者が回答を入力しています...</p>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Card className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="font-semibold flex items-center gap-1 sm:gap-2 text-gray-700 text-sm sm:text-base">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-teal-400" />
                    リアルタイム回答
                  </h3>
                  <span className="bg-teal-100 text-teal-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                    {session.responses.length}/{session.participants.length}
                  </span>
                </div>

                {session.responses.length === 0 ? (
                  <div className="text-center py-10 sm:py-16 text-gray-400">
                    <div className="animate-pulse mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full mx-auto" />
                    </div>
                    <p className="text-sm">回答を待っています...</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {session.responses.map((response, index) => (
                      <div
                        key={response.id}
                        className="p-3 sm:p-4 bg-gradient-to-r from-teal-50 to-lime-50 rounded-xl border border-teal-100 animate-in fade-in slide-in-from-bottom"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-teal-400 to-lime-400 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {response.participantName.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-gray-600">{response.participantName}</span>
                          <span className="ml-auto text-xs text-gray-400">
                            {new Date(response.submittedAt).toLocaleTimeString("ja-JP", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-sm">{response.answer}</p>
                        
                        {response.analysis && (
                          <div className="mt-3 p-3 bg-white/60 rounded-lg text-sm border border-teal-100/50">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4 text-teal-500" />
                              <span className="font-semibold text-teal-700 text-xs">Gemini 個別分析</span>
                              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                                response.analysis.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                                response.analysis.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {response.analysis.sentiment === 'positive' ? 'ポジティブ' : response.analysis.sentiment === 'negative' ? 'ネガティブ' : 'ニュートラル'}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-2">{response.analysis.summary}</p>
                            
                            {response.analysis.topics && response.analysis.topics.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {response.analysis.topics.map((t, i) => (
                                  <span key={i} className="text-[10px] px-2 py-0.5 bg-teal-50 text-teal-600 rounded-full border border-teal-100">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}

                            {response.analysis.next_actions && response.analysis.next_actions.length > 0 && (
                              <div className="mt-2 text-xs text-gray-500">
                                <span className="font-semibold text-gray-600 block mb-1">推奨アクション:</span>
                                <ul className="list-disc pl-4 space-y-0.5">
                                  {response.analysis.next_actions.map((act, i) => (
                                    <li key={i}>{act}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold mb-3 sm:mb-4 flex items-center gap-1 sm:gap-2 text-gray-700 text-sm sm:text-base">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                  参加状況
                </h3>
                <div className="space-y-2">
                  {session.participants.map((participant) => {
                    const hasResponded = session.responses.some((r) => r.participantId === participant.id)
                    return (
                      <div
                        key={participant.id}
                        className={`flex items-center gap-3 p-3 rounded-xl ${hasResponded ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"
                          }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-semibold text-xs ${hasResponded ? "bg-green-500" : "bg-gray-400"
                            }`}
                        >
                          {participant.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-700 flex-1 text-sm">{participant.name}</span>
                        {hasResponded && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                    )
                  })}
                </div>

                {session.participants.length > 0 && (
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-teal-50 to-lime-50 rounded-xl border border-teal-200">
                    <div className="text-xs text-gray-600 mb-1">回答進捗</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-teal-400 to-lime-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(session.responses.length / session.participants.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-base sm:text-lg font-bold text-teal-600">
                        {Math.round((session.responses.length / session.participants.length) * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {session.responses.length > 0 && session.responses.some((r) => r.asIs && r.toBe) && (
              <Card className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold flex items-center gap-1 sm:gap-2 text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">
                  <BarChart className="h-4 w-4 sm:h-5 sm:w-5 text-teal-400" />
                  回答データの可視化
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* As is vs To be Scores */}
                  <div className="space-y-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-600">As is / To be スコア比較</h4>
                    <div className="space-y-3">
                      {session.responses
                        .filter((response) => response.asIs && response.toBe)
                        .map((response, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span>{response.participantName}</span>
                              <span className="font-semibold">Gap: {response.toBe!.score - response.asIs!.score}</span>
                            </div>
                            <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                              <div
                                className="absolute left-0 h-full bg-red-400 flex items-center justify-center text-xs font-semibold text-white"
                                style={{ width: `${(response.asIs!.score / 10) * 100}%` }}
                              >
                                As is: {response.asIs!.score}
                              </div>
                              <div
                                className="absolute right-0 h-full bg-teal-400 flex items-center justify-center text-xs font-semibold text-white"
                                style={{ width: `${(response.toBe!.score / 10) * 100}%` }}
                              >
                                To be: {response.toBe!.score}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Gap Distribution */}
                  <div className="space-y-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-600">ギャップ分布</h4>
                    <div className="space-y-3">
                      {session.responses
                        .filter((response) => response.asIs && response.toBe)
                        .sort((a, b) => b.toBe!.score - b.asIs!.score - (a.toBe!.score - a.asIs!.score))
                        .map((response, idx) => {
                          const gap = response.toBe!.score - response.asIs!.score
                          return (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-xs text-gray-600 w-20 truncate">{response.participantName}</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center text-xs font-semibold text-white"
                                  style={{ width: `${Math.min((gap / 10) * 100, 100)}%` }}
                                >
                                  {gap > 1 ? `+${gap}` : ""}
                                </div>
                              </div>
                              <span className="text-sm font-semibold text-gray-700 w-12">+{gap}</span>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                </div>
              </Card>
            )}



            <div className="flex justify-center">
              <Button
                onClick={handleAnalyze}
                disabled={isGenerating}
                size="lg"
                className="bg-gradient-to-r from-teal-400 to-lime-400 hover:from-teal-500 hover:to-lime-500 text-white font-semibold rounded-2xl px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg shadow-lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                    AI分析中...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    AI分析を開始
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {session.status === "analysis" && (
          <div className="space-y-6">
            {/* Debug logging removed */}

            <ErrorBoundary
              fallback={
                <Card className="p-6 bg-red-50 border-red-200">
                  <h3 className="text-xl font-bold text-red-600 mb-2">分析結果の表示中にエラーが発生しました</h3>
                  <p className="text-red-500">
                    大変申し訳ありません。分析結果の表示中に予期せぬ問題が発生しました。ページを再読み込みするか、しばらくしてから再度お試しください。
                  </p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="mt-4 bg-gradient-to-r from-teal-400 to-lime-400"
                  >
                    新しいセッションを開始
                  </Button>
                </Card>
              }
              onError={(error, info) => {
                console.error("[v0] Error boundary caught error in analysis section:", error, info)
              }}
            >

              // ... inside component ...
              // const stats = calculateAnalysisStats(session)

              {session.analysis && (
                <AnalysisDisplay
                  analysis={session.analysis}
                  stats={calculateAnalysisStats(session)}
                  onSelectQuestion={handleSelectQuestion}
                />
              )}

              <Accordion
                type="multiple"
                defaultValue={["sentiment", "findings", "responses", "quantitative", "insights", "triggers"]}
                className="space-y-4"
              >
                {/* Sentiment Analysis */}
                {session.analysis?.sentiment && (
                  <AccordionItem value="sentiment" className="border border-teal-200 rounded-2xl overflow-hidden">
                    <AccordionTrigger className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-teal-50 to-lime-50 hover:from-teal-100 hover:to-lime-100 font-semibold text-base sm:text-lg text-gray-700">
                      📊 感情分析
                    </AccordionTrigger>
                    <AccordionContent className="px-4 sm:px-6 py-4 sm:py-6 bg-white">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-sm border border-green-200">
                          <div className="text-4xl sm:text-5xl font-bold text-green-600 mb-2">
                            {session.analysis.sentiment.positive || 0}%
                          </div>
                          <p className="text-xs sm:text-sm text-gray-700 font-medium">ポジティブ</p>
                          <div className="mt-2 sm:mt-3 text-3xl">😊</div>
                        </div>
                        <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-sm border border-gray-200">
                          <div className="text-4xl sm:text-5xl font-bold text-gray-600 mb-2">
                            {session.analysis.sentiment.neutral || 0}%
                          </div>
                          <p className="text-xs sm:text-sm text-gray-700 font-medium">ニュートラル</p>
                          <div className="mt-2 sm:mt-3 text-3xl">😐</div>
                        </div>
                        <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-sm border border-orange-200">
                          <div className="text-4xl sm:text-5xl font-bold text-orange-600 mb-2">
                            {session.analysis.sentiment.negative || 0}%
                          </div>
                          <p className="text-xs sm:text-sm text-gray-700 font-medium">要注意</p>
                          <div className="mt-2 sm:mt-3 text-3xl">😟</div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Key Findings */}
                {session.analysis?.keyFindings &&
                  Array.isArray(session.analysis.keyFindings) &&
                  session.analysis.keyFindings.length > 0 && (
                    <AccordionItem value="findings" className="border border-purple-200 rounded-2xl overflow-hidden">
                      <AccordionTrigger className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 font-semibold text-base sm:text-lg text-gray-700">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-purple-600" />
                          主要な発見
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 sm:px-6 py-4 sm:py-6 bg-white">
                        <div className="space-y-3">
                          {session.analysis.keyFindings.map((finding: string, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 sm:gap-3 bg-gradient-to-r from-purple-50 to-pink-50 p-3 sm:p-4 rounded-2xl border border-purple-100"
                            >
                              <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-xs sm:text-sm">
                                {idx + 1}
                              </div>
                              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{finding}</p>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                {/* Individual Responses with Details */}
                <AccordionItem value="responses" className="border border-blue-200 rounded-2xl overflow-hidden">
                  <AccordionTrigger className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 font-semibold text-base sm:text-lg text-gray-700">
                    <span className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-blue-600" />
                      参加者の回答詳細
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 sm:px-6 py-4 sm:py-6 bg-white">
                    <div className="space-y-4 sm:space-y-6">
                      {session.responses.map((response, idx) => {
                        const participant = session.participants.find((p) => p.id === response.participantId)
                        const asIsScore = typeof response.asIs === "number" ? response.asIs : response.asIs?.score || 0
                        const toBeScore = typeof response.toBe === "number" ? response.toBe : response.toBe?.score || 0
                        const gap = toBeScore - asIsScore
                        return (
                          <div
                            key={response.id}
                            className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 sm:p-6 border border-blue-200"
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-base sm:text-lg">
                                {response.participantName.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <div className="font-bold text-base sm:text-lg text-gray-800">
                                  {response.participantName}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500">
                                  {participant?.role || "member"} • Gap:{" "}
                                  <span className="font-semibold text-orange-600">+{gap}</span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                              <div className="bg-white rounded-xl p-3 sm:p-4 border border-red-200">
                                <div className="text-xs text-gray-600 mb-1">As is (現状)</div>
                                <div className="text-xl sm:text-2xl font-bold text-red-600">{asIsScore}/10</div>
                                <div className="mt-2 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all"
                                    style={{ width: `${(asIsScore / 10) * 100}%` }}
                                  />
                                </div>
                              </div>
                              <div className="bg-white rounded-xl p-3 sm:p-4 border border-teal-200">
                                <div className="text-xs text-gray-600 mb-1">To be (理想)</div>
                                <div className="text-xl sm:text-2xl font-bold text-teal-600">{toBeScore}/10</div>
                                <div className="mt-2 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-teal-400 to-teal-500 h-2 rounded-full transition-all"
                                    style={{ width: `${(toBeScore / 10) * 100}%` }}
                                  />
                                </div>
                              </div>
                              <div className="bg-white rounded-xl p-3 sm:p-4 border border-orange-200">
                                <div className="text-xs text-gray-600 mb-1">Gap (ギャップ)</div>
                                <div className="text-xl sm:text-2xl font-bold text-orange-600">+{gap}</div>
                                <div className="mt-2 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full transition-all"
                                    style={{ width: `${(gap / 10) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
                              <div className="text-xs font-semibold text-gray-600 mb-2">回答内容</div>
                              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{response.answer}</p>
                            </div>

                            {response.perspective && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                                  視点: {response.perspective?.interpretation}
                                </span>
                              </div>
                            )}

                            <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 sm:p-4 border border-purple-100">
                              <div className="flex items-start gap-2">
                                <Lightbulb className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <div className="text-xs font-semibold text-purple-700 mb-1">個別インサイト</div>
                                  <p className="text-xs sm:text-sm text-gray-700">
                                    {gap > 3
                                      ? `大きなギャップ(+${gap})が認識されています。${participant?.role === "manager" ? "マネージャーとして" : "メンバーとして"}、現状と理想の間に強い改善意欲が見られます。`
                                      : `ギャップは比較的小さく(+${gap})、現状に対する満足度が高い、または改善の必要性を強く感じていない可能性があります。`}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Quantitative Data Comparison */}
                <AccordionItem value="quantitative" className="border border-indigo-200 rounded-2xl overflow-hidden">
                  <AccordionTrigger className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 font-semibold text-base sm:text-lg text-gray-700">
                    📈 定量データ比較
                  </AccordionTrigger>
                  <AccordionContent className="px-4 sm:px-6 py-4 sm:py-6 bg-white">
                    <div className="space-y-6">
                      {/* Average Scores */}
                      <div>
                        <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-gray-700">平均スコア</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-600">As is (現状)</span>
                              <span className="text-lg font-bold text-red-600">
                                {(
                                  session.responses.reduce((sum, r) => {
                                    const asIsScore = typeof r.asIs === "number" ? r.asIs : r.asIs?.score || 0
                                    return sum + asIsScore
                                  }, 0) / Math.max(session.responses.length, 1)
                                ).toFixed(1)}
                                /10
                              </span>
                            </div>
                            <div className="bg-gray-200 rounded-full h-3">
                              <div
                                className="bg-gradient-to-r from-red-400 to-red-500 h-3 rounded-full"
                                style={{
                                  width: `${(session.responses.reduce((sum, r) => {
                                    const asIsScore = typeof r.asIs === "number" ? r.asIs : r.asIs?.score || 0
                                    return sum + asIsScore
                                  }, 0) /
                                    Math.max(session.responses.length, 1) /
                                    10) *
                                    100
                                    }%`,
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-600">To be (理想)</span>
                              <span className="text-lg font-bold text-teal-600">
                                {(
                                  session.responses.reduce((sum, r) => {
                                    const toBeScore = typeof r.toBe === "number" ? r.toBe : r.toBe?.score || 0
                                    return sum + toBeScore
                                  }, 0) / Math.max(session.responses.length, 1)
                                ).toFixed(1)}
                                /10
                              </span>
                            </div>
                            <div className="bg-gray-200 rounded-full h-3">
                              <div
                                className="bg-gradient-to-r from-teal-400 to-teal-500 h-3 rounded-full"
                                style={{
                                  width: `${(session.responses.reduce((sum, r) => {
                                    const toBeScore = typeof r.toBe === "number" ? r.toBe : r.toBe?.score || 0
                                    return sum + toBeScore
                                  }, 0) /
                                    Math.max(session.responses.length, 1) /
                                    10) *
                                    100
                                    }%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>



                      {/* Gap Distribution */}
                      <div>
                        <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-gray-700">ギャップ分布</h4>
                        <div className="space-y-2">
                          {session.responses
                            .map((r) => {
                              const asIsScore = typeof r.asIs === "number" ? r.asIs : r.asIs?.score || 0
                              const toBeScore = typeof r.toBe === "number" ? r.toBe : r.toBe?.score || 0
                              return { ...r, calculatedGap: toBeScore - asIsScore }
                            })
                            .sort((a, b) => b.calculatedGap - a.calculatedGap)
                            .map((response, idx) => {
                              return (
                                <div key={response.id} className="flex items-center gap-3">
                                  <div className="w-24 sm:w-32 text-xs sm:text-sm text-gray-600 truncate">
                                    {response.participantName}
                                  </div>
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${response.calculatedGap > 4
                                        ? "bg-gradient-to-r from-red-400 to-orange-500"
                                        : response.calculatedGap > 2
                                          ? "bg-gradient-to-r from-orange-400 to-yellow-500"
                                          : "bg-gradient-to-r from-yellow-400 to-green-500"
                                        }`}
                                      style={{ width: `${Math.min((response.calculatedGap / 10) * 100, 100)}%` }}
                                    />
                                  </div>
                                  <div className="w-12 text-right text-xs sm:text-sm font-semibold text-orange-600">
                                    +{response.calculatedGap.toFixed(1)}
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Pattern Analysis and Cross-Analysis */}
                <AccordionItem value="insights" className="border border-pink-200 rounded-2xl overflow-hidden">
                  <AccordionTrigger className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 font-semibold text-base sm:text-lg text-gray-700">
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-pink-600" />
                      パターン分析とクロス分析
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 sm:px-6 py-4 sm:py-6 bg-white">
                    <div className="space-y-6">
                      {/* Gap Clustering */}
                      <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-200">
                        <h4 className="font-semibold text-base mb-3 text-pink-700">ギャップのクラスタリング</h4>
                        <div className="space-y-2 text-sm text-gray-700">
                          <p>
                            <span className="font-semibold">高ギャップ群（+4以上）:</span>{" "}
                            {
                              session.responses.filter((r) => {
                                const asIsScore = typeof r.asIs === "number" ? r.asIs : r.asIs?.score || 0
                                const toBeScore = typeof r.toBe === "number" ? r.toBe : r.toBe?.score || 0
                                return toBeScore - asIsScore >= 4
                              }).length
                            }
                            名 - 強い改善ニーズ
                          </p>
                          <p>
                            <span className="font-semibold">中ギャップ群（+2〜3）:</span>{" "}
                            {
                              session.responses.filter((r) => {
                                const asIsScore = typeof r.asIs === "number" ? r.asIs : r.asIs?.score || 0
                                const toBeScore = typeof r.toBe === "number" ? r.toBe : r.toBe?.score || 0
                                const gap = toBeScore - asIsScore
                                return gap >= 2 && gap < 4
                              }).length
                            }
                            名 - 適度な改善意識
                          </p>
                          <p>
                            <span className="font-semibold">低ギャップ群（+1以下）:</span>{" "}
                            {
                              session.responses.filter((r) => {
                                const asIsScore = typeof r.asIs === "number" ? r.asIs : r.asIs?.score || 0
                                const toBeScore = typeof r.toBe === "number" ? r.toBe : r.toBe?.score || 0
                                return toBeScore - asIsScore < 2
                              }).length
                            }
                            名 - 現状満足または無関心
                          </p>
                        </div>
                      </div>


                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Curiosity Triggers */}
                {session.analysis?.discussionPoints &&
                  Array.isArray(session.analysis.discussionPoints) &&
                  session.analysis.discussionPoints.length > 0 && (
                    <AccordionItem value="triggers" className="border border-violet-200 rounded-2xl overflow-hidden">
                      <AccordionTrigger className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 font-semibold text-base sm:text-lg text-gray-700">
                        <span className="flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-violet-600" />
                          Curiosity Triggers - 対話を深める問いかけ
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 sm:px-6 py-4 sm:py-6 bg-white">
                        <div className="space-y-3">
                          {session.analysis.discussionPoints.map((trigger: string, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-xl border border-violet-200"
                            >
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm">
                                Q{idx + 1}
                              </div>
                              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{trigger}</p>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
              </Accordion>
              <div className="flex justify-center mt-6">
                <Button
                  onClick={() => downloadReport(session, selectedTheme)}
                  size="lg"
                  variant="outline"
                  className="rounded-2xl px-6 sm:px-8 py-3 sm:py-6 text-base sm:text-lg border-2 border-purple-400 text-purple-600 hover:bg-purple-50"
                >
                  <Download className="h-5 w-5 mr-2" />
                  詳細レポートをダウンロード
                </Button>
              </div>
            </ErrorBoundary>

            <div className="flex justify-center">
              <Button
                onClick={() =>
                  setSession({
                    id: `session-${Date.now()}`,
                    workshopId: workshopId,
                    status: "preparation",
                    participants: [],
                    responses: [],
                    createdAt: new Date().toISOString(),
                    currentQuestion: undefined,
                    analysis: undefined,
                    teamState: undefined,
                  })
                }
                size="lg"
                className="bg-gradient-to-r from-teal-400 to-lime-400 hover:from-teal-500 hover:to-lime-500 text-white font-semibold rounded-2xl px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg shadow-lg"
              >
                新しいセッションを開始
              </Button>
            </div>
          </div>
        )}

        {session.status === "summary" && session.teamState && (
          <div className="space-y-6">
            <Card className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <div className="bg-gradient-to-r from-teal-400 to-lime-400 p-2 sm:p-3 rounded-2xl">
                  <BarChart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                4. チーム状態マップ
              </h2>

              <div className="bg-gradient-to-r from-teal-50 to-lime-50 rounded-2xl p-5 sm:p-8 mb-6 sm:mb-8">
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#cbd5e1" strokeWidth={1.5} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 12, fontWeight: 600 }} />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 10]}
                      tick={{ fill: "#64748b", fontSize: 10 }}
                      tickCount={6}
                    />
                    <Radar
                      name="チーム状態"
                      dataKey="value"
                      stroke="#14b8a6"
                      fill="#2dd4bf"
                      fillOpacity={0.5}
                      strokeWidth={3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {radarData.map((item) => (
                  <div
                    key={item.subject}
                    className="text-center p-3 sm:p-5 bg-white rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-teal-500 to-lime-500 bg-clip-text text-transparent mb-1 sm:mb-2">
                      {item.value}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">{item.subject}</p>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-teal-400 to-lime-400 h-2 rounded-full transition-all"
                        style={{ width: `${(item.value / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-3 sm:gap-4">
                <Button
                  onClick={() => downloadReport(session, selectedTheme)}
                  size="lg"
                  variant="outline"
                  className="rounded-2xl px-6 sm:px-8 py-3 sm:py-6 text-base sm:text-lg border-2 border-purple-400 text-purple-600 hover:bg-purple-50"
                >
                  <Download className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  レポートをダウンロード
                </Button>

                <Button
                  onClick={() =>
                    setSession({
                      id: `session-${Date.now()}`,
                      workshopId: workshopId,
                      status: "preparation",
                      participants: [],
                      responses: [],
                      createdAt: new Date().toISOString(),
                      currentQuestion: undefined,
                      analysis: undefined,
                      teamState: undefined,
                    })
                  }
                  size="lg"
                  className="bg-gradient-to-r from-teal-400 to-lime-400 hover:from-teal-500 hover:to-lime-500 text-white font-semibold rounded-2xl px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg shadow-lg"
                >
                  新しいセッションを開始
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout >
  )
}
