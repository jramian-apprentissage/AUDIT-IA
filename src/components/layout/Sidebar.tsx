'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, ClipboardList, FileText } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/audit', label: 'Audit', icon: ClipboardList },
  { href: '/formulaires', label: 'Formulaires', icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-zinc-950 border-r border-zinc-800 flex flex-col z-40">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <span className="text-black font-black text-xs">HR</span>
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-100 tracking-wide">HOMERESINE</div>
            <div className="text-[10px] text-zinc-500">Audit Platform</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                active
                  ? 'bg-amber-500/15 text-amber-400 font-medium'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              )}
            >
              <Icon size={16} className={active ? 'text-amber-400' : ''} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-zinc-800">
        <div className="text-[10px] text-zinc-600">Mathieu GROSS</div>
        <div className="text-[10px] text-zinc-700 mt-0.5">Homeresine</div>
      </div>
    </aside>
  )
}
