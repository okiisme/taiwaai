import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: NextRequest) {
  try {
    const { workshopId, question } = await request.json()
    if (!workshopId || !question) {
      return NextResponse.json({ error: "workshopId and question are required" }, { status: 400 })
    }

    await sql`
      UPDATE workshops
      SET current_question = ${JSON.stringify(question)}, status = 'question-display'
      WHERE id = ${workshopId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to set question" }, { status: 500 })
  }
}
