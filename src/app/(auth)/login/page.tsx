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
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'radial-gradient(circle at 25% 15%, rgba(255,204,0,0.08), transparent 45%), radial-gradient(circle at 80% 85%, rgba(26,63,160,0.12), transparent 45%), #0a0a0c' }}
    >
      {/* Glows décoratifs aux couleurs OMEO */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-[0.12]" style={{ background: '#FFCC00' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-[0.15]" style={{ background: '#1A3FA0' }} />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo OMEO */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-4 p-3" style={{ background: 'rgba(255,255,255,0.97)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/omeo-logo.svg" alt="OMEO" width={80} height={68} style={{ objectFit: 'contain' }} />
          </div>
          <div className="rounded-xl px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.97)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/omeo-texte.svg" alt="L'humain au coeur du métier" width={210} height={62} style={{ objectFit: 'contain' }} />
          </div>
          <p className="text-[11px] text-zinc-500 mt-2 tracking-wide">Plateforme d&apos;audit · Mission HOMERESINE</p>
        </div>

        {/* Carte login */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 space-y-4"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
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
                placeholder="admin@omeo.mg"
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                onFocus={e => (e.target.style.borderColor = '#2B5FD9')}
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
                onFocus={e => (e.target.style.borderColor = '#2B5FD9')}
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
            style={{ background: 'linear-gradient(135deg, #FFCC00 0%, #2FB6D8 55%, #1A3FA0 100%)' }}
          >
            <span style={{ color: '#0a0a0c' }} className="font-bold flex items-center gap-2">
              {loading ? 'Connexion…' : <>Se connecter <ArrowRight size={15} /></>}
            </span>
          </button>

          <div className="flex items-center justify-center gap-4 pt-1 text-[10px] text-zinc-600">
            <span className="flex items-center gap-1"><ShieldCheck size={11} /> Accès complet</span>
            <span className="flex items-center gap-1"><Eye size={11} /> Lecture seule</span>
          </div>
        </form>

        <p className="text-center text-[11px] text-zinc-600 mt-6">
          Audit Lean IT — HOMERESINE × OMEO
        </p>
      </div>
    </div>
  )
}
