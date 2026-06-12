import { createServiceClient } from '@/lib/supabase/server'
import { PublicFormClient } from '@/components/formulaires/PublicFormClient'
import { notFound } from 'next/navigation'

export default async function PublicFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ nom?: string }>
}) {
  const { token } = await params
  const { nom } = await searchParams

  const supabase = createServiceClient()

  const [{ data: assignation }, { data: intervenants }] = await Promise.all([
    supabase
      .from('formulaire_assignation')
      .select('*, formulaire:formulaires(*), intervenant:intervenants(*)')
      .eq('token', token)
      .single(),
    supabase
      .from('intervenants')
      .select('id, prenom, nom, entite')
      .order('semaine').order('nom'),
  ])

  if (!assignation) return notFound()
  if (assignation.statut === 'reçu') {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md shadow-sm">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-black text-sm">HR</span>
          </div>
          <div className="text-xl font-bold text-zinc-800 mb-2">Formulaire déjà complété</div>
          <div className="text-zinc-500 text-sm">Merci pour vos réponses. Ce formulaire a déjà été soumis.</div>
        </div>
      </div>
    )
  }

  return (
    <PublicFormClient
      assignation={assignation}
      formulaire={assignation.formulaire}
      intervenant={assignation.intervenant}
      intervenants={intervenants || []}
    />
  )
}
