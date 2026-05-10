import type { Project, TimeEntry } from './types'

export const statusLabels: Record<Project['status'], string> = {
  planned: 'Gepland',
  active: 'Actief',
  waiting: 'Wacht',
  done: 'Klaar',
  archived: 'Archief',
}

export const typeLabels: Record<Project['type'], string> = {
  fixed: 'Vaste prijs',
  hourly: 'Regie',
  internal: 'Intern',
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(value)
}

export function formatHours(value: number) {
  return `${Number(value || 0).toFixed(1)} u`
}

export function todayKey() {
  return toDateKey(new Date())
}

export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function getWeekDays(anchor = new Date()) {
  const start = new Date(anchor)
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  start.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, index) => {
    const d = new Date(start)
    d.setDate(start.getDate() + index)
    return d
  })
}

export function getMonthDays(anchor = new Date()) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0)
  const days: Date[] = []
  for (let day = 1; day <= last.getDate(); day += 1) {
    days.push(new Date(first.getFullYear(), first.getMonth(), day))
  }
  return days
}

export function hoursBetween(startTime: string, endTime: string) {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  const minutes = eh * 60 + em - (sh * 60 + sm)
  return Math.max(0.25, Math.round((minutes / 60) * 4) / 4)
}

export function projectRevenue(project: Project, hours: number) {
  if (project.type === 'fixed') return project.budget || 0
  if (project.type === 'hourly') return hours * (project.rate || 0)
  return 0
}

export function entryRevenue(projects: Project[], entry: TimeEntry) {
  if (!entry.billable) return 0
  const project = projects.find((item) => item.id === entry.projectId)
  if (!project || project.type !== 'hourly') return 0
  return entry.hours * (project.rate || 0)
}

export function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

