import { redirect } from "next/navigation";
import { PlanWordmark } from "@/src/Brand";
import { getCurrentUser } from "@/src/lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <main className="min-h-screen overflow-y-auto bg-app-paper px-4 py-4 text-app-navy md:px-8 md:py-6">
      <section className="mx-auto grid w-full max-w-[1280px] items-start gap-6 lg:min-h-[calc(100svh-3rem)] lg:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.72fr)] lg:items-center">
        <div className="relative min-h-[280px] overflow-hidden rounded-lg border border-app-navy/20 bg-app-navy p-6 text-app-paper shadow-app md:min-h-[340px] md:p-8 lg:h-[clamp(560px,68svh,640px)] lg:min-h-[560px] lg:p-12">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(134,170,196,0.20),transparent_48%),linear-gradient(180deg,transparent,rgba(11,32,56,0.42))]" />
          <div className="relative z-10 flex h-full flex-col justify-center">
            <PlanWordmark reverse />
            <p className="mt-8 max-w-xl text-base leading-relaxed text-app-paper/82 md:text-lg lg:mt-12 lg:text-xl">
              Projecten, planning, uren en rapporten in één rustige operationele
              lijn.
            </p>
            <div
              className="mt-7 flex flex-wrap gap-2 lg:mt-10 lg:gap-3"
              aria-label="Plan workflow"
            >
              {["Project", "Planning", "Uren", "Rapport", "Export"].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-app-paper/18 bg-app-paper/8 px-3 py-1.5 text-sm font-extrabold text-app-paper/88 lg:px-4 lg:py-2"
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col justify-center rounded-lg border border-app-navy/12 bg-app-card/92 p-6 shadow-soft md:p-8 lg:h-[clamp(560px,68svh,640px)] lg:min-h-[560px]">
          <div className="mb-6">
            <h1 className="font-display text-4xl font-black tracking-normal text-app-navy">
              Aanmelden
            </h1>
            <p className="mt-2 text-base leading-relaxed text-app-muted">
              Gebruik je Plan demo-account.
            </p>
          </div>
          <div
            className="mb-6 rounded-lg border border-app-navy/12 bg-app-sky/12 p-4 text-app-navy"
            aria-label="Demo login gegevens"
          >
            <p className="mb-3 text-xs font-black uppercase tracking-[0.08em] text-app-muted">
              Demo login
            </p>
            <dl className="grid grid-cols-[minmax(88px,0.42fr)_minmax(0,1fr)] gap-x-3 gap-y-1 text-sm">
              <dt className="font-bold text-app-muted">Gebruiker</dt>
              <dd className="min-w-0 font-extrabold">demo</dd>
              <dt className="font-bold text-app-muted">Wachtwoord</dt>
              <dd className="min-w-0 break-words font-extrabold">
                PlanMetGoesting!
              </dd>
            </dl>
          </div>
          <LoginForm />

          <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs font-bold text-app-muted">
            <span className="rounded-lg border border-app-border bg-app-paper/62 px-2 py-2">
              Server-side
            </span>
            <span className="rounded-lg border border-app-border bg-app-paper/62 px-2 py-2">
              Sessies
            </span>
            <span className="rounded-lg border border-app-border bg-app-paper/62 px-2 py-2">
              Exports
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
