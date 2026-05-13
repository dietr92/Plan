import { redirect } from 'next/navigation'
import { PlanWordmark } from '@/src/Brand'
import { getCurrentUser } from '@/src/lib/auth'
import LoginForm from './LoginForm'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) redirect('/')

  return (
    <main className="min-h-screen overflow-y-auto bg-app-paper px-4 py-6 text-app-navy md:px-8 lg:px-12">
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,480px)]">
        <div className="relative overflow-hidden rounded-lg border border-app-navy/20 bg-app-navy p-7 text-app-paper shadow-app sm:p-10 lg:min-h-[520px]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(134,170,196,0.20),transparent_48%),linear-gradient(180deg,transparent,rgba(11,32,56,0.42))]" />
          <div className="relative z-10 flex h-full flex-col justify-center">
            <PlanWordmark reverse />
            <p className="mt-9 max-w-xl text-lg leading-8 text-app-paper/82">
              Projecten, planning, uren en rapporten in één rustige operationele lijn.
            </p>
            <div className="mt-8 flex flex-wrap gap-2" aria-label="Plan workflow">
              {['Project', 'Planning', 'Uren', 'Rapport', 'Export'].map((item) => (
                <span key={item} className="rounded-full border border-app-paper/18 bg-app-paper/8 px-3 py-1.5 text-sm font-extrabold text-app-paper/88">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full rounded-lg border border-app-navy/12 bg-app-card/92 p-6 shadow-soft md:p-8">
          <div className="mb-6">
            <h1 className="font-display text-4xl font-black tracking-normal text-app-navy">Aanmelden</h1>
            <p className="mt-2 text-base leading-relaxed text-app-muted">Gebruik je Plan demo-account.</p>
          </div>
          <LoginForm />

          <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs font-bold text-app-muted">
            <span className="rounded-lg border border-app-border bg-app-paper/62 px-2 py-2">Server-side</span>
            <span className="rounded-lg border border-app-border bg-app-paper/62 px-2 py-2">Sessies</span>
            <span className="rounded-lg border border-app-border bg-app-paper/62 px-2 py-2">Exports</span>
          </div>
        </div>
      </section>
    </main>
  )
}
