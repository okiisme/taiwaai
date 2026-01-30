import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Fix for Next.js 15 params awaiting
) {
    const { id } = await params

    try {
        // 1. Fetch Workshop
        const { rows: workshopRows } = await sql`
      SELECT * FROM workshops WHERE id = ${id}
    `

        if (workshopRows.length === 0) {
            // Create if not exists (Auto-create behavior similar to old store)
            await sql`
        INSERT INTO workshops (id, status, current_question)
        VALUES (${id}, 'preparation', NULL)
      `
        }

        const workshop = workshopRows.length > 0 ? workshopRows[0] : { id, status: 'preparation', current_question: null }

        // 2. Fetch Participants
        const { rows: participants } = await sql`
      SELECT * FROM participants WHERE workshop_id = ${id} ORDER BY joined_at ASC
    `

        // 3. Fetch Responses
        const { rows: responses } = await sql`
      SELECT * FROM responses WHERE workshop_id = ${id} ORDER BY submitted_at ASC
    `

        // Transform shape to match WorkshopSession type
        const session = {
            id: workshop.id,
            status: workshop.status,
            currentQuestion: workshop.current_question ? JSON.parse(workshop.current_question) : null,
            participants: participants.map(p => ({
                id: p.id,
                name: p.name,
                role: p.role,
                stance: {
                    energyLevel: p.stance_energy,
                    currentMode: p.stance_mode,
                    openness: p.stance_openness
                },
                joinedAt: p.joined_at
            })),
            responses: responses.map(r => ({
                id: r.id,
                participantId: r.participant_id,
                participantName: r.participant_name,
                participantRole: r.participant_role,
                answer: r.answer,
                asIs: { fact: r.as_is_fact, score: r.as_is_score },
                toBe: { will: r.to_be_will, score: r.to_be_score },
                solution: { action: r.solution_action, tags: r.solution_tags || [] },
                gap: { interpretation: r.gap_interpretation, tags: r.gap_tags || [] },
                hero: {
                    hope: r.hero_hope,
                    efficacy: r.hero_efficacy,
                    resilience: r.hero_resilience,
                    optimism: r.hero_optimism
                },
                vulnerability: {
                    honesty: r.vulnerability_honesty,
                    resistance: r.vulnerability_resistance
                },
                submittedAt: r.submitted_at
            }))
        }

        return NextResponse.json(session)
    } catch (error) {
        console.error("Database Error:", error)
        return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 })
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const body = await request.json()
    const { status, currentQuestion } = body

    try {
        if (status) {
            await sql`
        UPDATE workshops SET status = ${status} WHERE id = ${id}
      `
        }
        if (currentQuestion !== undefined) {
            await sql`
        UPDATE workshops 
        SET current_question = ${currentQuestion ? JSON.stringify(currentQuestion) : null} 
        WHERE id = ${id}
      `
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Database Update Error:", error)
        return NextResponse.json({ error: "Failed to update session" }, { status: 500 })
    }
}
