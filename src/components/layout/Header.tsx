'use client'

import { Mission } from '@/types'
import { Badge } from '@/components/ui/badge'

interface HeaderProps {
  mission?: Mission | null
}

export function Header({ mission }: HeaderProps) {
  return (
    <header className="fixed top-0 left-56 right-0 h-14 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 flex items-center px-6 z-30">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-zinc-100">
          {mission?.nom_client || 'HOMERESINE'}
        </span>
        <span className="text-zinc-700">·</span>
        <span className="text-xs text-zinc-400">{mission?.phase_courante || 'Phase 01 — Audit Lean IT'}</span>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <Badge variant="success">{mission?.statut || 'En cours'}</Badge>
        <div className="text-xs text-zinc-500">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>
    </header>
  )
}
