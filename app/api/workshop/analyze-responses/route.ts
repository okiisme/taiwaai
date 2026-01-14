import { NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

// Define the schema for the analysis result
const analysisSchema = z.object({
  summary: z.string().describe("回答全体の要約。チーム全体の傾向や特徴的なパターンを簡潔に記述"),
  consensus: z.array(z.string()).describe("参加者間で意見が一致している点（合意点）のリスト"),
  conflicts: z.array(z.string()).describe("意見が割れている点、または対立している点（相違点）のリスト"),
  discussionPoints: z.array(z.string()).describe("対話を深めるための問いかけ（Curiosity Triggers）のリスト"),
  sentiment: z.object({
    positive: z.number().describe("ポジティブな意見の割合（0-100）"),
    neutral: z.number().describe("中立的な意見の割合（0-100）"),
    negative: z.number().describe("ネガティブな意見の割合（0-100）"),
  }),
  keyFindings: z.array(z.string()).describe("データから読み取れる重要な発見や洞察"),
  recommendations: z.array(z.string()).describe("チームへの具体的なアクション提案"),
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
          : r.gap
            ? `Gap: ${r.gap.interpretation}`
            : "No explicit solution/gap provided"

        return `
Participant ${index + 1} (${r.participantRole || "member"}):
- Answer: ${r.answer}
- As Is (現状): ${r.asIs?.fact} (Score: ${r.asIs?.score})
- To Be (理想): ${r.toBe?.will} (Score: ${r.toBe?.score})
- ${solutionText}
`
      })
      .join("\n---\n")

    const systemPrompt = `
あなたはプロのファシリテーターです。チームビルディングワークショップにおける参加者の回答を分析し、
対話を促進するための洞察を提供してください。

現在の質問: "${question}"

分析の観点:
1. **Consensus (合意点)**: 多くの参加者が共通して感じている課題や理想は何か？
2. **Conflicts (相違点)**: 役割（マネージャー vs メンバー）やスタンスによって意見が食い違っている部分はどこか？
   - 特に「As Isスコア」や「To Beスコア」のギャップに注目してください。
   - "Solution"のアプローチの違い（例：仕組み作り重視 vs 対話重視）にも注目してください。
3. **Discussion Points**: チームが避けている本質的な課題や、深掘りすべき矛盾は何か？
   - 参加者がハッとするような「問い」を立ててください。

回答データ形式:
JSON形式で返却してください。
`

    try {
      const result = await generateObject({
        model: google("gemini-1.5-flash"), // Use Gemini 1.5 Flash for speed/cost efficiency
        schema: analysisSchema,
        system: systemPrompt,
        prompt: `以下の参加者回答を分析してください:\n\n${formattedResponses}`,
      })

      console.log("[v0] AI Analysis completed successfully")
      return NextResponse.json({ analysis: result.object })
    } catch (aiError) {
      console.error("[v0] AI generation error:", aiError)

      // Fallback to mock data if AI fails (e.g. API key missing)
      console.log("[v0] Falling back to mock analysis")
      const mockAnalysis = {
        summary: "AI分析中にエラーが発生しましたが、チームの回答傾向には多様性が見られます。",
        consensus: ["変化の必要性は共有されている可能性が高い"],
        conflicts: ["具体的な手法において意見の相違がある可能性"],
        discussionPoints: ["理想と現状のギャップをどう埋めるか？"],
        sentiment: { positive: 50, neutral: 30, negative: 20 },
        keyFindings: ["自動分析が利用できませんでした"],
        recommendations: ["システム設定を確認してください"],
      }
      return NextResponse.json({ analysis: mockAnalysis })
    }

  } catch (error) {
    console.error("[v0] Error in analysis route:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze responses",
        analysis: null,
      },
      { status: 500 },
    )
  }
}
