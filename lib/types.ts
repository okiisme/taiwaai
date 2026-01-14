export type UserRole = "manager" | "member" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  companyId: string
  teamId?: string
  createdAt: string
}

export interface Company {
  id: string
  name: string
  industry: string
  employeeCount: number
  createdAt: string
}

export interface Team {
  id: string
  name: string
  companyId: string
  managerId: string
  memberCount: number
  createdAt: string
}

export interface Workshop {
  id: string
  teamId: string
  scheduledDate: string
  status: "scheduled" | "in-progress" | "completed"
  facilitatorId: string
  preWorkshopCompleted: number
  totalMembers: number
}

export interface PreWorkshopSurvey {
  id: string
  workshopId: string
  userId: string
  responses: {
    teamSatisfaction: number
    communicationQuality: number
    psychologicalSafety: number
    workload: number
    openFeedback: string
  }
  submittedAt: string
}

export interface WeeklySurvey {
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

export interface SentimentAnalysis {
  id: string
  teamId: string
  weekNumber: number
  overallScore: number
  trends: {
    positive: number
    neutral: number
    negative: number
  }
  keyThemes: string[]
  recommendations: string[]
  generatedAt: string
}

export interface WorkshopSession {
  id: string
  workshopId: string
  status: "preparation" | "stance-review" | "theme-selection" | "question-display" | "analysis" | "summary"
  participants: Participant[]
  currentQuestion?: GeneratedQuestion
  responses: Response[]
  analysis?: AnalysisResult
  teamState?: TeamState
  createdAt: string
}

export interface Participant {
  id: string
  name: string
  role?: "manager" | "member"
  stance?: {
    energyLevel: number // 0-100
    currentMode: "divergent" | "convergent" | "challenge" | "reflection"
    openness: number // 0-100
    moodColor?: string // New: Color representing mood
  }
  mode?: "divergent" | "convergent" | "challenge" | "reflection"
  joinedAt: string
}

export interface GeneratedQuestion {
  id: string
  theme: string
  question: string
  selected: boolean
}

export interface Response {
  id: string
  participantId: string
  participantName: string
  participantRole?: "manager" | "member" // Added role field
  questionId: string
  answer: string
  // As is / To be structure
  asIs: {
    fact: string // 現状の事実
    score: number // 0-100
  }
  toBe: {
    will: string // 理想の意図
    score: number // 0-100
  }
  solution?: {
    action: string // ギャップを埋めるための具体的なアクション
    tags: string[]
  }
  // New: HERO scores
  hero?: {
    hope: number // 0-100
    efficacy: number // 0-100
    resilience: number // 0-100
    optimism: number // 0-100
  }
  // New: Vulnerability metrics
  vulnerability?: {
    honesty: number // 0-100 (本音度)
    resistance: number // 0-100 (共有への抵抗感)
  }
  // New: Analysis results per response
  analysis?: {
    tags?: {
      mindset: boolean
      process: boolean
      environment: boolean
    }
    roiScore?: number
  }
  // Deprecated fields
  gap?: {
    interpretation: string
    tags: string[]
    value?: number
  }
  perspective?: {
    interpretation: string
    tags: string[]
  }
  willTag?: "change" | "protect" | "challenge" | "help"
  emotionLevel?: number
  submittedAt: string
}

export interface AnalysisResult {
  summary: string // General summary
  consensus: string[] // 合意点 (Consensus)
  conflicts: string[] // 相違点 (Conflict/Gap)
  discussionPoints: string[] // ディスカッションポイント

  // New structured fields
  gravityStatus?: string // e.g. "浮遊開始"
  warmth?: number // 0-100 indicating psychological safety/mood
  structuralBridge?: {
    missingLink?: string
    bridgeBalance?: string // "Mindset biased", "Environment biased", "Balanced"
  }
  assetPrediction?: {
    retentionRate: number
    decisionLog?: string
  }
  tags?: {
    mindset: number
    process: number
    environment: number
  }
  gapAnalysis?: {
    managerView: string
    memberView: string
    asymmetryLevel: string
    lemonMarketRisk: string
  }
  heroInsight?: {
    pathology: string
    strength: string
    scores: {
      hope: number
      efficacy: number
      resilience: number
      optimism: number
    }
  }
  interventionQuestions?: {
    mutualUnderstanding: string
    suspendedJudgment: string
    smallAgreement: string
  }
  roiScore?: number

  // Legacy or auxiliary fields
  keyFindings?: string[]
  sentiment?: {
    positive: number
    neutral: number
    negative: number
  }
  recommendations?: string[]
  categories?: ResponseCategory[]
}

export interface StructuredGapAnalysis {
  quantitative: {
    asIsAverage: number
    toBeAverage: number
    gapSize: number
    insight: string
  }
  asIsGap: {
    managerView: string
    memberView: string
    alert: string
  }
  toBeGap: {
    groupA: string
    groupB: string
    curiosityPoint: string
  }
  recommendedActions: string[]
  gapMatrix?: {
    category: string
    managerAsIs: number
    memberAsIs: number
    managerToBe: number
    memberToBe: number
    distance: number
  }[]
}

export interface GapAnalysis {
  overallGapScore: number
  gapAreas: {
    theme: string
    managerView: string
    memberView: string
    gapLevel: "high" | "medium" | "low"
    willMismatch?: string
  }[]
  recommendations: string[]
  heatmapData?: {
    category: string
    managerScore: number
    memberScore: number
    gap: number
  }[]
}

export interface ResponseCategory {
  name: string
  responses: string[]
  insight: string
}

export interface TeamState {
  psychologicalSafety: number
  grit: number
  goalClarity: number
  collaboration: number
  alignmentScore: number
}

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

export interface DiversityAnalysis {
  quantitative: {
    asIsAverage: number
    toBeAverage: number
    diversitySpread: number // Renamed from gapSize
    insight: string
  }
  asIsDiversity: {
    viewA: {
      label: string
      voices: string[]
      value: string
    }
    viewB: {
      label: string
      voices: string[]
      value: string
    }
    curiosityTrigger: string // Added curiosity trigger
  }
  toBeDiversity: {
    viewA: {
      label: string
      voices: string[]
    }
    viewB: {
      label: string
      voices: string[]
    }
    curiosityTrigger: string
  }
  recommendedActions: string[]
  diversityMap?: {
    participant: string
    asIsScore: number
    toBeScore: number
    perspectiveTags: string[]
  }[]
}
// Deterministic Stats calculated locally
export interface LocalAnalysisStats {
  warmth: number
  heroScores: {
    hope: number
    efficacy: number
    resilience: number
    optimism: number
  }
  focusTags: {
    mindset: number
    process: number
    environment: number
    communication?: number
  }
  responseCount: number
}
