import type { Workshop, PreWorkshopSurvey } from "./types"

export const mockWorkshops: Workshop[] = [
  {
    id: "ws-1",
    teamId: "team-1",
    scheduledDate: "2025-01-20T10:00:00Z",
    status: "scheduled",
    facilitatorId: "facilitator-1",
    preWorkshopCompleted: 8,
    totalMembers: 12,
  },
  {
    id: "ws-2",
    teamId: "team-1",
    scheduledDate: "2024-12-15T10:00:00Z",
    status: "completed",
    facilitatorId: "facilitator-1",
    preWorkshopCompleted: 12,
    totalMembers: 12,
  },
]

export const mockPreWorkshopSurveys: PreWorkshopSurvey[] = [
  {
    id: "survey-1",
    workshopId: "ws-1",
    userId: "user-2",
    responses: {
      teamSatisfaction: 7,
      communicationQuality: 6,
      psychologicalSafety: 8,
      workload: 5,
      openFeedback: "チーム内のコミュニケーションをもっと改善したいです。",
    },
    submittedAt: "2025-01-10T09:00:00Z",
  },
]

export interface Question {
  id: string
  workshopId: string
  userId: string
  userName: string
  question: string
  isAnonymous: boolean
  upvotes: number
  answered: boolean
  answer?: string
  createdAt: string
}

export const mockQuestions: Question[] = [
  {
    id: "q-1",
    workshopId: "ws-1",
    userId: "user-2",
    userName: "匿名",
    question: "プロジェクトの優先順位が頻繁に変わることについて、どう対処すればいいでしょうか？",
    isAnonymous: true,
    upvotes: 5,
    answered: false,
    createdAt: "2025-01-15T10:30:00Z",
  },
  {
    id: "q-2",
    workshopId: "ws-1",
    userId: "user-3",
    userName: "匿名",
    question: "リモートワークでチームの一体感を保つための良い方法はありますか？",
    isAnonymous: true,
    upvotes: 3,
    answered: true,
    answer: "定期的なオンラインミーティングと、カジュアルな雑談の時間を設けることが効果的です。",
    createdAt: "2025-01-15T10:45:00Z",
  },
]

export interface CaptainLog {
  id: string
  workshopId: string
  userId: string
  content: string
  createdAt: string
}

export const mockCaptainLogs: CaptainLog[] = [
  {
    id: "log-1",
    workshopId: "ws-2",
    userId: "user-1",
    content:
      "今回のワークショップで、チームメンバーが抱えている課題が明確になりました。特にコミュニケーションの改善が必要だと感じています。",
    createdAt: "2024-12-15T15:00:00Z",
  },
]

export interface WeeklySurveyData {
  id: string
  userId: string
  weekNumber: number
  responses: {
    mood: number
    productivity: number
    teamCollaboration: number
    concerns: string
  }
  submittedAt: string
}

export const mockWeeklySurveys: WeeklySurveyData[] = [
  {
    id: "ws-1",
    userId: "user-2",
    weekNumber: 1,
    responses: {
      mood: 7,
      productivity: 8,
      teamCollaboration: 6,
      concerns: "プロジェクトの優先順位が不明確です",
    },
    submittedAt: "2025-01-06T10:00:00Z",
  },
  {
    id: "ws-2",
    userId: "user-2",
    weekNumber: 2,
    responses: {
      mood: 8,
      productivity: 7,
      teamCollaboration: 8,
      concerns: "",
    },
    submittedAt: "2025-01-13T10:00:00Z",
  },
]

export interface SentimentData {
  weekNumber: number
  date: string
  overallScore: number
  mood: number
  productivity: number
  collaboration: number
  trends: {
    positive: number
    neutral: number
    negative: number
  }
  keyThemes: string[]
  recommendations: string[]
}

export const mockSentimentData: SentimentData[] = [
  {
    weekNumber: 1,
    date: "2025-01-06",
    overallScore: 7.2,
    mood: 7.5,
    productivity: 7.8,
    collaboration: 6.5,
    trends: {
      positive: 45,
      neutral: 35,
      negative: 20,
    },
    keyThemes: ["優先順位の不明確さ", "コミュニケーション改善の必要性"],
    recommendations: ["週次ミーティングで優先順位を明確化する", "チーム内のコミュニケーションツールを見直す"],
  },
  {
    weekNumber: 2,
    date: "2025-01-13",
    overallScore: 7.8,
    mood: 8.2,
    productivity: 7.5,
    collaboration: 7.8,
    trends: {
      positive: 55,
      neutral: 30,
      negative: 15,
    },
    keyThemes: ["チームワークの向上", "生産性の安定"],
    recommendations: ["現在の良い流れを維持する", "定期的なフィードバックセッションを継続する"],
  },
  {
    weekNumber: 3,
    date: "2025-01-20",
    overallScore: 8.1,
    mood: 8.5,
    productivity: 8.0,
    collaboration: 7.8,
    trends: {
      positive: 60,
      neutral: 28,
      negative: 12,
    },
    keyThemes: ["高いモチベーション", "効果的な協力体制"],
    recommendations: ["チームの成功事例を共有する", "メンバーの貢献を認識する機会を増やす"],
  },
  {
    weekNumber: 4,
    date: "2025-01-27",
    overallScore: 7.5,
    mood: 7.8,
    productivity: 7.5,
    collaboration: 7.2,
    trends: {
      positive: 50,
      neutral: 32,
      negative: 18,
    },
    keyThemes: ["業務量の増加", "疲労の兆候"],
    recommendations: ["業務の優先順位を再確認する", "チームメンバーの負荷を分散する"],
  },
]
