'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileJson,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Pencil,
  Plus,
  RefreshCcw,
  Settings,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import {
  deleteEntryAction,
  deleteProjectAction,
  logoutAction,
  replaceStateAction,
  restoreDemoDataAction,
  upsertEntryAction,
  upsertProjectAction,
} from '@/app/actions'
import { PlanWordmark } from '../Brand'
import { emptyProject, projectColors } from '../demo-data'
import type { PlanState, Project, ProjectStatus, ProjectType, Screen, TimeEntry } from '../types'
import {
  downloadFile,
  entryRevenue,
  formatCurrency,
  formatHours,
  getMonthDays,
  getWeekDays,
  hoursBetween,
  projectRevenue,
  statusLabels,
  toDateKey,
  todayKey,
  typeLabels,
} from '../utils'

const navItems: { id: Screen; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Overzicht', icon: LayoutDashboard },
  { id: 'planning', label: 'Planning', icon: CalendarDays },
  { id: 'projects', label: 'Projecten', icon: FolderKanban },
  { id: 'reports', label: 'Rapporten', icon: BarChart3 },
  { id: 'settings', label: 'Data', icon: Settings },
]

const screenMeta: Record<Screen, { eyebrow: string; title: string; text: string }> = {
  dashboard: {
    eyebrow: 'Planning cockpit',
    title: 'Eén ritme voor projecten, uren en capaciteit.',
    text: 'Een compact overzicht van planning, deadlines en projectwaarde voor dagelijkse opvolging.',
  },
  planning: {
    eyebrow: 'Week en maand',
    title: 'Weekplanning',
    text: 'Plan en wijzig tijdblokken vanuit één compact werkbeeld.',
  },
  projects: {
    eyebrow: 'Project cockpit',
    title: 'Projecten, budget en deadlines in één werkbeeld.',
    text: 'Beheer klant, status, tarief, budget, planning en voortgang zonder aparte spreadsheet.',
  },
  reports: {
    eyebrow: 'Rapportage',
    title: 'Zie waar tijd en waarde naartoe gaan.',
    text: 'Bundel factureerbare uren, projectstatus en omzetindicatie tot een bruikbaar rapport.',
  },
  settings: {
    eyebrow: 'Beheer',
    title: 'Data, demo en sessie onder controle.',
    text: 'Exporteer, importeer of herstel data zonder database-instellingen in de browser te tonen.',
  },
}

const defaultEntry = (projectId = '', date = todayKey()): Omit<TimeEntry, 'id'> => ({
  projectId,
  title: '',
  date,
  startTime: '09:00',
  endTime: '11:00',
  hours: 2,
  billable: true,
  notes: '',
})

function makeId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

