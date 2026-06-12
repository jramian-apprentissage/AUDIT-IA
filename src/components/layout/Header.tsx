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
      className="fixed top-0 left-56 right-0 h-14 flex items-center px-6 z-30"
      style={{
        background: 'rgba(10, 12, 18, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Left — logo + mission */}
      <div className="flex items-center gap-3">
        <Image src="/hr-logo.svg" alt="HR" width={28} height={28} className="rounded-md opacity-90" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-zinc-100 tracking-wide">
            {mission?.nom_client || 'HOMERESINE'}
          </span>
          <span className="text-zinc-700 text-xs">·</span>
          <span className="text-xs text-zinc-500">{mission?.groupe || 'Groupe Gross'}</span>
        </div>
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium"
          style={{ background: 'rgba(0,180,200,0.08)', border: '1px solid rgba(0,180,200,0.18)', color: '#00b4c8' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {mission?.phase_courante || 'Phase 01 — Audit Lean IT'}
        </div>
      </div>

      {/* Right */}
      <div className="ml-auto flex items-center gap-4">
        <Badge variant="success">{mission?.statut || 'En cours'}</Badge>
        <div
          className="text-[11px] px-3 py-1 rounded-md"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}
        >
          {today}
        </div>
      </div>
    </header>
  )
}
