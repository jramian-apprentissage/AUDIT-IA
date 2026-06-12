import { createClient } from '@/lib/supabase/server'
import { AuditClient } from '@/components/audit/AuditClient'

export default async function AuditPage() {
  const supabase = await createClient()

  const [
    { data: intervenants },
    { data: assignations },
    { data: entretiens },
    { data: syntheses },
    { data: transcriptions },
    { data: formulaires },
  ] = await Promise.all([
    supabase.from('intervenants').select('*').order('semaine').order('nom'),
    supabase.from('formulaire_assignation').select('*, formulaire:formulaires(*), reponses:formulaire_reponses(*)'),
    supabase.from('entretiens').select('*'),
    supabase.from('syntheses_ia').select('*'),
    supabase.from('transcriptions').select('*'),
    supabase.from('formulaires').select('id, nom, type').eq('statut', 'publié'),
  ])

  return (
    <AuditClient
      intervenants={intervenants || []}
      assignations={assignations || []}
      entretiens={entretiens || []}
      syntheses={syntheses || []}
      transcriptions={transcriptions || []}
      formulaires={formulaires || []}
    />
  )
}
