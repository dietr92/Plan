'use client'

import { useActionState } from 'react'
import { loginAction } from '@/app/actions'

const initialState = { error: '' }

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState)

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-800">{state.error}</div>}
      <label className="block text-sm font-bold">
        <span className="mb-1.5 block text-app-muted">E-mail</span>
        <input className="field" type="email" name="email" autoComplete="email" required />
      </label>
      <label className="block text-sm font-bold">
        <span className="mb-1.5 block text-app-muted">Wachtwoord</span>
        <input className="field" type="password" name="password" autoComplete="current-password" required />
      </label>
      <button className="btn-primary w-full" type="submit" disabled={pending}>
        {pending ? 'Bezig met inloggen...' : 'Inloggen'}
      </button>
    </form>
  )
}
