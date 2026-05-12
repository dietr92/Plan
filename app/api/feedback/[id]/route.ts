import { NextResponse } from 'next/server'
import { pool } from '@/src/lib/db/client'
import { getCurrentUser } from '@/src/lib/auth'

const STATUSES = ['PENDING', 'IN_PROGRESS', 'RESOLVED'] as const

function isStatus(value: string): value is (typeof STATUSES)[number] {
  return (STATUSES as readonly string[]).includes(value)
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { id } = await context.params
  const body = (await request.json().catch(() => null)) as { status?: unknown; admin_response?: unknown } | null
  if (!body || typeof body.status !== 'string' || !isStatus(body.status)) {
    return NextResponse.json({ error: 'Ongeldige status' }, { status: 400 })
  }

  const adminResponse = typeof body.admin_response === 'string' ? body.admin_response.trim() : ''
  const result = await pool.query(
    `update feedback
        set status = $1,
            admin_response = $2,
            updated_at = now()
      where id = $3 and user_id = $4 and source_app = 'plan'
      returning id`,
    [body.status, adminResponse, id, user.id],
  )

  if (result.rowCount === 0) return NextResponse.json({ error: 'Feedback niet gevonden' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
