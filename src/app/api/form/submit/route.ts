import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { assignation_id, reponses } = await req.json()
  const supabase = createServiceClient()

  // Insérer les réponses
  if (reponses?.length) {
    await supabase.from('formulaire_reponses').insert(reponses)
  }

  // Mettre à jour le statut de l'assignation
  await supabase
    .from('formulaire_assignation')
    .update({ statut: 'reçu', date_reception: new Date().toISOString() })
    .eq('id', assignation_id)

  return NextResponse.json({ ok: true })
}
