import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET(request: NextRequest, { params }: { params: Promise<{ workshopId: string }> }) {
  try {
    const { workshopId } = await params
    const { rows } = await sql`SELECT * FROM workshops WHERE id = ${workshopId}`
    if (rows.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }
    return NextResponse.json({ session: rows[0] })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ workshopId: string }> }) {
  try {
    const { workshopId } = await params
    const { status } = await request.json()
    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    await sql`UPDATE workshops SET status = ${status} WHERE id = ${workshopId}`
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 })
  }
}
