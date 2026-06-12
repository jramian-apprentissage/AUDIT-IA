'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, ClipboardList, FileText, ChevronRight } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Vue d\'ensemble' },
  { href: '/audit', label: 'Audit', icon: ClipboardList, desc: 'Intervenants' },
  { href: '/formulaires', label: 'Formulaires', icon: FileText, desc: 'Builder & envois' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 flex flex-col z-40"
      style={{ background: 'linear-gradient(180deg, #0f1117 0%, #0a0c12 100%)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Logo */}
      <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3">
          <Image src="/hr-logo.svg" alt="HR Logo" width={36} height={36} className="rounded-lg flex-shrink-0" />
          <div>
            <div className="text-xs font-bold text-zinc-100 tracking-widest uppercase">Homeresine</div>
            <div className="text-[10px] font-medium mt-0.5" style={{ color: '#00b4c8' }}>Audit Platform</div>
          </div>
        </div>
      </div>

      {/* Mission badge */}
      <div className="mx-3 mt-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(0,180,200,0.07)', border: '1px solid rgba(0,180,200,0.15)' }}>
        <div className="text-[9px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(0,180,200,0.6)' }}>Mission active</div>
        <div className="text-[11px] text-zinc-300 font-medium leading-tight">Lean IT · Groupe Gross</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5">
        {navItems.map(({ href, label, icon: Icon, desc }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 relative',
                active
                  ? 'text-zinc-100 font-medium'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
              style={active ? {
                background: 'linear-gradient(135deg, rgba(0,180,200,0.12) 0%, rgba(0,180,200,0.04) 100%)',
                border: '1px solid rgba(0,180,200,0.2)',
              } : {}}
            >
              {/* Active indicator bar */}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full" style={{ background: '#00b4c8' }} />
              )}
              <div className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200',
                active ? 'bg-cyan-500/15' : 'bg-zinc-800/60 group-hover:bg-zinc-700/60'
              )}>
                <Icon size={14} style={active ? { color: '#00b4c8' } : {}} className={active ? '' : 'text-zinc-500 group-hover:text-zinc-300'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={active ? 'text-zinc-100' : 'text-zinc-400 group-hover:text-zinc-200'}>{label}</div>
                <div className="text-[10px] text-zinc-600 group-hover:text-zinc-500 transition-colors">{desc}</div>
              </div>
              {active && <ChevronRight size={12} style={{ color: '#00b4c8' }} className="opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-zinc-900 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #00b4c8, #0088a8)' }}>
            J
          </div>
          <div>
            <div className="text-[11px] text-zinc-300 font-medium">Jimmy Ramian</div>
            <div className="text-[10px] text-zinc-600">Cepremium</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
