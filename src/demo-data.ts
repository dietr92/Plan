import type { PlanState, Project } from './types'
import { getWeekDays, toDateKey } from './utils'

export const projectColors = ['#0B2038', '#86AAC4', '#F2D88B', '#52667A', '#A76E2D', '#D8C7AA']

export const emptyProject = (): Omit<Project, 'id' | 'createdAt' | 'updatedAt'> => ({
  name: '',
  client: '',
  status: 'planned',
  type: 'hourly',
  color: projectColors[0],
  deadline: '',
  estimatedHours: 24,
  rate: 95,
  budget: 0,
})

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function demoProject(base: Omit<Project, 'createdAt' | 'updatedAt'>, timestamp: string): Project {
  return { ...base, createdAt: timestamp, updatedAt: timestamp }
}

export function buildDemoState(referenceDate = new Date()): PlanState {
  const timestamp = referenceDate.toISOString()
  const week = getWeekDays(referenceDate)
  const day = (index: number) => toDateKey(week[index] ?? referenceDate)
  const offsetDay = (offset: number) => toDateKey(addDays(referenceDate, offset))

  const projects = [
    demoProject({
      id: 'proj-production-planning',
      name: 'Productieplanning sprint',
      client: 'Verduyn Foods',
      status: 'active',
      type: 'hourly',
      color: '#0B2038',
      deadline: offsetDay(8),
      estimatedHours: 44,
      rate: 105,
      budget: 0,
    }, timestamp),
    demoProject({
      id: 'proj-stock-rollout',
      name: 'Stock scanflow rollout',
      client: 'Vandermarliere',
      status: 'active',
      type: 'fixed',
      color: '#86AAC4',
      deadline: offsetDay(15),
      estimatedHours: 38,
      rate: 95,
      budget: 5200,
    }, timestamp),
    demoProject({
      id: 'proj-service-orders',
      name: 'Service order forecast',
      client: 'Apvine',
      status: 'active',
      type: 'hourly',
      color: '#52667A',
      deadline: offsetDay(21),
      estimatedHours: 52,
      rate: 115,
      budget: 0,
    }, timestamp),
    demoProject({
      id: 'proj-quote-flow',
      name: 'Offerteflow herwerken',
      client: 'Bloemenatelier Iris',
      status: 'planned',
      type: 'fixed',
      color: '#F2D88B',
      deadline: offsetDay(28),
      estimatedHours: 30,
      rate: 95,
      budget: 3800,
    }, timestamp),
    demoProject({
      id: 'proj-support-portal',
      name: 'Supportportaal intake',
      client: 'Atelier Co-Pains',
      status: 'waiting',
      type: 'hourly',
      color: '#A76E2D',
      deadline: offsetDay(18),
      estimatedHours: 24,
      rate: 90,
      budget: 0,
    }, timestamp),
    demoProject({
      id: 'proj-reporting-cleanup',
      name: 'Rapportage opschonen',
      client: 'Lokaal bestuur',
      status: 'done',
      type: 'hourly',
      color: '#D8C7AA',
      deadline: offsetDay(-5),
      estimatedHours: 18,
      rate: 100,
      budget: 0,
    }, timestamp),
    demoProject({
      id: 'proj-appetite-internal',
      name: 'Plan demo assets',
      client: 'Appetite',
      status: 'planned',
      type: 'internal',
      color: '#F2D88B',
      deadline: offsetDay(10),
      estimatedHours: 20,
      rate: 0,
      budget: 0,
    }, timestamp),
  ]

  const timeEntries = [
    { id: 'entry-001', projectId: 'proj-production-planning', title: 'Flowmapping met operations', date: day(0), startTime: '09:00', endTime: '12:00', hours: 3, billable: true, notes: 'Capaciteit en uitzonderingen uitgetekend.' },
    { id: 'entry-002', projectId: 'proj-stock-rollout', title: 'Scannerfeedback verwerken', date: day(0), startTime: '13:00', endTime: '16:30', hours: 3.5, billable: true, notes: 'Mobiele scanflow aangescherpt.' },
    { id: 'entry-003', projectId: 'proj-service-orders', title: 'Forecastmatrix finetunen', date: day(1), startTime: '09:30', endTime: '12:00', hours: 2.5, billable: true, notes: 'Projectrijen en dagtotalen afgestemd.' },
    { id: 'entry-004', projectId: 'proj-appetite-internal', title: 'Screenshots voorbereiden', date: day(1), startTime: '13:00', endTime: '15:00', hours: 2, billable: false, notes: 'Nieuwe Appetite visuals geselecteerd.' },
    { id: 'entry-005', projectId: 'proj-production-planning', title: 'Weekplanning bouwen', date: day(2), startTime: '09:00', endTime: '12:30', hours: 3.5, billable: true, notes: 'Planningblokken gegroepeerd per project.' },
    { id: 'entry-006', projectId: 'proj-quote-flow', title: 'Offertestatussen uitschrijven', date: day(2), startTime: '14:00', endTime: '16:00', hours: 2, billable: true, notes: 'Concept voor vaste-prijsflow.' },
    { id: 'entry-007', projectId: 'proj-stock-rollout', title: 'Gebruikerstest voorbereiden', date: day(3), startTime: '09:30', endTime: '11:30', hours: 2, billable: true, notes: 'Testscenario voor magazijnteam.' },
    { id: 'entry-008', projectId: 'proj-service-orders', title: 'Beschikbaarheid projectteams', date: day(3), startTime: '13:00', endTime: '16:00', hours: 3, billable: true, notes: 'Teamcapaciteit vergeleken met planning.' },
    { id: 'entry-009', projectId: 'proj-production-planning', title: 'Review met delivery lead', date: day(4), startTime: '10:00', endTime: '12:00', hours: 2, billable: true, notes: 'Beslissingen en resterende risico’s vastgelegd.' },
    { id: 'entry-010', projectId: 'proj-support-portal', title: 'Wachten op content', date: day(4), startTime: '13:30', endTime: '14:30', hours: 1, billable: false, notes: 'Intakepunten gecontroleerd.' },
    { id: 'entry-011', projectId: 'proj-appetite-internal', title: 'Website Plan-pagina bijwerken', date: day(4), startTime: '15:00', endTime: '17:00', hours: 2, billable: false, notes: 'Screenshots en demo-uitleg afgestemd.' },
    { id: 'entry-012', projectId: 'proj-stock-rollout', title: 'Datamodel afstemmen', date: offsetDay(-6), startTime: '09:00', endTime: '11:00', hours: 2, billable: true, notes: 'Projectvelden en budgetten nagekeken.' },
    { id: 'entry-013', projectId: 'proj-reporting-cleanup', title: 'CSV-export controleren', date: offsetDay(-5), startTime: '11:00', endTime: '13:00', hours: 2, billable: true, notes: 'Kolommen en totalen gevalideerd.' },
    { id: 'entry-014', projectId: 'proj-service-orders', title: 'Role-based planning review', date: offsetDay(-4), startTime: '09:30', endTime: '12:30', hours: 3, billable: true, notes: 'Planner en delivery lead scenario’s getest.' },
    { id: 'entry-015', projectId: 'proj-production-planning', title: 'Planningregels aanscherpen', date: offsetDay(-3), startTime: '14:00', endTime: '17:00', hours: 3, billable: true, notes: 'Week- en maandweergave gelijkgetrokken.' },
    { id: 'entry-016', projectId: 'proj-appetite-internal', title: 'Feedback verwerken', date: offsetDay(-2), startTime: '10:00', endTime: '12:00', hours: 2, billable: false, notes: 'UX-notities verwerkt in demo.' },
    { id: 'entry-017', projectId: 'proj-quote-flow', title: 'Klantreview voorbereiden', date: offsetDay(5), startTime: '09:00', endTime: '11:30', hours: 2.5, billable: true, notes: 'Demo-pad voor offerteflow.' },
    { id: 'entry-018', projectId: 'proj-service-orders', title: 'Zoekfilters testen', date: offsetDay(6), startTime: '13:00', endTime: '15:00', hours: 2, billable: true, notes: 'Status- en projectfilter getest.' },
    { id: 'entry-019', projectId: 'proj-production-planning', title: 'Sprintoverdracht', date: offsetDay(7), startTime: '09:30', endTime: '12:00', hours: 2.5, billable: true, notes: 'Planning voor volgende week vastgezet.' },
    { id: 'entry-020', projectId: 'proj-stock-rollout', title: 'Release check', date: offsetDay(8), startTime: '14:00', endTime: '16:00', hours: 2, billable: true, notes: 'Laatste issues voor testrelease.' },
    { id: 'entry-021', projectId: 'proj-support-portal', title: 'Intakevragen bundelen', date: offsetDay(9), startTime: '10:00', endTime: '12:00', hours: 2, billable: true, notes: 'Wachtpunten naar klant gestuurd.' },
    { id: 'entry-022', projectId: 'proj-quote-flow', title: 'Prototype offerteoverzicht', date: offsetDay(10), startTime: '13:00', endTime: '16:30', hours: 3.5, billable: true, notes: 'Compact overzicht voor KMO-team.' },
    { id: 'entry-023', projectId: 'proj-service-orders', title: 'Rapportage planned vs actual', date: offsetDay(12), startTime: '09:00', endTime: '11:00', hours: 2, billable: true, notes: 'Billable en non-billable uitgesplitst.' },
    { id: 'entry-024', projectId: 'proj-appetite-internal', title: 'Demo-data nalopen', date: offsetDay(13), startTime: '11:00', endTime: '12:30', hours: 1.5, billable: false, notes: 'Dummy data rond de actuele week gezet.' },
  ]

  return { projects, timeEntries }
}

export const seedState: PlanState = buildDemoState()
