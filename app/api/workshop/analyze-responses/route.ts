import { NextResponse } from "next/server"
import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"

// Define the schema for the analysis result
const analysisSchema = z.object({
  summary: z.string().describe("回答全体の要約"),
  gravityStatus: z.string().describe("対話の現在の重力状態（例：'浮遊開始：解決への糸口が見え始めた状態'、'停滞：重力が強く議論が噛み合わない状態'など）"),
  warmth: z.number().describe("場の温かさ (0-100)。本音度と安心感から算出"),
  consensus: z.array(z.string()).describe("合意点 (Consensus Area): 全員が認めている課題や北極星"),
  conflicts: z.array(z.string()).describe("相違点 (Divergence Area): 立場による認識差やアプローチの違い"),
  structuralBridge: z.object({
    missingLink: z.string().describe("構造的欠落 (Missing Link): 理想に対して欠けている議論（例：リソース不足、具体性欠如）"),
    bridgeBalance: z.string().describe("解決策のバランス評価（例：Mindset偏重、Environment偏重、Balanced）")
  }),
  discussionPoints: z.array(z.string()).describe("対話を深めるための問い"),
  sentiment: z.object({
    positive: z.number(),
    neutral: z.number(),
    negative: z.number(),
  }),
  // New specific fields
  tags: z.object({
    mindset: z.number().describe("Mindset (意識・意欲) に関言及した割合または重要度 (0-100)"),
    process: z.number().describe("Process (仕組み・ルール) に関言及した割合または重要度 (0-100)"),
    environment: z.number().describe("Environment (環境・予算) に関言及した割合または重要度 (0-100)")
  }).describe("3軸の観点比重"),
  gapAnalysis: z.object({
    managerView: z.string().describe("マネージャー層の支配的な見解"),
    memberView: z.string().describe("メンバー層の支配的な見解"),
    asymmetryLevel: z.string().describe("情報の非対称性レベル (High/Medium/Low)"),
    lemonMarketRisk: z.string().describe("レモン市場化（認識のズレによる質の低下）のリスク記述")
  }),
  heroInsight: z.object({
    pathology: z.string().describe("HEROスコアから読み取れる組織の病理（例：Hope不足、Efficacy欠如）"),
    strength: z.string().describe("チームの強みとなっている心理的要素"),
    scores: z.object({
      hope: z.number().describe("推定されるチーム全体のHopeレベル (0-100)"),
      efficacy: z.number().describe("推定されるチーム全体のEfficacyレベル (0-100)"),
      resilience: z.number().describe("推定されるチーム全体のResilienceレベル (0-100)"),
      optimism: z.number().describe("推定されるチーム全体のOptimismレベル (0-100)")
    })
  }),
  interventionQuestions: z.object({
    mutualUnderstanding: z.string().describe("相互理解を促す問い（沈黙を壊す優しい問い）"),
    suspendedJudgment: z.string().describe("判断保留を促す問い（構造を深める高い視座からの問い）"),
    smallAgreement: z.string().describe("小さな合意形成を促す問い（行動を促す最初の一歩の問い）")
  }),
  assetPrediction: z.object({
    retentionRate: z.number().describe("資産定着率の予測 (0-100%)"),
    decisionLog: z.string().describe("意思決定ログの案（誰が、いつ、何をするか）")
  }),
  keyFindings: z.array(z.string()),
  recommendations: z.array(z.string()),
})

