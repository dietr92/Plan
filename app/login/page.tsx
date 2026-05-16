import { redirect } from "next/navigation";
import { PlanWordmark } from "@/src/Brand";
import { getCurrentUser } from "@/src/lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <main className="grid min-h-screen place-items-center bg-app-paper px-4 py-6 text-app-navy">
      <section className="w-full max-w-md">
        <div className="mb-4 flex items-center justify-between rounded-xl border border-app-border bg-app-card/82 px-4 py-3 shadow-soft">
          <PlanWordmark compact />
          <span className="rounded-md border border-app-blue/35 bg-app-blue/12 px-2 py-1 text-xs font-black text-app-navy">
            Postgres
          </span>
        </div>

        <div className="app-panel w-full p-5 md:p-6">
          <div className="mb-5 border-b border-app-border pb-4">
            <p className="app-caption text-app-blue">Plan by Appetite</p>
            <h1 className="mt-1 font-display text-2xl font-black tracking-normal">
              Inloggen
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-app-muted">
              Ga verder naar projecten, planning en rapporten.
            </p>
          </div>
          <LoginForm />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold text-app-muted">
          <span className="rounded-lg border border-app-border bg-app-card/62 px-2 py-2">
            Server-side
          </span>
          <span className="rounded-lg border border-app-border bg-app-card/62 px-2 py-2">
            Sessies
          </span>
          <span className="rounded-lg border border-app-border bg-app-card/62 px-2 py-2">
            Exports
          </span>
        </div>
      </section>
    </main>
  );
}
