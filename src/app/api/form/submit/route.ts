import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabase } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { assignation_id, reponses } = await req.json()
  // Utilise la clé anon — RLS est désactivé sur toutes les tables
  const supabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

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
