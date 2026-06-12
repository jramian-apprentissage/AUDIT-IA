import { createClient } from '@/lib/supabase/server'
import { FormulairesClient } from '@/components/formulaires/FormulairesClient'

export default async function FormulairesPage() {
  const supabase = await createClient()
  const [{ data: formulaires }, { data: assignations }, { data: intervenants }] = await Promise.all([
    supabase.from('formulaires').select('*').order('created_at', { ascending: false }),
    supabase.from('formulaire_assignation').select('*, intervenant:intervenants(prenom, nom)'),
    supabase.from('intervenants').select('id, prenom, nom, entite'),
  ])

  return (
    <FormulairesClient
      formulaires={formulaires || []}
      assignations={assignations || []}
      intervenants={intervenants || []}
    />
  )
}
