'use client'

import { useMemo, useState } from 'react'
import { Bug, Lightbulb, MessageSquare, Send, X } from 'lucide-react'
import type { Screen } from '../types'

type FeedbackType = 'BUG' | 'IDEA' | 'QUESTION' | 'OTHER'

const screenLabels: Record<Screen, string> = {
  dashboard: 'Overzicht',
  planning: 'Planning',
  projects: 'Projecten',
  reports: 'Rapporten',
  settings: 'Data',
}

const typeOptions: { value: FeedbackType; label: string; icon: typeof Bug }[] = [
  { value: 'BUG', label: 'Bug', icon: Bug },
  { value: 'IDEA', label: 'Idee', icon: Lightbulb },
  { value: 'QUESTION', label: 'Vraag', icon: MessageSquare },
  { value: 'OTHER', label: 'Andere', icon: MessageSquare },
]

export function FeedbackWidget({ screen }: { screen: Screen }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<FeedbackType>('BUG')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const screenLabel = screenLabels[screen]

  const canSubmit = useMemo(() => message.trim().length >= 3 && status !== 'submitting', [message, status])

  async function submitFeedback() {
    if (!canSubmit) return
    setStatus('submitting')
    setError('')
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          message: message.trim(),
          screen_path: `/${screen}`,
          screen_label: screenLabel,
          url: window.location.href,
          user_agent: navigator.userAgent,
        }),
      })
      const json = (await response.json().catch(() => ({}))) as { error?: string }
      if (!response.ok) throw new Error(json.error || 'Feedback kon niet verzonden worden')
      setStatus('success')
      setMessage('')
      setType('BUG')
      window.setTimeout(() => {
        setOpen(false)
        setStatus('idle')
      }, 900)
    } catch (submitError) {
      setStatus('error')
      setError(submitError instanceof Error ? submitError.message : 'Feedback kon niet verzonden worden')
    }
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 md:bottom-5 md:right-5">
      {open && (
        <section className="app-panel mb-3 w-[min(calc(100vw-2rem),360px)] p-3.5">
          <header className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="app-caption text-app-blue">Feedback</p>
              <h2 className="font-display text-base font-black">Plan verbeteren</h2>
              <p className="text-sm text-app-muted">{screenLabel} · bewaard en doorgestuurd.</p>
            </div>
            <button className="icon-btn" type="button" onClick={() => setOpen(false)} aria-label="Sluit feedback">
              <X size={16} />
            </button>
          </header>

          <div className="mb-3 grid grid-cols-4 gap-1.5">
            {typeOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  className={`rounded-md border px-2 py-2 text-xs font-black transition ${
                    type === option.value
                      ? 'border-app-navy bg-app-navy text-app-paper'
                      : 'border-app-border bg-app-paper/70 text-app-muted hover:border-app-blue hover:text-app-navy'
                  }`}
                >
                  <Icon className="mx-auto mb-1" size={16} />
                  {option.label}
                </button>
              )
            })}
          </div>

          <textarea
            className="field min-h-28 resize-none"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Wat valt op, mist er iets, of werkt er iets niet?"
            maxLength={2000}
          />

          {status === 'success' && <p className="mt-2 text-sm font-bold text-app-navy">Feedback opgeslagen.</p>}
          {status === 'error' && <p className="mt-2 text-sm font-bold text-red-700">{error}</p>}

          <button className="btn-primary mt-3 w-full" type="button" onClick={submitFeedback} disabled={!canSubmit}>
            <Send size={16} /> {status === 'submitting' ? 'Versturen...' : 'Verstuur feedback'}
          </button>
        </section>
      )}

      <button
        className="grid h-11 w-11 place-items-center rounded-xl border border-app-border bg-app-navy text-app-paper shadow-soft transition hover:-translate-y-0.5 hover:bg-app-blue hover:text-app-navy"
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Sluit feedback' : 'Open feedback'}
      >
        <MessageSquare size={22} />
      </button>
    </div>
  )
}
