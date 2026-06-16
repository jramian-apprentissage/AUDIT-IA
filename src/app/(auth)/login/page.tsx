'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'radial-gradient(circle at 30% 20%, rgba(17,148,162,0.10), transparent 50%), linear-gradient(180deg, #0a0c12 0%, #050608 100%)' }}
    >
      {/* Glow décoratif */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-20" style={{ background: '#1194A2' }} />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-10" style={{ background: '#1194A2' }} />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Image src="/hr-logo.svg" alt="HR" width={64} height={36} style={{ objectFit: 'contain' }} />
          </div>
          <h1 className="text-lg font-bold text-zinc-100 tracking-wide">HOMERESINE</h1>
          <p className="text-xs mt-1" style={{ color: '#1194A2' }}>Audit Platform · Cepremium</p>
        </div>

        {/* Carte login */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 space-y-4"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
        >
          <div>
            <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide mb-1.5 block">Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@exemple.fr"
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                onFocus={e => (e.target.style.borderColor = '#1194A2')}
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
                onFocus={e => (e.target.style.borderColor = '#1194A2')}
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
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #1194A2, #0d7a87)' }}
          >
            {loading ? 'Connexion…' : <>Se connecter <ArrowRight size={15} /></>}
          </button>

          <div className="flex items-center justify-center gap-4 pt-1 text-[10px] text-zinc-600">
            <span className="flex items-center gap-1"><ShieldCheck size={11} /> Accès complet</span>
            <span className="flex items-center gap-1"><Eye size={11} /> Lecture seule</span>
          </div>
        </form>

        <p className="text-center text-[11px] text-zinc-600 mt-6">
          Mission Audit Lean IT — HOMERESINE · Groupe Gross
        </p>
      </div>
    </div>
  )
}
