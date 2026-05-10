export type ProjectStatus = 'planned' | 'active' | 'waiting' | 'done' | 'archived'

export type ProjectType = 'fixed' | 'hourly' | 'internal'

export interface Project {
  id: string
  name: string
  client: string
  status: ProjectStatus
  type: ProjectType
  color: string
  deadline: string
  estimatedHours: number
  rate: number
  budget: number
  createdAt: string
  updatedAt: string
}

export interface TimeEntry {
  id: string
  projectId: string
  title: string
  date: string
  startTime: string
  endTime: string
  hours: number
  billable: boolean
  notes: string
}

export interface PlanState {
  projects: Project[]
  timeEntries: TimeEntry[]
}

export type Screen = 'dashboard' | 'planning' | 'projects' | 'reports' | 'settings'

