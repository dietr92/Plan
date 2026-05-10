import { NextResponse } from 'next/server'
import { db, sql } from '@/src/lib/db/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  await db.execute(sql`select 1`)
  return NextResponse.json({ ok: true, service: 'plan-by-appetite' })
}
