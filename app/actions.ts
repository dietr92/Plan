'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type { PlanState, Project, ProjectStatus, ProjectType, TimeEntry } from '@/src/types'
import { seedState } from '@/src/demo-data'
import { createSession, destroySession, requireUser, verifyLogin } from '@/src/lib/auth'
import {
  deleteProject,
  deleteTimeEntry,
  replacePlanState,
  upsertProject,
  upsertTimeEntry,
} from '@/src/lib/db/queries'

const projectStatuses: ProjectStatus[] = ['planned', 'active', 'waiting', 'done', 'archived']
const projectTypes: ProjectType[] = ['fixed', 'hourly', 'internal']

function assertProject(project: Project) {
  if (!project.id || !project.name.trim() || !project.client.trim()) throw new Error('Project mist verplichte velden')
  if (!projectStatuses.includes(project.status)) throw new Error('Ongeldige projectstatus')
  if (!projectTypes.includes(project.type)) throw new Error('Ongeldig projecttype')
}

function assertEntry(entry: TimeEntry) {
  if (!entry.id || !entry.projectId || !entry.date || !entry.startTime || !entry.endTime) {
    throw new Error('Planningblok mist verplichte velden')
  }
}

function assertState(state: PlanState) {
  if (!Array.isArray(state.projects) || !Array.isArray(state.timeEntries)) {
    throw new Error('Ongeldig Plan JSON-bestand')
  }
  state.projects.forEach(assertProject)
  state.timeEntries.forEach(assertEntry)
}

export async function loginAction(_previousState: { error: string }, formData: FormData) {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  if (!email || !password) return { error: 'Vul e-mail en wachtwoord in.' }

  const user = await verifyLogin(email, password)
  if (!user) return { error: 'Ongeldige login.' }

  await createSession(user.id)
  redirect('/')
}

export async function logoutAction() {
  await destroySession()
  redirect('/login')
}

export async function upsertProjectAction(project: Project) {
  assertProject(project)
  const user = await requireUser()
  const state = await upsertProject(user.id, project)
  revalidatePath('/')
  return state
}

export async function deleteProjectAction(projectId: string) {
  const user = await requireUser()
  const state = await deleteProject(user.id, projectId)
  revalidatePath('/')
  return state
}

export async function upsertEntryAction(entry: TimeEntry) {
  assertEntry(entry)
  const user = await requireUser()
  const state = await upsertTimeEntry(user.id, entry)
  revalidatePath('/')
  return state
}

export async function deleteEntryAction(entryId: string) {
  const user = await requireUser()
  const state = await deleteTimeEntry(user.id, entryId)
  revalidatePath('/')
  return state
}

export async function replaceStateAction(state: PlanState) {
  assertState(state)
  const user = await requireUser()
  const nextState = await replacePlanState(user.id, state)
  revalidatePath('/')
  return nextState
}

export async function restoreDemoDataAction() {
  const user = await requireUser()
  const state = await replacePlanState(user.id, seedState)
  revalidatePath('/')
  return state
}
