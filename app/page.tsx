import { requireUser } from '@/src/lib/auth'
import { getPlanState } from '@/src/lib/db/queries'
import PlanApp from '@/src/components/PlanApp'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const user = await requireUser()
  const state = await getPlanState(user.id)

  return <PlanApp initialState={state} userEmail={user.email} />
}
