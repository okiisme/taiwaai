import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    // themeカラムがなければ追加（初回マイグレーション）
    await sql`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS theme TEXT`
    await sql`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS analysis JSONB`

    const { rows } = await sql`
      SELECT
        w.id,
        w.theme,
        w.status,
        w.created_at,
        w.analysis,
        COUNT(DISTINCT p.id)::int AS participant_count,
        COUNT(DISTINCT r.id)::int AS response_count
      FROM workshops w
      LEFT JOIN participants p ON p.workshop_id = w.id
      LEFT JOIN responses r ON r.workshop_id = w.id
      GROUP BY w.id, w.theme, w.status, w.created_at, w.analysis
      ORDER BY w.created_at DESC
      LIMIT 50
    `

    return NextResponse.json({ workshops: rows })
  } catch {
    return NextResponse.json({ error: "Failed to fetch workshops" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { theme } = await request.json()
    if (!theme?.trim()) {
      return NextResponse.json({ error: "テーマを入力してください" }, { status: 400 })
    }

    await sql`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS theme TEXT`

    const id = crypto.randomUUID()
    await sql`
      INSERT INTO workshops (id, theme, status)
      VALUES (${id}, ${theme.trim()}, 'preparation')
    `

    return NextResponse.json({ id, theme: theme.trim(), status: "preparation" })
  } catch {
    return NextResponse.json({ error: "Failed to create workshop" }, { status: 500 })
  }
}
