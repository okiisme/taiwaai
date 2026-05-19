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
        asIs?: { fact: string; score: number }
        toBe?: { will: string; score: number }
        solution?: { action: string; tags: string[] }
        gap?: { interpretation: string; tags: string[] }
        hero?: { hope: number; efficacy: number; resilience: number; optimism: number }
        vulnerability?: { honesty: number; resistance: number }
        moodColor?: string
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

export function getSession(workshopId: string) {
  if (!store.sessions.has(workshopId)) {
    store.sessions.set(workshopId, {
      status: "preparation",
      participants: [],
      currentQuestion: null,
      responses: [],
    })
  }
  return store.sessions.get(workshopId)!
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
  const session = getSession(workshopId)
  if (!session.participants.find((p) => p.id === participant.id)) {
    session.participants.push({ ...participant, joinedAt: new Date().toISOString() })
  }
  return session
}

export function setCurrentQuestion(workshopId: string, question: string) {
  const session = getSession(workshopId)
  session.currentQuestion = question
  session.responses = []
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
  const session = getSession(workshopId)
  session.responses.push({
    id: crypto.randomUUID(),
    ...response,
    submittedAt: new Date().toISOString(),
  })
  return session
}

export function updateSessionStatus(workshopId: string, status: string) {
  const session = getSession(workshopId)
  session.status = status
  return session
}

export function updateSession(workshopId: string, updates: Partial<ReturnType<typeof getSession>>) {
  const session = getSession(workshopId)
  Object.assign(session, updates)
  return session
}

export function getAllSessions() {
  return Array.from(store.sessions.entries()).map(([id, session]) => ({ id, ...session }))
}
