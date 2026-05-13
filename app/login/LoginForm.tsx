'use client'

import { useActionState } from 'react'
import { loginAction } from '@/app/actions'

const initialState = { error: '' }

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState)

  return (
    <form action={formAction} className="space-y-5">
      {state.error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-800">{state.error}</div>}
      <label className="block text-sm font-bold text-app-navy">
        <span className="mb-2 block text-sm font-extrabold">Gebruiker</span>
        <input className="field" type="text" name="email" autoComplete="username" placeholder="demo" required />
      </label>
      <label className="block text-sm font-bold text-app-navy">
        <span className="mb-2 block text-sm font-extrabold">Wachtwoord</span>
        <input className="field" type="password" name="password" autoComplete="current-password" required />
      </label>
      <button className="w-full rounded-lg border border-app-navy/14 bg-app-blue px-4 py-3 text-base font-black text-app-navy transition hover:bg-app-muted hover:text-app-paper disabled:opacity-60" type="submit" disabled={pending}>
        {pending ? 'Bezig met inloggen...' : 'Inloggen'}
      </button>
    </form>
  )
}
