import { redirect } from 'next/navigation'
import { PlanWordmark } from '@/src/Brand'
import { getCurrentUser } from '@/src/lib/auth'
import LoginForm from './LoginForm'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) redirect('/')

  return (
    <main className="relative min-h-screen overflow-hidden bg-app-paper px-4 py-8 text-app-navy md:px-8">
      <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-app-blue/24 blur-3xl" />
      <div className="pointer-events-none absolute left-8 top-24 h-60 w-60 rounded-full bg-app-gold/20 blur-3xl" />
      <section className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_.95fr]">
        <div className="max-w-2xl">
          <PlanWordmark />
          <p className="app-caption mt-10 text-app-blue">Plan by Appetite</p>
          <h1 className="mt-3 font-display text-4xl font-black leading-[0.98] tracking-normal md:text-6xl">
            Planning, projecten en uren in één veilige werkruimte.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-app-muted">
            Een compacte cockpit voor kleine teams die agenda, projectstatus en rapportage samen willen houden.
          </p>
          <div className="mt-8 flex flex-wrap gap-2 text-sm font-bold">
            <span className="rounded-full border border-app-border bg-app-card/80 px-3 py-2">Postgres opslag</span>
            <span className="rounded-full border border-app-border bg-app-card/80 px-3 py-2">Beveiligde sessie</span>
            <span className="rounded-full border border-app-border bg-app-card/80 px-3 py-2">Appetite UX</span>
          </div>
        </div>

        <div className="app-panel w-full rounded-2xl p-5 md:p-7">
          <div className="mb-7 border-b border-app-border pb-5">
            <p className="app-caption text-app-blue">Welkom terug</p>
            <h2 className="mt-2 font-display text-3xl font-black tracking-normal">Log in bij Plan</h2>
            <p className="mt-2 text-sm leading-relaxed text-app-muted">
              Beheer projecten, planning en rapporten server-side in de Plan-werkruimte.
            </p>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  )
}
