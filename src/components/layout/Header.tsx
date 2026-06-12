'use client'

import Image from 'next/image'
import { Mission } from '@/types'
import { Badge } from '@/components/ui/badge'

interface HeaderProps {
  mission?: Mission | null
}

export function Header({ mission }: HeaderProps) {
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <header
      className="fixed top-0 left-0 lg:left-56 right-0 h-14 flex items-center px-4 lg:px-6 z-30"
      style={{
        background: 'rgba(10, 12, 18, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo + mission */}
      <div className="flex items-center gap-2 lg:gap-3">
        <Image
          src="/hr-logo.svg"
          alt="HR"
          width={44}
          height={25}
          className="flex-shrink-0"
          style={{ objectFit: 'contain' }}
        />
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-zinc-100 tracking-wide">
            {mission?.nom_client || 'HOMERESINE'}
          </span>
          <span className="text-zinc-700 text-xs hidden sm:block">·</span>
          <span className="text-xs text-zinc-500 hidden sm:block">{mission?.groupe || 'Groupe Gross'}</span>
        </div>
        <div
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium"
          style={{ background: 'rgba(17,148,162,0.08)', border: '1px solid rgba(17,148,162,0.18)', color: '#1194A2' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {mission?.phase_courante || 'Phase 01 — Audit Lean IT'}
        </div>
      </div>

      {/* Right */}
      <div className="ml-auto flex items-center gap-2 lg:gap-4">
        <Badge variant="success">{mission?.statut || 'En cours'}</Badge>
        <div
          className="text-[11px] px-3 py-1 rounded-md hidden sm:block"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}
        >
          {today}
        </div>
      </div>
    </header>
  )
}
