import { GoogleGenAI, Type, Schema } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export async function analyzeSingleResponse(responseData: any) {
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Skipping analysis.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING, description: "回答全体の短い要約" },
      sentiment: { type: Type.STRING, enum: ["positive", "neutral", "negative"], description: "回答の全体的なセンチメント" },
      score: { type: Type.NUMBER, description: "回答の建設性や具体性を0-100で評価したスコア" },
      topics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "回答に含まれる主要なトピック（単語）" },
      risks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "回答から読み取れる組織やチームへの潜在的なリスクや懸念点" },
      next_actions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "この回答に対して推奨されるファシリテーターやマネージャーの次のアクション" }
    },
    required: ["summary", "sentiment", "score", "topics", "risks", "next_actions"]
  };

  const systemPrompt = `
あなたは組織開発の専門家です。
ユーザーから提供されるワークショップの回答データを分析し、JSON形式で結果を返してください。
回答データには、As-Is(現状)、To-Be(理想)、Solution(解決策)、HEROスコア、Vulnerability(脆弱性/本音度)などが含まれます。
`;

  const promptText = `
以下の回答データを分析してください。
---
回答内容: ${responseData.answer || 'なし'}
現状(As-Is): ${responseData.asIs?.fact || 'なし'}
理想(To-Be): ${responseData.toBe?.will || 'なし'}
解決策(Solution): ${responseData.solution?.action || 'なし'}
HERO(Hope, Efficacy, Resilience, Optimism): ${JSON.stringify(responseData.hero || {})}
Vulnerability(Honesty, Resistance): ${JSON.stringify(responseData.vulnerability || {})}
---
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Error in analyzeSingleResponse:", error);
    return null;
  }
}
