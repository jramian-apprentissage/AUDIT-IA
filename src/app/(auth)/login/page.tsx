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
      {/* Colonne connexion — top sur mobile (order-1), droite sur desktop (order-2) */}
      <div
        className="order-1 lg:order-2 flex-1 lg:w-1/2 flex items-center justify-center px-4 py-14 lg:py-12 relative overflow-hidden"
        style={{ background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.02), transparent 60%), #0a0a0c' }}
      >
        {/* Halos Aurora */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="aurora-1 absolute -top-20 right-[-10%] w-[420px] h-[420px] rounded-full blur-[110px]"
            style={{ background: 'radial-gradient(circle, #FFC400 0%, transparent 70%)' }}
          />
          <div
            className="aurora-2 absolute bottom-[-15%] left-[-10%] w-[460px] h-[460px] rounded-full blur-[120px]"
            style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)' }}
          />
          <div
            className="aurora-3 absolute top-[35%] left-[40%] w-[320px] h-[320px] rounded-full blur-[100px]"
            style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
          />
        </div>

        <div className="w-full max-w-sm relative z-10 animate-form-in">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl p-7 backdrop-blur-xl"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,196,0,0.25)',
              boxShadow: '0 0 0 1px rgba(255,196,0,0.05), 0 25px 70px -10px rgba(0,0,0,0.6), 0 0 50px -15px rgba(255,196,0,0.12)',
            }}
          >
            <h1 className="text-xl font-bold mb-6 transition-colors" style={{ color: '#FFC400' }}>Se connecter</h1>

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
                    className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all duration-300"
                    style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                    onFocus={e => (e.target.style.borderColor = '#FFC400')}
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
                    className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all duration-300"
                    style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                    onFocus={e => (e.target.style.borderColor = '#FFC400')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                  />
                </div>
              </div>

              {error && (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 transition-all">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all duration-300 disabled:opacity-50 mt-2 hover:brightness-110 hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #FFC400 0%, #2FB6D8 55%, #2563EB 100%)', color: '#0a0a0c' }}
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

      {/* Colonne branding — bas sur mobile (order-2), gauche sur desktop (order-1) */}
      <div className="order-2 lg:order-1 lg:w-1/2 bg-white flex items-center justify-center relative overflow-hidden p-10 lg:p-12">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-[0.06]" style={{ background: '#2563EB' }} />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full opacity-[0.06]" style={{ background: '#FFC400' }} />

        <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/omeo-logo.svg" alt="OMEO" width={110} height={94} style={{ objectFit: 'contain' }} />
          <div className="mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/omeo-texte.svg" alt="L'humain au coeur du métier" width={230} height={68} style={{ objectFit: 'contain' }} />
          </div>
          <div className="w-10 h-px bg-zinc-200 my-5" />
          <p className="text-sm text-zinc-500 leading-relaxed">
            Plateforme d&apos;audit Lean IT<br />
            <span className="font-semibold text-zinc-700">Mission HOMERESINE</span> · Groupe Gross
          </p>
        </div>
      </div>
    </div>
  )
}
