import { redirect } from 'next/navigation'
import { PlanWordmark } from '@/src/Brand'
import { getCurrentUser } from '@/src/lib/auth'
import LoginForm from './LoginForm'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) redirect('/')

  return (
    <main className="grid min-h-screen place-items-center bg-app-paper px-4 py-10 text-app-navy">
      <section className="w-full max-w-md rounded-xl border border-app-border bg-app-card p-6 shadow-app">
        <div className="mb-7">
          <PlanWordmark />
          <p className="mt-4 text-sm text-app-muted">Log in om projecten, planning en rapporten op de server te beheren.</p>
        </div>
        <LoginForm />
      </section>
    </main>
  )
}
