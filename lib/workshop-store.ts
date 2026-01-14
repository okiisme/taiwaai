type WorkshopStore = {
  sessions: Map<
    string,
    {
      status: string
      participants: Array<{
        id: string
        name: string
        role?: "manager" | "member"
        stance?: {
          energyLevel: number
          currentMode: "divergent" | "convergent" | "challenge" | "reflection"
          openness: number
        }
        joinedAt: string
      }>
      currentQuestion: string | null
      responses: Array<{
        id: string
        participantId: string
        participantName: string
        participantRole?: "manager" | "member"
        answer: string
        asIs?: {
          fact: string
          score: number
        }
        toBe?: {
          will: string
          score: number
        }
        solution?: {
          action: string
          tags: string[]
        }
        gap?: {
          interpretation: string
          tags: string[]
        }
        hero?: {
          hope: number
          efficacy: number
          resilience: number
          optimism: number
        }
        vulnerability?: {
          honesty: number
          resistance: number
        }
        moodColor?: string // Added for question check-in
        submittedAt: string
      }>
    }
  >
}

const globalStore = globalThis as unknown as {
  workshopStore: WorkshopStore | undefined
}

const store: WorkshopStore = globalStore.workshopStore || {
  sessions: new Map(),
}

if (process.env.NODE_ENV !== "production") {
  globalStore.workshopStore = store
}