function App({ initialState, userEmail }: { initialState: PlanState; userEmail: string }) {
  const [state, setState] = useState<PlanState>(initialState)
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const metrics = useMemo(() => getMetrics(state), [state])

  function runMutation(action: () => Promise<PlanState>) {
    setError('')
    startTransition(async () => {
      try {
        setState(await action())
      } catch (mutationError) {
        setError(mutationError instanceof Error ? String(mutationError).replace(/^Error: /, '') : 'Actie mislukt')
      }
    })
  }

  function deleteProject(projectId: string) {
    const project = state.projects.find((item) => item.id === projectId)
    const entryCount = state.timeEntries.filter((entry) => entry.projectId === projectId).length
    const ok = window.confirm(`Verwijder ${project?.name ?? 'dit project'}${entryCount ? ` en ${entryCount} planningblok(ken)` : ''}?`)
    if (!ok) return
    runMutation(() => deleteProjectAction(projectId))
  }

  function upsertEntry(entry: TimeEntry) {
    runMutation(() => upsertEntryAction(entry))
  }

  function deleteEntry(entryId: string) {
    const entry = state.timeEntries.find((item) => item.id === entryId)
    const ok = window.confirm(`Verwijder planningblok "${entry?.title ?? 'zonder titel'}"?`)
    if (!ok) return
    runMutation(() => deleteEntryAction(entryId))
  }

  function upsertProject(project: Project) {
    runMutation(() => upsertProjectAction(project))
  }

  function replaceState(nextState: PlanState) {
    const ok = window.confirm('Importeer deze JSON en vervang de huidige Plan-data?')
    if (!ok) return
    runMutation(() => replaceStateAction(nextState))
  }

  function restoreDemoData() {
    const ok = window.confirm('Demo data herstellen? De huidige projecten en planningblokken worden vervangen.')
    if (!ok) return
    runMutation(() => restoreDemoDataAction())
  }

  function changeScreen(next: Screen) {
    setScreen(next)
    setMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-app-paper text-app-navy">
      <MobileTopBar menuOpen={menuOpen} onToggle={() => setMenuOpen((value) => !value)} />
      {menuOpen && <MobileMenu active={screen} onNavigate={changeScreen} />}

      <div className="min-h-screen md:grid md:grid-cols-[272px_minmax(0,1fr)]">
        <aside className="hidden bg-app-navy text-app-paper md:flex md:flex-col">
          <div className="border-b border-app-blue/22 px-5 py-5">
            <PlanWordmark reverse />
            <p className="mt-4 max-w-44 text-xs font-medium leading-relaxed text-app-paper/64">Planning, projecten en uren in een rustige Appetite workflow.</p>
          </div>
          <nav className="flex-1 space-y-1 p-3" aria-label="Hoofdnavigatie">
            {navItems.map((item) => (
              <NavButton key={item.id} item={item} active={screen === item.id} onClick={() => changeScreen(item.id)} />
            ))}
          </nav>
          <div className="m-3 rounded-xl border border-app-blue/24 bg-app-blue/12 p-4 text-xs text-app-paper/66">
            <div className="mb-2 flex items-center gap-2 text-app-paper">
              <span className="h-2 w-2 rounded-full bg-app-blue" />
              <strong>Postgres live</strong>
            </div>
            Data wordt server-side bewaard voor {userEmail}.
          </div>
        </aside>

        <main className="min-w-0 pb-24 md:pb-0">
          <header className="hidden h-[74px] items-center justify-between border-b border-app-border bg-app-paper/78 px-7 backdrop-blur md:flex">
            <div>
              <p className="app-caption text-app-muted">{screenMeta[screen].eyebrow}</p>
              <h1 className="font-display text-2xl font-black tracking-normal">{navItems.find((item) => item.id === screen)?.label}</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3 rounded-full border border-app-border bg-app-card/82 px-4 py-2 text-sm shadow-soft">
                <span className="h-2.5 w-2.5 rounded-full bg-app-gold" />
                {formatHours(metrics.weekHours)} gepland {metrics.weekLabel}
              </div>
              <form action={logoutAction}>
                <button className="icon-btn" aria-label={`Uitloggen ${userEmail}`} title={userEmail}>
                  <LogOut size={16} />
                </button>
              </form>
            </div>
          </header>

          <div className="mx-auto max-w-[1480px] px-4 py-5 md:px-7 md:py-7">
            {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">{error}</div>}
            {isPending && <div className="mb-4 rounded-lg border border-app-blue/30 bg-app-blue/12 px-4 py-3 text-sm font-bold text-app-navy">Bezig met bewaren...</div>}
            {screen === 'dashboard' && <Dashboard state={state} metrics={metrics} onScreen={changeScreen} />}
            {screen === 'planning' && (
              <Planning
                state={state}
                onEntrySave={upsertEntry}
                onEntryDelete={deleteEntry}
                onProjectCreate={upsertProject}
              />
            )}
            {screen === 'projects' && <Projects state={state} onSave={upsertProject} onDelete={deleteProject} />}
            {screen === 'reports' && <Reports state={state} />}
            {screen === 'settings' && <DataSettings state={state} onReplace={replaceState} onRestoreDemo={restoreDemoData} userEmail={userEmail} />}
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-app-border bg-app-card/96 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-14px_40px_rgba(11,32,56,.12)] backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {navItems.map((item) => (
            <NavButton key={item.id} item={item} active={screen === item.id} onClick={() => changeScreen(item.id)} mobile />
          ))}
        </div>
      </nav>
    </div>
  )
}

function MobileTopBar({ menuOpen, onToggle }: { menuOpen: boolean; onToggle: () => void }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-app-border bg-app-paper/92 px-4 backdrop-blur md:hidden">
      <PlanWordmark compact />
      <button className="grid h-10 w-10 place-items-center rounded-lg border border-app-border bg-app-card" onClick={onToggle} aria-label="Menu">
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </header>
  )
}