export async function POST(request: Request) {
  try {
    console.log("[v0] Analysis API called")

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      console.error("[v0] GOOGLE_GENERATIVE_AI_API_KEY is missing")
      return NextResponse.json({
        analysis: {
          summary: "APIキーが設定されていません。",
          gravityStatus: "システムエラー",
          warmth: 0,
          structuralBridge: { missingLink: "システム管理者に連絡してください", bridgeBalance: "Unknown" },
          assetPrediction: { retentionRate: 0, decisionLog: "API Key Missing" },
          consensus: [],
          conflicts: [],
          discussionPoints: [],
          sentiment: { positive: 0, neutral: 0, negative: 0 },
          tags: { mindset: 0, process: 0, environment: 0 },
          gapAnalysis: { managerView: "-", memberView: "-", asymmetryLevel: "-", lemonMarketRisk: "-" },
          heroInsight: { pathology: "-", strength: "-", scores: { hope: 0, efficacy: 0, resilience: 0, optimism: 0 } },
          interventionQuestions: { mutualUnderstanding: "-", suspendedJudgment: "-", smallAgreement: "-" },
          keyFindings: ["GOOGLE_GENERATIVE_AI_API_KEY environment variable is missing."],
          recommendations: ["Check your .env.local file."],
          roiScore: 0
        }
      })
    }

    const body = await request.json()
    const { responses, question, workshopId } = body

    if (!responses || responses.length === 0) {
      console.log("[v0] No responses provided")
      return NextResponse.json({ error: "No responses provided" }, { status: 400 })
    }

    console.log("[v0] Analyzing", responses.length, "responses for question:", question)

    // Format responses for the AI prompt
    const formattedResponses = responses
      .map((r: any, index: number) => {
        const solutionText = r.solution
          ? `Solution(解決策): ${r.solution.action} (Tags: ${r.solution.tags?.join(", ")})`
          : "No explicit solution provided"

        const heroScores = r.hero
          ? `HERO: Hope(${r.hero.hope}), Efficacy(${r.hero.efficacy}), Resilience(${r.hero.resilience}), Optimism(${r.hero.optimism})`
          : "No HERO scores"

        const vulnerability = r.vulnerability
          ? `Vulnerability: Honesty(${r.vulnerability.honesty}%), Resistance(${r.vulnerability.resistance}%)`
          : "No vulnerability data"

        return `
Participant ${index + 1} (${r.participantRole || "member"}):
- Answer: ${r.answer}
- As Is (現状): ${r.asIs?.fact} (Score: ${r.asIs?.score})
- To Be (理想): ${r.toBe?.will} (Score: ${r.toBe?.score})
- ${solutionText}
- ${heroScores}
- ${vulnerability}
`
      })
      .join("\n---\n")

    const systemPrompt = `
あなたは組織開発の専門家であるファシリテーターAIです。
以下の3つの論理エンジンを用いて、参加者の回答を深く分析し、JSON形式で出力してください。

■ 第1エンジン：構造ブリッジ解析 (Structural Bridge)
・As-Is（事実）からTo-Be（理想）への距離を計算し、Solution（解決策）がその橋渡しとして機能しているか評価せよ。
・「Structural Bridge」フィールドに、構造的欠落（Missing Link）と解決策のバランス（Mindset/Process/Environmentの偏り）を出力せよ。

■ 第2エンジン：情報非対称性解析 (Information Asymmetry)
・ManagerとMemberの間で、同じ言葉を違う意味で使っていないか？一方が触れていない死角はないか？
・「Gap Analysis」フィールドに、視点の違いと情報の非対称性レベルを出力せよ。

■ 第3エンジン：心理資本ダイナミクス (Psycho-Capital Dynamics)
・HEROスコア（Hope, Efficacy, Resilience, Optimism）のバランスと、テキストの内容が整合しているか検証せよ。
・「HERO Insight」フィールドに、組織の病理と強みを出力せよ。
・「Gravity Status」には、現在の対話の状態（浮遊開始、停滞、墜落リスクなど）を記述せよ。

■ その他
・"Warmth" (場の温かさ) は、VulnerabilityのHonestyが高いほど高く、Resistanceが高いほど低くなるよう評価せよ(0-100)。
・"Intervention Questions" には、沈黙を壊す問い、構造を深める問い、行動を促す問いの3種類を生成せよ。
・"Asset Prediction" には、この対話が資産として定着する確率と、具体的なアクション案を出力せよ。

JSON出力スキーマに厳密に従ってください。
`

    try {
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        throw new Error("API Key not configured (GOOGLE_GENERATIVE_AI_API_KEY).");
      }

      const result = await generateObject({
        model: google("gemini-1.5-flash"),
        schema: analysisSchema,
        system: systemPrompt,
        prompt: `以下の回答を分析してください:\n\n${formattedResponses}`,
      })

      // Calculate HERO ROI logic (updated)
      // Proxy: Quality = Bridge Balance (AI eval) + Gap Clarity
      // Vulnerability = Avg Honesty
      const avgVulnerability = responses.reduce((acc: number, r: any) => acc + (r.vulnerability?.honesty || 0), 0) / (responses.length || 1)
      const avgGap = responses.reduce((acc: number, r: any) => acc + Math.abs((r.toBe?.score || 0) - (r.asIs?.score || 0)), 0) / (responses.length || 1)

      // ROI Calculation: Base + (Vulnerability * GapCoef)
      // If no vulnerability data, assume 50
      const safeVulnerability = avgVulnerability || 50

      let roiScore = 50 + ((safeVulnerability - 50) + (avgGap * 10)) / 2;
      roiScore = Math.min(Math.max(Math.round(roiScore), 0), 100);

      const analysisWithRoi = {
        ...result.object,
        roiScore: roiScore,
      }

      console.log("[v0] AI Analysis completed successfully")
      return NextResponse.json({ analysis: analysisWithRoi })
    } catch (aiError: any) {
      console.error("[v0] AI generation error:", aiError)
      return NextResponse.json({
        analysis: {
          summary: "AI分析中にエラーが発生しました。",
          gravityStatus: "システムエラー",
          warmth: 0,
          structuralBridge: { missingLink: `Error: ${aiError.message || "Unknown"}`, bridgeBalance: "Unknown" },
          assetPrediction: { retentionRate: 0, decisionLog: "再試行してください" },
          consensus: [],
          conflicts: [],
          discussionPoints: [],
          sentiment: { positive: 0, neutral: 0, negative: 0 },
          tags: { mindset: 0, process: 0, environment: 0 },
          gapAnalysis: { managerView: "-", memberView: "-", asymmetryLevel: "-", lemonMarketRisk: "-" },
          heroInsight: { pathology: "-", strength: "-", scores: { hope: 0, efficacy: 0, resilience: 0, optimism: 0 } },
          interventionQuestions: { mutualUnderstanding: "-", suspendedJudgment: "-", smallAgreement: "-" },
          keyFindings: [`エラー内容: ${aiError.message || "詳細不明"}`],
          recommendations: ["しばらく待ってから再試行してください。", "APIキーの設定を確認してください。"],
          roiScore: 0
        }
      })
    }

  } catch (error: any) {
    console.error("[v0] Error in analysis route:", error)
    return NextResponse.json(
      { error: "Failed to analyze responses", analysis: null },
      { status: 500 },
    )
  }
}