// CHANGE: Add sample data for demonstration
store.sessions.set("sample-workshop-1", {
  status: "completed",
  participants: [
    {
      id: "p1",
      name: "田中マネージャー",
      role: "manager",
      stance: {
        energyLevel: 7,
        currentMode: "divergent",
        openness: 8,
      },
      joinedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "p2",
      name: "佐藤メンバー",
      role: "member",
      stance: {
        energyLevel: 5,
        currentMode: "reflection",
        openness: 6,
      },
      joinedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "p3",
      name: "鈴木メンバー",
      role: "member",
      stance: {
        energyLevel: 6,
        currentMode: "convergent",
        openness: 7,
      },
      joinedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  currentQuestion: "チームの心理的安全性について、現状と理想を教えてください",
  responses: [
    {
      id: "r1",
      participantId: "p1",
      participantName: "田中マネージャー",
      participantRole: "manager",
      answer: "チーム全体で率直に意見を言い合える環境が必要",
      asIs: {
        fact: "会議で意見が出にくい。特に新しいメンバーからの発言が少ない",
        score: 5,
      },
      toBe: {
        will: "誰もが安心して挑戦的な意見を言える環境を作りたい",
        score: 9,
      },
      gap: {
        interpretation: "マネージャーは理想を高く持っているが、現状との差を感じている",
        tags: ["#リスク回避", "#チーム調和"],
      },
      submittedAt: new Date(Date.now() - 82800000).toISOString(),
    },
    {
      id: "r2",
      participantId: "p2",
      participantName: "佐藤メンバー",
      participantRole: "member",
      answer: "もっと自由に発言できる雰囲気がほしい",
      asIs: {
        fact: "失敗を恐れて、新しいアイデアを提案しづらい",
        score: 4,
      },
      toBe: {
        will: "失敗してもサポートし合えるチームになりたい",
        score: 8,
      },
      gap: {
        interpretation: "メンバーは現状に不満を感じており、安全な環境を強く求めている",
        tags: ["#挑戦", "#助けてほしい"],
      },
      submittedAt: new Date(Date.now() - 82200000).toISOString(),
    },
    {
      id: "r3",
      participantId: "p3",
      participantName: "鈴木メンバー",
      participantRole: "member",
      answer: "意見の対立を恐れず、建設的に議論したい",
      asIs: {
        fact: "意見が対立すると、議論を避けて妥協してしまう",
        score: 6,
      },
      toBe: {
        will: "対立を成長の機会と捉えて、前向きに議論できるチーム",
        score: 9,
      },
      gap: {
        interpretation: "対立を恐れずに議論する文化を求めているが、現状は妥協が多い",
        tags: ["#挑戦", "#チーム調和"],
      },
      submittedAt: new Date(Date.now() - 81600000).toISOString(),
    },
  ],
})

store.sessions.set("sample-workshop-2", {
  status: "completed",
  participants: [
    {
      id: "p4",
      name: "山田マネージャー",
      role: "manager",
      stance: {
        energyLevel: 8,
        currentMode: "challenge",
        openness: 9,
      },
      joinedAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: "p5",
      name: "伊藤メンバー",
      role: "member",
      stance: {
        energyLevel: 6,
        currentMode: "divergent",
        openness: 7,
      },
      joinedAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ],
  currentQuestion: "チームの成長機会について、どう考えていますか？",
  responses: [
    {
      id: "r4",
      participantId: "p4",
      participantName: "山田マネージャー",
      participantRole: "manager",
      answer: "個々の強みを活かした成長支援が必要",
      asIs: {
        fact: "一律の研修が多く、個別の成長ニーズに対応できていない",
        score: 5,
      },
      toBe: {
        will: "各メンバーの強みと興味に合わせた成長機会を提供したい",
        score: 9,
      },
      gap: {
        interpretation: "個別化された成長支援の必要性を強く感じている",
        tags: ["#顧客志向", "#挑戦"],
      },
      submittedAt: new Date(Date.now() - 169200000).toISOString(),
    },
    {
      id: "r5",
      participantId: "p5",
      participantName: "伊藤メンバー",
      participantRole: "member",
      answer: "新しいスキルを学ぶ時間がほしい",
      asIs: {
        fact: "日々の業務に追われ、学習時間が取れない",
        score: 3,
      },
      toBe: {
        will: "業務時間内で新しいスキルを学べる環境",
        score: 8,
      },
      gap: {
        interpretation: "学習時間の確保に強い課題を感じている",
        tags: ["#リスク回避", "#助けてほしい"],
      },
      submittedAt: new Date(Date.now() - 168600000).toISOString(),
    },
  ],
})

export function getSession(workshopId: string) {
  // CHANGE: Add debug logging
  console.log("[v0] workshop-store: getSession called for:", workshopId)

  if (!store.sessions.has(workshopId)) {
    console.log("[v0] workshop-store: Creating new session for:", workshopId)
    store.sessions.set(workshopId, {
      status: "preparation",
      participants: [],
      currentQuestion: null,
      responses: [],
    })
  }

  const session = store.sessions.get(workshopId)!
  console.log("[v0] workshop-store: Returning session:", {
    workshopId,
    participantsCount: session.participants.length,
    responsesCount: session.responses.length,
    status: session.status,
  })

  return session
}

export function addParticipant(
  workshopId: string,
  participant: {
    id: string
    name: string
    role?: "manager" | "member"
    stance?: {
      energyLevel: number
      currentMode: "divergent" | "convergent" | "challenge" | "reflection"
      openness: number
    }
  },
) {
  // CHANGE: Add debug logging
  console.log("[v0] workshop-store: addParticipant called:", { workshopId, participantName: participant.name })

  const session = getSession(workshopId)
  if (!session.participants.find((p) => p.id === participant.id)) {
    session.participants.push({
      ...participant,
      joinedAt: new Date().toISOString(),
    })
    console.log("[v0] workshop-store: Participant added. Total participants:", session.participants.length)
  } else {
    console.log("[v0] workshop-store: Participant already exists, skipping")
  }

  return session
}

export function setCurrentQuestion(workshopId: string, question: string) {
  // CHANGE: Add debug logging
  console.log("[v0] workshop-store: setCurrentQuestion called:", { workshopId, question })

  const session = getSession(workshopId)
  session.currentQuestion = question
  session.responses = []

  console.log("[v0] workshop-store: Question set, responses cleared")

  return session
}

export function addResponse(
  workshopId: string,
  response: {
    participantId: string
    participantName: string
    participantRole?: "manager" | "member"
    answer: string
    asIs?: { fact: string; score: number }
    toBe?: { will: string; score: number }
    solution?: { action: string; tags: string[] }

    gap?: { interpretation: string; tags: string[] }
    hero?: { hope: number; efficacy: number; resilience: number; optimism: number }
    vulnerability?: { honesty: number; resistance: number }
    moodColor?: string
  },
) {
  // CHANGE: Add debug logging
  console.log("[v0] workshop-store: addResponse called:", {
    workshopId,
    participantName: response.participantName,
    hasAsIs: !!response.asIs,
    hasToBe: !!response.toBe,
    hasSolution: !!response.solution,
  })

  const session = getSession(workshopId)
  const newResponse = {
    id: `r-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...response,
    submittedAt: new Date().toISOString(),
  }

  session.responses.push(newResponse)

  console.log("[v0] workshop-store: Response added. Total responses:", session.responses.length)

  return session
}

export function updateSessionStatus(workshopId: string, status: string) {
  // CHANGE: Add debug logging
  console.log("[v0] workshop-store: updateSessionStatus called:", { workshopId, status })

  const session = getSession(workshopId)
  session.status = status

  return session
}

export function updateSession(workshopId: string, updates: Partial<ReturnType<typeof getSession>>) {
  // CHANGE: Add debug logging
  console.log("[v0] workshop-store: updateSession called:", {
    workshopId,
    updateKeys: Object.keys(updates),
  })

  const session = getSession(workshopId)
  Object.assign(session, updates)

  return session
}

export function getAllSessions() {
  console.log("[v0] workshop-store: getAllSessions called. Total sessions:", store.sessions.size)

  return Array.from(store.sessions.entries()).map(([id, session]) => ({
    id,
    ...session,
  }))
}

export function syncWithLocalStorage(workshopId: string) {
  if (typeof window === "undefined") return

  try {
    const session = getSession(workshopId)
    localStorage.setItem(`workshop-${workshopId}`, JSON.stringify(session))
    console.log("[v0] workshop-store: Synced to localStorage:", workshopId)
  } catch (error) {
    console.error("[v0] workshop-store: Failed to sync with localStorage:", error)
  }
}

export function loadFromLocalStorage(workshopId: string) {
  if (typeof window === "undefined") return null

  try {
    const saved = localStorage.getItem(`workshop-${workshopId}`)
    if (saved) {
      const parsed = JSON.parse(saved)
      store.sessions.set(workshopId, parsed)
      console.log("[v0] workshop-store: Loaded from localStorage:", {
        workshopId,
        participantsCount: parsed.participants?.length || 0,
        responsesCount: parsed.responses?.length || 0,
      })
      return parsed
    }
  } catch (error) {
    console.error("[v0] workshop-store: Failed to load from localStorage:", error)
  }
  return null
}
