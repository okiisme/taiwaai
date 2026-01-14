import { NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

// Define the schema for the analysis result
const analysisSchema = z.object({
  summary: z.string().describe("回答全体の要約"),
  consensus: z.array(z.string()).describe("合意点"),
  conflicts: z.array(z.string()).describe("相違点（Gap Analysisの結果も含む）"),
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
    mutualUnderstanding: z.string().describe("相互理解を促す問い（ワクワクする点は？）"),
    suspendedJudgment: z.string().describe("判断保留を促す問い（障壁は何か？）"),
    smallAgreement: z.string().describe("小さな合意形成を促す問い（明日できることは？）")
  }),
  keyFindings: z.array(z.string()),
  recommendations: z.array(z.string()),
})

export async function POST(request: Request) {
  try {
    console.log("[v0] Analysis API called")
    const { responses, question, workshopId } = await request.json()

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

        return `
Participant ${index + 1} (${r.participantRole || "member"}):
- Answer: ${r.answer}
- As Is (現状): ${r.asIs?.fact} (Score: ${r.asIs?.score})
- To Be (理想): ${r.toBe?.will} (Score: ${r.toBe?.score})
- ${solutionText}
- ${heroScores}
`
      })
      .join("\n---\n")

    const systemPrompt = `
あなたは組織開発の専門家であるファシリテーターAIです。
以下の観点で参加者の回答を分析し、JSON形式で出力してください。

分析観点:
1. **Tags (観点分類)**: 各回答の内容がどこに重点を置いているか？
   - Mindset: 意識、意欲、心理的安全性
   - Process: ルール、会議、役割分担、情報の流れ
   - Environment: 物理的環境、ツール、予算、組織構造
2. **Gap Analysis (認識のズレ)**: マネージャー(manager)とメンバー(member)の間で、現状(As-Is)や理想(To-Be)の捉え方にどのような違いがあるか？「情報の非対称性」が高い部分を特定せよ。
3. **HERO Insight (心理資本)**: HEROスコアのバランスから、チームの心理的状態（病理や強み）を診断せよ。
   - Hope低: 経路が見えない
   - Efficacy低: 実行権限がない
   - Resilience低: 失敗を恐れている
4. **Intervention Questions (介入の問い)**: 
   - 相互理解の問い: ワクワクするポイントは？
   - 判断保留の問い: 障壁は何か？
   - 小さな合意の問い: 明日15分でできることは？

JSON出力スキーマに従ってください。
`

    try {
      const result = await generateObject({
        model: google("gemini-1.5-flash"),
        schema: analysisSchema, // Note: Schema needs update for new fields, using existing for now but prompting for structure logic
        // Actually, I need to update the Schema first to match new requirements or map them.
        // For simplicity in this step, I'll extend the schema locally or map AI output to updated AnalysisResult.
        // Let's stick to the defined Schema but enrich the prompt to ensure content fits into 'keyFindings', 'recommendations', etc. or update schema.
        // Ideally, we update schema. Let's do that in a follow-up or try to fit into existing structure.
        // The user wants specific output structure. I should update schema.

        system: systemPrompt,
        prompt: `以下の回答を分析してください:\n\n${formattedResponses}`,
      })

      // Calculate HERO ROI (Simple Logic)
      // Formula: (Quality x Vulnerability) ^ Action Execution Rate
      // Proxy: Quality = Average Gap Size (higher means clearer gap?), Vulnerability = Avg Openness/Honesty
      // This is a rough simulation as we don't have historical execution rate yet.
      // Let's assume baseline 1.1 for execution rate proxy.
      const avgVulnerability = responses.reduce((acc: number, r: any) => acc + (r.vulnerability?.honesty || 50), 0) / responses.length
      const avgGap = responses.reduce((acc: number, r: any) => acc + Math.abs((r.toBe?.score || 0) - (r.asIs?.score || 0)), 0) / responses.length
      const roiScore = Math.round((avgGap * (avgVulnerability / 10)) * 1.5) // Arbitrary multiplier for effect

      const analysisWithRoi = {
        ...result.object,
        roiScore: roiScore,
        // Add other computed fields if needed
      }

      console.log("[v0] AI Analysis completed successfully")
      return NextResponse.json({ analysis: analysisWithRoi })
    } catch (aiError) {
      console.error("[v0] AI generation error:", aiError)
      return NextResponse.json({
        analysis: {
          summary: "AI分析に失敗しました。",
          consensus: [],
          conflicts: [],
          discussionPoints: [],
          sentiment: { positive: 0, neutral: 0, negative: 0 },
          keyFindings: ["分析サービスに接続できませんでした。"],
          recommendations: ["しばらく待ってから再試行してください。"],
          roiScore: 50
        }
      })
    }

  } catch (error) {
    console.error("[v0] Error in analysis route:", error)
    return NextResponse.json(
      { error: "Failed to analyze responses", analysis: null },
      { status: 500 },
    )
  }
}
