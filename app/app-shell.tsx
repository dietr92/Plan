import { requireUser } from '@/src/lib/auth'
import { getPlanState } from '@/src/lib/db/queries'
import PlanApp from '@/src/components/PlanApp'
import type { Screen } from '@/src/types'

export async function PlanAppPage({ initialScreen = 'dashboard' }: { initialScreen?: Screen }) {
  const user = await requireUser()
  const state = await getPlanState(user.id)

  return <PlanApp initialState={state} userEmail={user.email} initialScreen={initialScreen} />
}
