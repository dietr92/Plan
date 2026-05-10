import { randomUUID } from 'node:crypto'
import { hash } from 'bcryptjs'
import { config } from 'dotenv'
import { eq } from 'drizzle-orm'

config({ path: '.env.local' })
config({ path: '.env' })

async function main() {
  const [{ db, pool }, { ensureWorkspace }, { users }] = await Promise.all([
    import('../src/lib/db/client'),
    import('../src/lib/db/queries'),
    import('../src/lib/db/schema'),
  ])

  const email = process.env.PLAN_ADMIN_EMAIL?.toLowerCase().trim()
  const password = process.env.PLAN_ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error('PLAN_ADMIN_EMAIL en PLAN_ADMIN_PASSWORD zijn verplicht')
  }

  if (password.length < 10) {
    throw new Error('PLAN_ADMIN_PASSWORD moet minstens 10 tekens lang zijn')
  }

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  const passwordHash = await hash(password, 12)
  const now = new Date()

  const user =
    existing ??
    (
      await db
        .insert(users)
        .values({
          id: `user-${randomUUID()}`,
          email,
          passwordHash,
          createdAt: now,
          updatedAt: now,
        })
        .returning()
    )[0]

  if (existing) {
    await db.update(users).set({ passwordHash, updatedAt: now }).where(eq(users.id, existing.id))
  }

  await ensureWorkspace(user.id)
  console.log(`Admin klaar: ${email}`)
  await pool.end()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
