import 'server-only'

import { randomUUID } from 'node:crypto'
import { compare } from 'bcryptjs'
import { and, eq, gt } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from './db/client'
import { sessions, users } from './db/schema'

export const SESSION_COOKIE = 'plan_session'
const SESSION_DAYS = 14

export interface CurrentUser {
  id: string
  email: string
}

function sessionExpiresAt() {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS)
  return expiresAt
}

export async function verifyLogin(email: string, password: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1)
  if (!user) return null

  const valid = await compare(password, user.passwordHash)
  return valid ? { id: user.id, email: user.email } : null
}

export async function createSession(userId: string) {
  const id = `session-${randomUUID()}`
  const expiresAt = sessionExpiresAt()

  await db.insert(sessions).values({ id, userId, expiresAt })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  })
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value
  if (!sessionId) return null

  const [row] = await db
    .select({
      sessionId: sessions.id,
      userId: users.id,
      email: users.email,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())))
    .limit(1)

  if (!row) {
    return null
  }

  return { id: row.userId, email: row.email }
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

export async function destroySession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value
  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId))
  }
  cookieStore.delete(SESSION_COOKIE)
}
