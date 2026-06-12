import { cn } from '@/lib/utils'
import { getInitiales } from '@/lib/utils'
import { ENTITE_COLORS } from '@/types'

interface AvatarProps {
  prenom: string
  nom: string
  entite: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
}

export function Avatar({ prenom, nom, entite, size = 'md', className }: AvatarProps) {
  const color = ENTITE_COLORS[entite] || '#6B7280'
  return (
    <div
      className={cn('rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0', sizeClasses[size], className)}
      style={{ backgroundColor: color + '33', border: `1.5px solid ${color}66`, color }}
    >
      {getInitiales(prenom, nom)}
    </div>
  )
}