function MobileMenu({ active, onNavigate }: { active: Screen; onNavigate: (screen: Screen) => void }) {
  return (
    <div className="fixed inset-x-0 top-16 z-50 border-b border-app-border bg-app-card p-3 shadow-app md:hidden">
      <div className="grid grid-cols-5 gap-1">
        {navItems.map((item) => (
          <NavButton key={item.id} item={item} active={active === item.id} onClick={() => onNavigate(item.id)} mobile />
        ))}
      </div>
    </div>
  )
}

function NavButton({
  item,
  active,
  onClick,
  mobile = false,
}: {
  item: { id: Screen; label: string; icon: typeof LayoutDashboard }
  active: boolean
  onClick: () => void
  mobile?: boolean
}) {
  const Icon = item.icon
  if (mobile) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[10px] font-bold transition ${
          active ? 'bg-app-navy text-app-paper' : 'text-app-muted hover:bg-app-blue/16 hover:text-app-navy'
        }`}
      >
        <Icon size={18} />
        <span>{item.label}</span>
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-bold transition ${
        active ? 'bg-app-blue text-app-navy shadow-soft' : 'text-app-paper/62 hover:bg-app-blue/12 hover:text-app-paper'
      }`}
    >
      <Icon size={19} />
      {item.label}
    </button>
  )
}

