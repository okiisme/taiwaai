import { NextResponse } from "next/server"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
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

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      console.error("[v0] API KEY is missing. Env check:", process.env.NODE_ENV);
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
          keyFindings: ["GEMINI_API_KEY 環境変数が設定されていません。"],
          recommendations: ["Vercelの設定、または .env.local ファイルを確認してください。"],
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
参加者の回答データ（As-Is/To-Be/Solution/HERO/Vulnerability）を分析し、**「表面的な要約」ではなく「構造的な深い洞察」**を提供してください。

以下の3つの視点で分析を実行し、JSONを出力してください：

1. **断絶の解剖 (The Disconnect Analyzer) -> field: gapAnalysis**
   - マネージャー(Role: manager)とメンバー(Role: member)の間にある「認知のズレ」を特定せよ。
   - 特に「解決策の方向性」のズレに着目せよ（例：上司は「意識(Mindset)」の問題とし、部下は「仕組み(Process)」の問題としている等）。
   - Lemon Market Alertは、このズレが致命的で対話不能なレベルの場合に High とせよ。

2. **語られない本音 (The Unspoken Voice) -> field: gravityStatus / heroInsight.pathology**
   - VulnerabilityのHonesty(本音度)が低い、またはResistance(抵抗感)が高い回答に注目せよ。
   - テキストが「特に問題ない」等の無難なものでも、スコアが低い場合は「諦め」「学習性無力感」「心理的安全性欠如」と深読みし、それを指摘せよ。
   - Gravity Statusには、この「空気感」をメタファー（例：冷戦状態、仮面舞踏会）で表現せよ。

3. **ボトルネック特定 (The Action Blocker) -> field: structuralBridge**
   - HEROスコアとSolutionの整合性を見よ。
   - Hope(希望)は高いがSolutionが抽象的な場合は「夢見がち(Dreamer)」、Efficacy(効力感)が低くSolutionが他責的な場合は「当事者意識の欠如」と指摘せよ。
   - Missing Linkには、スコアとテキストの矛盾から見える「議論されていない真の課題」を記述せよ。

■ Intervention (介入) の生成
- 上記の分析に基づき、ファシリテーターが投げかけるべき「鋭いが愛のある問い」を作成せよ。
- Mutual Understanding: 互いの「前提」を疑う問い。
- Suspended Judgment: マネージャーが耳を痛くしてでも聞くべき問い。
- Small Agreement: 壮大な理想ではなく、明日できる具体的な一歩。

