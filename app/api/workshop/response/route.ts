import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      workshopId, participantId, participantName, participantRole,
      answer, asIs, toBe, solution, gap, hero, vulnerability
    } = body

    const id = uuidv4()
    const submittedAt = new Date().toISOString()

    await sql`
      INSERT INTO responses (
        id, workshop_id, participant_id, participant_name, participant_role,
        answer, 
        as_is_fact, as_is_score, 
        to_be_will, to_be_score, 
        solution_action, solution_tags, 
        gap_interpretation, gap_tags,
        hero_hope, hero_efficacy, hero_resilience, hero_optimism,
        vulnerability_honesty, vulnerability_resistance,
        submitted_at
      )
      VALUES (
        ${id}, ${workshopId}, ${participantId}, ${participantName}, ${participantRole || 'member'},
        ${answer},
        ${asIs?.fact}, ${asIs?.score || 0},
        ${toBe?.will}, ${toBe?.score || 0},
        ${solution?.action}, ${solution?.tags || []},
        ${gap?.interpretation}, ${gap?.tags || []},
        ${hero?.hope || 0}, ${hero?.efficacy || 0}, ${hero?.resilience || 0}, ${hero?.optimism || 0},
        ${vulnerability?.honesty || 0}, ${vulnerability?.resistance || 0},
        ${submittedAt}
      )
    `

    return NextResponse.json({
      success: true,
      message: "Response saved to DB"
    })
  } catch (error) {
    console.error("[v0] Database Error submitting response:", error)
    return NextResponse.json({ error: "Failed to submit response to DB" }, { status: 500 })
  }
}

