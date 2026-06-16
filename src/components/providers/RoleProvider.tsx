'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Role = 'full' | 'readonly'

const RoleContext = createContext<{ role: Role; isReadOnly: boolean }>({ role: 'full', isReadOnly: false })

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('full')

  useEffect(() => {
    const match = document.cookie.match(/hr_role=([^;]+)/)
    if (match && match[1] === 'readonly') setRole('readonly')
  }, [])

  return (
    <RoleContext.Provider value={{ role, isReadOnly: role === 'readonly' }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  return useContext(RoleContext)
}