JSON出力スキーマに厳密に従ってください。
`

    try {
      const validApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

      if (!validApiKey) {
        console.error("API Key missing");
        throw new Error("API Key not configured (GEMINI_API_KEY).");
      }

      const google = createGoogleGenerativeAI({
        apiKey: validApiKey,
      });

      const result = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: analysisSchema,
        system: systemPrompt,
        prompt: `以下の回答を分析し、チームの現状と次の一手を明確にしてください: \n\n${formattedResponses} `,
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

      // Analyze specific error causes
      // Show exact raw error message from Google for debugging
      const errorMessage = aiError.message?.toLowerCase() || ""
      const errorName = aiError.name || ""
      let friendlyError = "AIエラーが発生しました"
      let detailedReason = `詳細: ${aiError.message || "詳細不明"}`
      let actionSuggestion = "コンソールのログまたはエラー詳細を確認してください。"

      if (errorMessage.includes("api key not configured") || errorMessage.includes("missing")) {
        friendlyError = "APIキーが設定されていません。"
        actionSuggestion = "Vercelの環境変数 GEMINI_API_KEY を設定してください。"
      } else if (errorMessage.includes("invalid api key") || errorMessage.includes("401") || errorMessage.includes("unauthorized")) {
        friendlyError = "APIキーが不正です (401 Unauthorized)"
        detailedReason += " (コピペミスや、無効化された古いキーを使っている可能性があります)"
        actionSuggestion = "APIキーが正確にコピーされているか確認してください。"
      } else if (errorMessage.includes("permission") || errorMessage.includes("403") || errorMessage.includes("forbidden")) {
        friendlyError = "権限エラーまたはAPI未有効化 (403 Forbidden)"
        detailedReason += " (Google Cloudプロジェクトで Generative Language API が有効になっていないか、IP制限に引っかかっています)"
        actionSuggestion = "Google Cloud Console で API が有効になっているか確認してください。"
      } else if (errorMessage.includes("billing") || errorMessage.includes("payment")) {
        friendlyError = "課金設定(Billing)のエラーです。"
        detailedReason += " (Google Cloudプロジェクトにクレジットカード等の支払い設定がされていない可能性があります)"
        actionSuggestion = "Google Cloudの課金設定を確認してください。"
      } else if (errorMessage.includes("not found") || errorMessage.includes("404")) {
        friendlyError = "指定されたAIモデルが見つかりません。"
        
        // 【究極のデバッグ】そのAPIキーで今本当に使えるモデル一覧を自動取得して表示する
        let availableModelsInfo = "";
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${validApiKey}`);
          const data = await res.json();
          if (data.models) {
            const modelNames = data.models
              .map((m: any) => m.name.replace("models/", ""))
              .filter((n: string) => n.includes("gemini"))
              .join(", ");
            availableModelsInfo = `\n\n💡【現在このAPIキーで使えるモデル一覧】:\n${modelNames || "（なし）"}`;
          } else if (data.error) {
            availableModelsInfo = `\n\n(※モデル一覧取得エラー: ${data.error.message})`;
          }
        } catch (listError: any) {
           availableModelsInfo = `\n\n(※利用可能モデル一覧の取得にも失敗しました: ${listError.message})`;
        }
        
        detailedReason = `詳細: ${aiError.message}${availableModelsInfo}`
        actionSuggestion = "上に表示された「使えるモデル一覧」のどれかに、プログラム内のモデル名表記を合わせる必要があります。"

      } else if (errorMessage.includes("quota") || errorMessage.includes("429") || errorMessage.includes("too many requests")) {
        friendlyError = "利用上限(Quota)に達しました (429 Too Many Requests)"
        detailedReason += " (無料枠の制限、または短時間にリクエストを送りすぎました)"
        actionSuggestion = "しばらく待つか、Google Cloudで上限引き上げ（課金設定）を行ってください。"
      } else if (errorMessage.includes("bad request") || errorMessage.includes("400")) {
        friendlyError = "リクエストが不正です (400 Bad Request)"
        detailedReason += " (送った回答データが多すぎるか、AIへの命令フォーマットが間違っています)"
        actionSuggestion = "回答の件数を減らして再度お試しください。"
      } else if (errorMessage.includes("safety") || errorMessage.includes("blocked")) {
        friendlyError = "セーフティフィルターによるブロック"
        detailedReason += " (回答データの中に、AIが不適切と判断した言葉が含まれているためブロックされました)"
        actionSuggestion = "過激な言葉や個人情報が含まれていないか確認してください。"
      } else if (errorMessage.includes("timeout") || errorMessage.includes("econnreset") || errorMessage.includes("fetch failed")) {
        friendlyError = "通信エラー・タイムアウト"
        detailedReason += " (Googleのサーバーへの接続に失敗したか、時間がかかりすぎました)"
        actionSuggestion = "ネットワークの一時的な問題です。もう一度お試しください。"
      } else if (errorMessage.includes("json") || errorMessage.includes("parse") || errorName.includes("JSONParseError")) {
        friendlyError = "AIの出力パース失敗"
        detailedReason += " (AIがJSONフォーマットを守れず、データの解析に失敗しました)"
        actionSuggestion = "AIの気まぐれによる一時的なエラーです。もう一度「AI分析を開始」を押してください。"
      } else if (errorMessage.includes("500") || errorMessage.includes("503")) {
        friendlyError = "Google側のサーバー障害 (500/503)"
        detailedReason += " (現在GoogleのGeminiサーバーで障害が起きているか、混雑しています)"
        actionSuggestion = "Google側の問題です。しばらく時間をおいてから再試行してください。"
      }

      return NextResponse.json({
        analysis: {
          summary: "AI分析に失敗しました。",
          gravityStatus: "システムエラー: " + friendlyError,
          warmth: 0,
          structuralBridge: {
            missingLink: `【原因】${detailedReason}`,
            bridgeBalance: "Error"
          },
          assetPrediction: { retentionRate: 0, decisionLog: actionSuggestion },
          consensus: [],
          conflicts: [],
          discussionPoints: [],
          sentiment: { positive: 0, neutral: 0, negative: 0 },
          tags: { mindset: 0, process: 0, environment: 0 },
          gapAnalysis: { managerView: "-", memberView: "-", asymmetryLevel: "-", lemonMarketRisk: "-" },
          heroInsight: { pathology: "-", strength: "-", scores: { hope: 0, efficacy: 0, resilience: 0, optimism: 0 } },
          interventionQuestions: { mutualUnderstanding: "-", suspendedJudgment: "-", smallAgreement: "-" },
          keyFindings: [friendlyError, detailedReason, actionSuggestion],
          recommendations: [actionSuggestion],
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