function Dashboard({ state, metrics, onScreen }: { state: PlanState; metrics: ReturnType<typeof getMetrics>; onScreen: (screen: Screen) => void }) {
  return (
    <div className="space-y-4 md:space-y-5">
      <section className="app-panel rounded-2xl px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="app-caption text-app-blue">{metrics.todayEntries.length ? 'Vandaag' : 'Eerstvolgend'}</p>
            <h2 className="font-display text-xl font-black tracking-normal md:text-2xl">{metrics.focusTitle}</h2>
            <p className="text-sm text-app-muted">
              {formatHours(metrics.todayEntries.length ? metrics.todayHours : metrics.focusEntries.reduce((sum, entry) => sum + entry.hours, 0))} gepland · week {metrics.weekLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-primary" onClick={() => onScreen('planning')}>
              <Plus size={17} /> Uren plannen
            </button>
            <button className="btn-secondary" onClick={() => onScreen('projects')}>
              Project toevoegen
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={FolderKanban} label="Actieve projecten" value={String(metrics.activeProjects)} helper={`${state.projects.length} totaal`} />
        <MetricCard icon={Clock3} label="Factureerbaar" value={formatHours(metrics.billableHours)} helper="op alle geplande entries" />
        <MetricCard icon={CalendarDays} label="Weekplanning" value={formatHours(metrics.weekHours)} helper={`${metrics.weekEntries} blokken · ${metrics.weekLabel}`} />
        <MetricCard icon={BarChart3} label="Verwachte omzet" value={formatCurrency(metrics.revenue)} helper="regie + vaste prijs" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_.82fr]">
        <Panel title="Komende deadlines">
          <div className="space-y-2">
            {metrics.deadlines.map((project) => (
              <div key={project.id} className="flex items-center justify-between gap-3 rounded-lg border border-app-border bg-app-paper/70 p-3">
                <div className="min-w-0">
                  <p className="truncate font-bold">{project.name}</p>
                  <p className="text-sm text-app-muted">{project.client}</p>
                </div>
                <span className="rounded-lg bg-app-blue/18 px-2.5 py-1 text-sm font-bold">{project.deadline}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title={metrics.focusTitle}>
          <EntryList entries={metrics.focusEntries} projects={state.projects} empty="Geen planning gevonden." />
        </Panel>
      </section>
    </div>
  )
}

function Planning({
  state,
  onEntrySave,
  onEntryDelete,
  onProjectCreate,
}: {
  state: PlanState
  onEntrySave: (entry: TimeEntry) => void
  onEntryDelete: (entryId: string) => void
  onProjectCreate: (project: Project) => void
}) {
  const [mode, setMode] = useState<'week' | 'month'>('week')
  const planningAnchor = useMemo(() => getPlanningAnchor(state), [state])
  const [entryDraft, setEntryDraft] = useState<Omit<TimeEntry, 'id'> & { id?: string }>(() => defaultEntry(state.projects[0]?.id ?? '', toDateKey(getPlanningAnchor(state))))
  const days = mode === 'week' ? getWeekDays(planningAnchor) : getMonthDays(planningAnchor)

  function submitEntry(event: FormEvent) {
    event.preventDefault()
    const hours = hoursBetween(entryDraft.startTime, entryDraft.endTime)
    onEntrySave({
      ...entryDraft,
      id: entryDraft.id ?? makeId('entry'),
      hours,
      title: entryDraft.title || 'Gepland werk',
    })
    setEntryDraft(defaultEntry(entryDraft.projectId || state.projects[0]?.id || '', toDateKey(planningAnchor)))
  }

  function quickProject() {
    const base = emptyProject()
    const project: Project = {
      ...base,
      id: makeId('project'),
      name: 'Nieuwe planning flow',
      client: 'Nieuwe klant',
      color: projectColors[state.projects.length % projectColors.length],
      deadline: '2026-06-12',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    onProjectCreate(project)
    setEntryDraft((draft) => ({ ...draft, projectId: project.id }))
  }

  return (
    <div className="space-y-5">
      <div className="grid min-w-0 gap-5 min-[1380px]:grid-cols-[320px_minmax(0,1fr)]">
        <div className="order-2 min-[1380px]:order-1">
        <Panel title={entryDraft.id ? 'Planning bijwerken' : 'Tijdblok toevoegen'}>
          <form onSubmit={submitEntry} className="grid gap-3 md:grid-cols-2 min-[1380px]:block min-[1380px]:space-y-3">
            <Field label="Project">
              <select className="field" value={entryDraft.projectId} onChange={(event) => setEntryDraft({ ...entryDraft, projectId: event.target.value })} required>
                {state.projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Titel">
              <input className="field" value={entryDraft.title} onChange={(event) => setEntryDraft({ ...entryDraft, title: event.target.value })} placeholder="Workshop, bouwblok, review..." />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Datum">
                <input className="field" type="date" value={entryDraft.date} onChange={(event) => setEntryDraft({ ...entryDraft, date: event.target.value })} />
              </Field>
              <Field label="Factureerbaar">
                <select className="field" value={entryDraft.billable ? 'yes' : 'no'} onChange={(event) => setEntryDraft({ ...entryDraft, billable: event.target.value === 'yes' })}>
                  <option value="yes">Ja</option>
                  <option value="no">Nee</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start">
                <input className="field" type="time" value={entryDraft.startTime} onChange={(event) => setEntryDraft({ ...entryDraft, startTime: event.target.value })} />
              </Field>
              <Field label="Einde">
                <input className="field" type="time" value={entryDraft.endTime} onChange={(event) => setEntryDraft({ ...entryDraft, endTime: event.target.value })} />
              </Field>
            </div>
            <Field label="Notitie">
              <textarea className="field min-h-20 resize-none" value={entryDraft.notes} onChange={(event) => setEntryDraft({ ...entryDraft, notes: event.target.value })} />
            </Field>
            <div className="flex flex-col justify-end gap-3">
              <button type="button" className="text-left text-sm font-bold text-app-navy underline decoration-app-blue underline-offset-4" onClick={quickProject}>
                Snel demo-project toevoegen
              </button>
              <button className="btn-primary w-full" type="submit">
                <Plus size={17} /> {entryDraft.id ? 'Bijwerken' : 'Toevoegen'}
              </button>
            </div>
          </form>
        </Panel>
        </div>

      <section className="order-1 min-w-0 space-y-4 min-[1380px]:order-2">
        <div className="app-panel flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
          <div>
            <p className="app-caption text-app-blue">Week en maand</p>
            <h2 className="font-display text-xl font-black tracking-normal md:text-2xl">{planningAnchor.toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' })}</h2>
            <p className="text-sm text-app-muted">Tijdblokken toevoegen, aanpassen en opvolgen.</p>
          </div>
          <div className="segmented">
            <button className={mode === 'week' ? 'active' : ''} onClick={() => setMode('week')}>Week</button>
            <button className={mode === 'month' ? 'active' : ''} onClick={() => setMode('month')}>Maand</button>
          </div>
        </div>

        <div className={mode === 'week' ? 'grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4 min-[1380px]:grid-cols-7' : 'grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4 min-[1380px]:grid-cols-7'}>
          {days.map((day) => {
            const key = toDateKey(day)
            const entries = state.timeEntries.filter((entry) => entry.date === key).sort((a, b) => a.startTime.localeCompare(b.startTime))
            return (
              <article key={key} className="app-panel min-w-0 rounded-2xl p-3 xl:min-h-[178px]">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="app-caption text-app-muted">{day.toLocaleDateString('nl-BE', { weekday: 'short' })}</p>
                    <h3 className="font-display text-xl font-black">{day.getDate()}</h3>
                  </div>
                  <span className="shrink-0 rounded-full bg-app-blue/16 px-2.5 py-1 text-xs font-bold">{formatHours(entries.reduce((sum, entry) => sum + entry.hours, 0))}</span>
                </div>
                <div className="space-y-2">
                  {entries.map((entry) => {
                    const project = state.projects.find((item) => item.id === entry.projectId)
                    const selected = entryDraft.id === entry.id
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        className={`w-full rounded-xl border p-2 text-left transition hover:border-app-blue ${
                          selected ? 'border-app-navy bg-app-navy text-app-paper' : 'border-app-border bg-app-paper'
                        }`}
                        onClick={() => setEntryDraft(entry)}
                      >
                        <span className="block truncate text-sm font-bold">{entry.title}</span>
                        <span className={`mt-1 flex items-center gap-2 text-xs ${selected ? 'text-app-paper/70' : 'text-app-muted'}`}>
                          <i className="h-2 w-2 rounded-full" style={{ background: project?.color ?? '#86AAC4' }} />
                          {entry.startTime}-{entry.endTime}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </article>
            )
          })}
        </div>

        <Panel title="Alle planningblokken">
          <EntryList entries={state.timeEntries} projects={state.projects} onEdit={(entry) => setEntryDraft(entry)} onDelete={onEntryDelete} empty="Nog geen planningblokken." />
        </Panel>
      </section>
      </div>
    </div>
  )
}

function Projects({ state, onSave, onDelete }: { state: PlanState; onSave: (project: Project) => void; onDelete: (projectId: string) => void }) {
  const [draft, setDraft] = useState<Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string }>(() => emptyProject())

  function submitProject(event: FormEvent) {
    event.preventDefault()
    const timestamp = new Date().toISOString()
    onSave({
      ...draft,
      id: draft.id ?? makeId('project'),
      createdAt: draft.createdAt ?? timestamp,
      updatedAt: timestamp,
      estimatedHours: Number(draft.estimatedHours),
      rate: Number(draft.rate),
      budget: Number(draft.budget),
    })
    setDraft(emptyProject())
  }

  return (
    <div className="space-y-5">
      <ScreenIntro screen="projects" />
      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="order-2 xl:order-1">
        <Panel title={draft.id ? 'Project bijwerken' : 'Project toevoegen'}>
          <form onSubmit={submitProject} className="space-y-3">
            <Field label="Naam"><input className="field" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required /></Field>
            <Field label="Klant"><input className="field" value={draft.client} onChange={(event) => setDraft({ ...draft, client: event.target.value })} required /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Status">
                <select className="field" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as ProjectStatus })}>
                  {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </Field>
              <Field label="Type">
                <select className="field" value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as ProjectType })}>
                  {Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Deadline"><input className="field" type="date" value={draft.deadline} onChange={(event) => setDraft({ ...draft, deadline: event.target.value })} /></Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Uren"><input className="field" type="number" value={draft.estimatedHours} onChange={(event) => setDraft({ ...draft, estimatedHours: Number(event.target.value) })} /></Field>
              <Field label="Tarief"><input className="field" type="number" value={draft.rate} onChange={(event) => setDraft({ ...draft, rate: Number(event.target.value) })} /></Field>
              <Field label="Budget"><input className="field" type="number" value={draft.budget} onChange={(event) => setDraft({ ...draft, budget: Number(event.target.value) })} /></Field>
            </div>
            <Field label="Kleur">
              <div className="flex flex-wrap gap-2">
                {projectColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-8 w-8 rounded-lg border-2 ${draft.color === color ? 'border-app-navy' : 'border-app-border'}`}
                    style={{ background: color }}
                    aria-label={`Kleur ${color}`}
                    onClick={() => setDraft({ ...draft, color })}
                  />
                ))}
              </div>
            </Field>
            <button className="btn-primary w-full" type="submit"><Plus size={17} /> {draft.id ? 'Project bewaren' : 'Project toevoegen'}</button>
          </form>
        </Panel>
        </div>

      <section className="order-1 grid gap-3 lg:grid-cols-2 xl:order-2">
        {state.projects.map((project) => {
          const entries = state.timeEntries.filter((entry) => entry.projectId === project.id)
          const hours = entries.reduce((sum, entry) => sum + entry.hours, 0)
          const pct = project.estimatedHours ? Math.min(100, (hours / project.estimatedHours) * 100) : 0
          return (
            <article key={project.id} className="app-panel rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: project.color }} />
                    <span className="rounded-full bg-app-blue/16 px-2.5 py-1 text-xs font-bold">{statusLabels[project.status]}</span>
                  </div>
                  <h3 className="truncate font-display text-xl font-black tracking-normal">{project.name}</h3>
                  <p className="text-sm text-app-muted">{project.client} · {typeLabels[project.type]}</p>
                </div>
                <div className="flex gap-1">
                  <button className="icon-btn" onClick={() => setDraft(project)} aria-label={`Bewerk ${project.name}`}><Pencil size={16} /></button>
                  <button className="icon-btn text-red-700" onClick={() => onDelete(project.id)} aria-label={`Verwijder ${project.name}`}><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <MiniMetric label="Gepland" value={formatHours(hours)} light />
                <MiniMetric label="Estimate" value={formatHours(project.estimatedHours)} light />
                <MiniMetric label="Waarde" value={formatCurrency(projectRevenue(project, hours))} light />
              </div>
              <div className="mt-4 h-2 rounded-full bg-app-paper">
                <div className="h-full rounded-full bg-app-blue" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-sm text-app-muted">
                <span>Deadline: {project.deadline || 'niet gezet'}</span>
                <span className="font-bold text-app-navy">{Math.round(pct)}%</span>
              </div>
            </article>
          )
        })}
      </section>
      </div>
    </div>
  )
}

function Reports({ state }: { state: PlanState }) {
  const rows = state.projects.map((project) => {
    const entries = state.timeEntries.filter((entry) => entry.projectId === project.id)
    const hours = entries.reduce((sum, entry) => sum + entry.hours, 0)
    const billable = entries.filter((entry) => entry.billable).reduce((sum, entry) => sum + entry.hours, 0)
    return { project, hours, billable, revenue: projectRevenue(project, billable) }
  })
  const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0)

  function exportCsv() {
    const csv = [
      'project,client,status,type,hours,billable_hours,revenue',
      ...rows.map((row) => [row.project.name, row.project.client, row.project.status, row.project.type, row.hours, row.billable, row.revenue].join(',')),
    ].join('\n')
    downloadFile('plan-report.csv', csv, 'text/csv;charset=utf-8')
  }

  return (
    <div className="space-y-5">
      <ScreenIntro screen="reports" />
      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard icon={Clock3} label="Alle uren" value={formatHours(rows.reduce((sum, row) => sum + row.hours, 0))} helper="planning totaal" />
        <MetricCard icon={CheckCircle2} label="Factureerbaar" value={formatHours(rows.reduce((sum, row) => sum + row.billable, 0))} helper="uren met facturatie" />
        <MetricCard icon={BarChart3} label="Omzet" value={formatCurrency(totalRevenue)} helper="indicatief" />
      </section>
      <Panel title="Projectrapport">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <p className="max-w-xl text-sm leading-relaxed text-app-muted">Een compacte exportklare tabel met uren, factureerbare tijd en indicatieve projectwaarde.</p>
          <button className="btn-secondary" onClick={exportCsv}><Download size={17} /> CSV export</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-app-border text-xs uppercase tracking-[0.12em] text-app-muted">
              <tr>
                <th className="py-3">Project</th>
                <th>Status</th>
                <th>Type</th>
                <th className="text-right">Uren</th>
                <th className="text-right">Fact.</th>
                <th className="text-right">Waarde</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.project.id} className="border-b border-app-border/70 transition hover:bg-app-paper/60">
                  <td className="py-3 font-bold">{row.project.name}<span className="block text-xs font-medium text-app-muted">{row.project.client}</span></td>
                  <td><span className="rounded-full bg-app-blue/16 px-2.5 py-1 text-xs font-bold">{statusLabels[row.project.status]}</span></td>
                  <td>{typeLabels[row.project.type]}</td>
                  <td className="text-right">{formatHours(row.hours)}</td>
                  <td className="text-right">{formatHours(row.billable)}</td>
                  <td className="text-right font-bold">{formatCurrency(row.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function DataSettings({
  state,
  onReplace,
  onRestoreDemo,
  userEmail,
}: {
  state: PlanState
  onReplace: (state: PlanState) => void
  onRestoreDemo: () => void
  userEmail: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  function exportJson() {
    downloadFile('plan-data.json', JSON.stringify(state, null, 2), 'application/json')
  }

  async function importJson(file: File | undefined) {
    if (!file) return
    const text = await file.text()
    const parsed = JSON.parse(text) as PlanState
    if (!Array.isArray(parsed.projects) || !Array.isArray(parsed.timeEntries)) {
      throw new Error('Ongeldig Plan JSON-bestand')
    }
    onReplace(parsed)
  }

  return (
    <div className="space-y-5">
      <ScreenIntro screen="settings" />
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Export en import">
          <div className="space-y-3 text-sm text-app-muted">
            <p>Neem een volledige JSON-kopie mee of importeer bestaande Plan-data naar deze werkruimte.</p>
            <div className="grid gap-3">
              <button className="btn-secondary justify-start" onClick={exportJson}><FileJson size={18} /> JSON exporteren</button>
              <button className="btn-secondary justify-start" onClick={() => inputRef.current?.click()}><Upload size={18} /> JSON importeren</button>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(event) => importJson(event.target.files?.[0]).catch((error) => alert(error instanceof Error ? String(error).replace(/^Error: /, '') : 'Import mislukt'))}
            />
          </div>
        </Panel>
        <Panel title="Demo data">
          <div className="space-y-3 text-sm text-app-muted">
            <p>Herstel de voorbeeldprojecten en planningblokken wanneer je opnieuw met een zuivere demo wilt testen.</p>
            <button className="btn-secondary justify-start border-red-200 text-red-800 hover:bg-red-50" onClick={onRestoreDemo}>
              <RefreshCcw size={18} /> Demo data herstellen
            </button>
          </div>
        </Panel>
        <Panel title="Opslag en sessie">
          <div className="space-y-3 text-sm text-app-muted">
            <p>Postgres wordt enkel via server-side Next.js acties aangesproken; de databaseverbinding blijft buiten de browser.</p>
            <p><strong className="text-app-navy">{state.projects.length}</strong> projecten en <strong className="text-app-navy">{state.timeEntries.length}</strong> planningblokken actief voor {userEmail}.</p>
            <form action={logoutAction}>
              <button className="btn-secondary justify-start"><LogOut size={18} /> Uitloggen</button>
            </form>
          </div>
        </Panel>
      </div>
    </div>
  )
}

function ScreenIntro({ screen }: { screen: Screen }) {
  const meta = screenMeta[screen]
  return (
    <section className="app-panel rounded-2xl px-5 py-4 md:px-6">
      <p className="app-caption text-app-blue">{meta.eyebrow}</p>
      <div className="mt-2 grid gap-2 md:grid-cols-[minmax(0,.86fr)_minmax(280px,.56fr)] md:items-end">
        <h2 className="font-display text-2xl font-black leading-tight tracking-normal md:text-3xl">{meta.title}</h2>
        <p className="text-sm leading-relaxed text-app-muted md:text-base">{meta.text}</p>
      </div>
    </section>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="app-panel rounded-2xl p-4">
      <h2 className="mb-4 font-display text-xl font-black tracking-normal">{title}</h2>
      {children}
    </section>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-bold">
      <span className="app-caption mb-2 block text-app-muted">{label}</span>
      {children}
    </label>
  )
}

function MetricCard({ icon: Icon, label, value, helper }: { icon: typeof Clock3; label: string; value: string; helper: string }) {
  return (
    <article className="app-panel rounded-2xl p-4">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-app-blue/18 text-app-navy">
        <Icon size={20} />
      </div>
      <p className="app-caption text-app-muted">{label}</p>
      <strong className="mt-1 block font-display text-3xl font-black tracking-normal">{value}</strong>
      <p className="mt-1 text-xs text-app-muted">{helper}</p>
    </article>
  )
}

function MiniMetric({ label, value, light = false }: { label: string; value: string; light?: boolean }) {
  return (
    <div className={`min-w-0 rounded-xl border p-3 ${light ? 'border-app-border bg-app-paper/72' : 'border-app-paper/14 bg-white/7'}`}>
      <p className={`truncate text-xs font-bold ${light ? 'text-app-muted' : 'text-app-paper/62'}`}>{label}</p>
      <strong className="mt-1 block truncate font-display text-base font-black tracking-normal md:text-lg">{value}</strong>
    </div>
  )
}

function EntryList({
  entries,
  projects,
  onEdit,
  onDelete,
  empty,
}: {
  entries: TimeEntry[]
  projects: Project[]
  onEdit?: (entry: TimeEntry) => void
  onDelete?: (entryId: string) => void
  empty: string
}) {
  if (entries.length === 0) return <p className="text-sm text-app-muted">{empty}</p>
  return (
    <div className="space-y-2">
      {[...entries].sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)).map((entry) => {
        const project = projects.find((item) => item.id === entry.projectId)
        return (
          <div key={entry.id} className="flex items-center justify-between gap-3 rounded-xl border border-app-border bg-app-paper/70 p-3">
            <div className="min-w-0">
              <p className="truncate font-bold">{entry.title}</p>
              <p className="flex flex-wrap items-center gap-2 text-sm text-app-muted">
                <span className="h-2 w-2 rounded-full" style={{ background: project?.color ?? '#86AAC4' }} />
                {project?.name ?? 'Onbekend project'} · {entry.date} · {entry.startTime}-{entry.endTime} · {formatHours(entry.hours)}
              </p>
            </div>
            {(onEdit || onDelete) && (
              <div className="flex shrink-0 gap-1">
                {onEdit && <button className="icon-btn" onClick={() => onEdit(entry)} aria-label={`Bewerk ${entry.title}`}><Pencil size={16} /></button>}
                {onDelete && <button className="icon-btn text-red-700" onClick={() => onDelete(entry.id)} aria-label={`Verwijder ${entry.title}`}><Trash2 size={16} /></button>}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function dateFromKey(key: string) {
  return new Date(`${key}T12:00:00`)
}

function getPlanningAnchor(state: PlanState) {
  const today = todayKey()
  const futureEntry = [...state.timeEntries]
    .filter((entry) => entry.date >= today)
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))[0]

  if (futureEntry) return dateFromKey(futureEntry.date)

  const latestEntry = [...state.timeEntries].sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`))[0]
  if (latestEntry) return dateFromKey(latestEntry.date)

  return new Date()
}

function formatWeekLabel(days: Date[]) {
  const first = days[0]
  const last = days[days.length - 1]
  if (!first || !last) return 'deze week'
  const month = last.toLocaleDateString('nl-BE', { month: 'short' }).replace('.', '')
  return `${first.getDate()}-${last.getDate()} ${month}`
}

function getMetrics(state: PlanState) {
  const today = todayKey()
  const planningAnchor = getPlanningAnchor(state)
  const weekDays = getWeekDays(planningAnchor)
  const weekKeys = new Set(weekDays.map(toDateKey))
  const todayEntries = state.timeEntries.filter((entry) => entry.date === today)
  const weekEntries = state.timeEntries.filter((entry) => weekKeys.has(entry.date))
  const nextEntry = [...state.timeEntries].filter((entry) => entry.date >= today).sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))[0]
  const focusDate = todayEntries.length ? today : nextEntry?.date
  const focusEntries = focusDate ? state.timeEntries.filter((entry) => entry.date === focusDate).sort((a, b) => a.startTime.localeCompare(b.startTime)) : []
  const billableHours = state.timeEntries.filter((entry) => entry.billable).reduce((sum, entry) => sum + entry.hours, 0)
  const hourlyRevenue = state.timeEntries.reduce((sum, entry) => sum + entryRevenue(state.projects, entry), 0)
  const fixedRevenue = state.projects.filter((project) => project.type === 'fixed' && project.status !== 'archived').reduce((sum, project) => sum + (project.budget || 0), 0)
  return {
    activeProjects: state.projects.filter((project) => project.status === 'active').length,
    todayHours: todayEntries.reduce((sum, entry) => sum + entry.hours, 0),
    todayEntries,
    focusEntries,
    focusTitle: todayEntries.length ? 'Vandaag' : focusDate ? `Eerstvolgende planning · ${dateFromKey(focusDate).toLocaleDateString('nl-BE', { day: '2-digit', month: 'short' })}` : 'Vandaag',
    weekHours: weekEntries.reduce((sum, entry) => sum + entry.hours, 0),
    weekEntries: weekEntries.length,
    weekLabel: formatWeekLabel(weekDays),
    billableHours,
    revenue: hourlyRevenue + fixedRevenue,
    deadlines: [...state.projects]
      .filter((project) => project.deadline && project.status !== 'archived' && project.status !== 'done')
      .sort((a, b) => a.deadline.localeCompare(b.deadline))
      .slice(0, 5),
  }
}

export default App
