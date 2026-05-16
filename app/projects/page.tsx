import { PlanAppPage } from '../app-shell'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  return <PlanAppPage initialScreen="projects" />
}
