import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { data: mission },
    { data: intervenants },
    { data: assignations },
    { data: entretiens },
  ] = await Promise.all([
    supabase.from('mission').select('*').single(),
    supabase.from('intervenants').select('*').order('semaine'),
    supabase.from('formulaire_assignation').select('*, intervenant:intervenants(*), formulaire:formulaires(nom)'),
    supabase.from('entretiens').select('*'),
  ])

  return (
    <DashboardClient
      mission={mission}
      intervenants={intervenants || []}
      assignations={assignations || []}
      entretiens={entretiens || []}
    />
  )
}
