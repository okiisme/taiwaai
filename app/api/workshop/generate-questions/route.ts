import { NextResponse } from "next/server"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"

export async function POST(request: Request) {
  const { theme } = await request.json()

  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) throw new Error("API key not configured")

    const google = createGoogleGenerativeAI({ apiKey })

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `あなたは経験豊富なファシリテーターです。以下のテーマに基づいて、チームの対話を深める「魔法の質問」を3つ生成してください。

テーマ: ${theme}

条件:
- 各質問は参加者が本音で答えやすいものにする
- 具体的なエピソードや感情を引き出せる質問にする
- チームの課題や可能性を可視化できる質問にする
- 「はい/いいえ」ではなく、深い対話を促す質問にする

以下の形式で3つの質問を提供してください:

1. [質問1]
2. [質問2]
3. [質問3]

質問だけを出力してください。説明は不要です。`,
    })

    const questions = text
      .split('\n')
      .filter(line => line.match(/^\d+\./))
      .map((line) => ({
        id: crypto.randomUUID(),
        theme,
        question: line.replace(/^\d+\.\s*/, '').trim(),
        intent: theme,
        followUps: [],
      }))

    if (questions.length === 0) {
      questions.push(
        { id: crypto.randomUUID(), theme, question: getQuestionForTheme(theme, 1), intent: theme, followUps: [] },
        { id: crypto.randomUUID(), theme, question: getQuestionForTheme(theme, 2), intent: theme, followUps: [] },
        { id: crypto.randomUUID(), theme, question: getQuestionForTheme(theme, 3), intent: theme, followUps: [] },
      )
    }

    return NextResponse.json({ questions })
  } catch (error) {
    const fallbackQuestions = [
      { id: crypto.randomUUID(), theme, question: getQuestionForTheme(theme, 1), intent: theme, followUps: [] },
      { id: crypto.randomUUID(), theme, question: getQuestionForTheme(theme, 2), intent: theme, followUps: [] },
      { id: crypto.randomUUID(), theme, question: getQuestionForTheme(theme, 3), intent: theme, followUps: [] },
    ]
    return NextResponse.json({ questions: fallbackQuestions })
  }
}

function getQuestionForTheme(theme: string, variant: number): string {
  const questionMap: Record<string, string[]> = {
    心理的安全性: [
      "このチームで「本当はもっと良くできるはず」と感じていることは何ですか？",
      "失敗を恐れずにチャレンジできる環境だと感じますか？その理由は？",
      "チーム内でもっとオープンに話せたらいいと思うことはありますか？",
    ],
    "自律性と明確さ": [
      "自分の役割や期待されていることは明確だと感じますか？",
      "業務を進める上で、もっと自由に判断できたらいいと思うことは？",
      "チーム全体の目標と自分の仕事の繋がりが見えていますか？",
    ],
    "チームの一体感": [
      "チームメンバーとの関係で、もっと深めたいと思うことはありますか？",
      "チームの一体感を高めるために、あなたが大切にしたいことは何ですか？",
      "最近、チームメンバーに助けられたり、感謝したことはありますか？",
    ],
    成長機会: [
      "この1ヶ月で、自分が成長したと感じた瞬間はありましたか？",
      "今後チャレンジしてみたいことや、学びたいスキルは何ですか？",
      "チームの中で、もっと活かせていない自分の強みはありますか？",
    ],
  }

  const questions = questionMap[theme] || questionMap["心理的安全性"]
  return questions[variant - 1] || questions[0]
}
