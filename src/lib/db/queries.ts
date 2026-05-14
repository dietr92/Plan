import { and, eq } from 'drizzle-orm'
import { seedState } from '../../demo-data'
import type { PlanState, Project, TimeEntry } from '../../types'
import { db } from './client'
import { projects, timeEntries, workspaceMembers, workspaces } from './schema'

function workspaceIdForUser(userId: string) {
  return `workspace-${userId}`
}

function namespacedSeedState(workspaceId: string): PlanState {
  const projectIdMap = new Map(seedState.projects.map((project) => [project.id, `${workspaceId}-${project.id}`]))

  return {
    projects: seedState.projects.map((project) => ({
      ...project,
      id: projectIdMap.get(project.id) ?? `${workspaceId}-${project.id}`,
    })),
    timeEntries: seedState.timeEntries.map((entry) => ({
      ...entry,
      id: `${workspaceId}-${entry.id}`,
      projectId: projectIdMap.get(entry.projectId) ?? `${workspaceId}-${entry.projectId}`,
    })),
  }
}

function toProject(row: typeof projects.$inferSelect): Project {
  return {
    id: row.id,
    name: row.name,
    client: row.client,
    status: row.status as Project['status'],
    type: row.type as Project['type'],
    color: row.color,
    deadline: row.deadline,
    estimatedHours: row.estimatedHours,
    rate: row.rate,
    budget: row.budget,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

function toTimeEntry(row: typeof timeEntries.$inferSelect): TimeEntry {
  return {
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    date: row.date,
    startTime: row.startTime,
    endTime: row.endTime,
    hours: row.hours,
    billable: row.billable,
    notes: row.notes,
  }
}

export async function ensureWorkspace(userId: string) {
  const workspaceId = workspaceIdForUser(userId)

  await db
    .insert(workspaces)
    .values({ id: workspaceId, name: 'Plan by Appetite' })
    .onConflictDoNothing()

  await db
    .insert(workspaceMembers)
    .values({ workspaceId, userId, role: 'admin' })
    .onConflictDoNothing()

  return workspaceId
}

async function seedWorkspaceIfEmpty(workspaceId: string) {
  const existing = await db.select({ id: projects.id }).from(projects).where(eq(projects.workspaceId, workspaceId)).limit(1)
  if (existing.length > 0) return

  const workspaceSeedState = namespacedSeedState(workspaceId)

  await db.transaction(async (tx) => {
    if (workspaceSeedState.projects.length) {
      await tx.insert(projects).values(
        workspaceSeedState.projects.map((project) => ({
          ...project,
          workspaceId,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt),
        })),
      )
    }

    if (workspaceSeedState.timeEntries.length) {
      await tx.insert(timeEntries).values(workspaceSeedState.timeEntries.map((entry) => ({ ...entry, workspaceId })))
    }
  })
}

export async function getPlanState(userId: string): Promise<PlanState> {
  const workspaceId = await ensureWorkspace(userId)
  await seedWorkspaceIfEmpty(workspaceId)

  const [projectRows, entryRows] = await Promise.all([
    db.select().from(projects).where(eq(projects.workspaceId, workspaceId)),
    db.select().from(timeEntries).where(eq(timeEntries.workspaceId, workspaceId)),
  ])

  return {
    projects: projectRows.map(toProject).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    timeEntries: entryRows.map(toTimeEntry),
  }
}

export async function upsertProject(userId: string, project: Project) {
  const workspaceId = await ensureWorkspace(userId)
  const now = new Date()

  await db
    .insert(projects)
    .values({
      ...project,
      workspaceId,
      createdAt: new Date(project.createdAt),
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: projects.id,
      set: {
        name: project.name,
        client: project.client,
        status: project.status,
        type: project.type,
        color: project.color,
        deadline: project.deadline,
        estimatedHours: project.estimatedHours,
        rate: project.rate,
        budget: project.budget,
        updatedAt: now,
      },
    })

  return getPlanState(userId)
}

export async function deleteProject(userId: string, projectId: string) {
  const workspaceId = await ensureWorkspace(userId)
  await db.delete(projects).where(and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId)))
  return getPlanState(userId)
}

export async function upsertTimeEntry(userId: string, entry: TimeEntry) {
  const workspaceId = await ensureWorkspace(userId)
  const now = new Date()

  await db
    .insert(timeEntries)
    .values({
      ...entry,
      workspaceId,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: timeEntries.id,
      set: {
        projectId: entry.projectId,
        title: entry.title,
        date: entry.date,
        startTime: entry.startTime,
        endTime: entry.endTime,
        hours: entry.hours,
        billable: entry.billable,
        notes: entry.notes,
        updatedAt: now,
      },
    })

  return getPlanState(userId)
}

export async function deleteTimeEntry(userId: string, entryId: string) {
  const workspaceId = await ensureWorkspace(userId)
  await db.delete(timeEntries).where(and(eq(timeEntries.id, entryId), eq(timeEntries.workspaceId, workspaceId)))
  return getPlanState(userId)
}

export async function replacePlanState(userId: string, state: PlanState) {
  const workspaceId = await ensureWorkspace(userId)

  await db.transaction(async (tx) => {
    await tx.delete(timeEntries).where(eq(timeEntries.workspaceId, workspaceId))
    await tx.delete(projects).where(eq(projects.workspaceId, workspaceId))

    if (state.projects.length) {
      await tx.insert(projects).values(
        state.projects.map((project) => ({
          ...project,
          workspaceId,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt),
        })),
      )
    }

    const validProjectIds = new Set(state.projects.map((project) => project.id))
    const validEntries = state.timeEntries.filter((entry) => validProjectIds.has(entry.projectId))
    if (validEntries.length) {
      await tx.insert(timeEntries).values(validEntries.map((entry) => ({ ...entry, workspaceId })))
    }
  })

  return getPlanState(userId)
}

export async function restoreDemoState(userId: string) {
  const workspaceId = workspaceIdForUser(userId)
  return replacePlanState(userId, namespacedSeedState(workspaceId))
}
