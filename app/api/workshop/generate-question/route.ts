import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { theme } = await req.json()

    if (!theme) {
      return Response.json({ error: "Theme is required" }, { status: 400 })
    }

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt: `あなたは組織開発とチームビルディングの専門家です。以下のテーマについて、チームメンバーの深い洞察を引き出すための「魔法の質問」を1つ生成してください。

テーマ: ${theme}

質問の条件:
- チームメンバーが本音で答えられる心理的安全性を感じる質問
- 具体的な行動や感情を引き出せる質問
- 「はい/いいえ」では答えられない、深い思考を促す質問
- 30文字以上、100文字以内
- 日本語で自然な表現

質問のみを出力してください。説明や前置きは不要です。`,
      maxTokens: 200,
      temperature: 0.8,
    })

    console.log("[v0] Generated question:", text.trim())

    return Response.json({ question: text.trim() })
  } catch (error) {
    console.error("[v0] Error generating question:", error)
    return Response.json(
      { error: "Failed to generate question", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
