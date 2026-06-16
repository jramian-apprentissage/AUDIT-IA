import { Sidebar, MobileNav } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import { RoleProvider } from '@/components/providers/RoleProvider'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: mission } = await supabase.from('mission').select('*').single()

  return (
    <RoleProvider>
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <Sidebar />
        <Header mission={mission} />
        <main className="lg:ml-56 pt-14 min-h-screen pb-20 lg:pb-0">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
        <MobileNav />
      </div>
    </RoleProvider>
  )
}
