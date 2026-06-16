'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail, ArrowRight, ShieldCheck, Eye } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (res.ok) {
      router.push('/dashboard')
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Identifiants incorrects')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Colonne gauche — univers blanc institutionnel */}
      <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center relative overflow-hidden p-12">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-[0.06]" style={{ background: '#1A3FA0' }} />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full opacity-[0.06]" style={{ background: '#FFCC00' }} />

        <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/omeo-logo.svg" alt="OMEO" width={130} height={110} style={{ objectFit: 'contain' }} />
          <div className="mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/omeo-texte.svg" alt="L'humain au coeur du métier" width={270} height={78} style={{ objectFit: 'contain' }} />
          </div>
          <div className="w-10 h-px bg-zinc-200 my-6" />
          <p className="text-sm text-zinc-500 leading-relaxed">
            Plateforme d&apos;audit Lean IT<br />
            <span className="font-semibold text-zinc-700">Mission HOMERESINE</span> · Groupe Gross
          </p>
        </div>
      </div>

      {/* Colonne droite — connexion sur fond sombre */}
      <div
        className="flex-1 lg:w-1/2 flex items-center justify-center px-4 py-12 relative overflow-hidden"
        style={{ background: 'radial-gradient(circle at 70% 25%, rgba(255,204,0,0.10), transparent 45%), radial-gradient(circle at 20% 85%, rgba(26,63,160,0.14), transparent 45%), #0a0a0c' }}
      >
        {/* Logo mobile uniquement (caché sur desktop car colonne gauche visible) */}
        <div className="lg:hidden absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center p-2.5" style={{ background: 'rgba(255,255,255,0.97)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/omeo-logo.svg" alt="OMEO" width={52} height={44} style={{ objectFit: 'contain' }} />
          </div>
        </div>

        <div className="w-full max-w-sm relative z-10 mt-20 lg:mt-0">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl p-7"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
              border: '1px solid rgba(255,204,0,0.25)',
              boxShadow: '0 0 0 1px rgba(255,204,0,0.05), 0 20px 60px -10px rgba(0,0,0,0.5), 0 0 40px -10px rgba(255,204,0,0.08)',
            }}
          >
            <h1 className="text-xl font-bold mb-6" style={{ color: '#FFCC00' }}>Se connecter</h1>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@omeo.mg"
                    className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all"
                    style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                    onFocus={e => (e.target.style.borderColor = '#FFCC00')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide mb-1.5 block">Mot de passe</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all"
                    style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                    onFocus={e => (e.target.style.borderColor = '#FFCC00')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                  />
                </div>
              </div>

              {error && (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all disabled:opacity-50 mt-2"
                style={{ background: 'linear-gradient(135deg, #FFCC00 0%, #2FB6D8 55%, #1A3FA0 100%)', color: '#0a0a0c' }}
              >
                {loading ? 'Connexion…' : <>Se connecter <ArrowRight size={15} /></>}
              </button>

              <div className="flex items-center justify-center gap-4 pt-1 text-[10px] text-zinc-600">
                <span className="flex items-center gap-1"><ShieldCheck size={11} /> Accès complet</span>
                <span className="flex items-center gap-1"><Eye size={11} /> Lecture seule</span>
              </div>
            </div>
          </form>

          <p className="text-center text-[11px] text-zinc-600 mt-6">
            Audit Lean IT — HOMERESINE × OMEO
          </p>
        </div>
      </div>
    </div>
  )
}
