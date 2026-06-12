import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { intervenant_id, assignation_id } = await req.json()
  const supabase = createServiceClient()

  // Récupérer les données
  const { data: intervenant } = await supabase.from('intervenants').select('*').eq('id', intervenant_id).single()
  const { data: reponses } = await supabase.from('formulaire_reponses').select('*').eq('assignation_id', assignation_id)

  const reponsesText = reponses?.map((r: { question_id: string; reponse: unknown }) => `Q: ${r.question_id}\nR: ${JSON.stringify(r.reponse)}`).join('\n\n') || 'Aucune réponse disponible'

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Tu es assistant d'audit IT pour HOMERESINE. Voici le profil et les réponses au formulaire de ${intervenant?.prenom} ${intervenant?.nom}, ${intervenant?.poste} chez ${intervenant?.entite}.

RÉPONSES AU FORMULAIRE :
${reponsesText}

Génère un résumé structuré en 4-5 points clés sur cet intervenant. Format JSON :
{"points": ["point 1", "point 2", "point 3", "point 4", "point 5"]}

Sois concis, factuel, et axé sur les informations utiles pour préparer l'entretien.`
    }]
  })

  const content = message.content[0].type === 'text' ? message.content[0].text : ''
  const match = content.match(/\{[\s\S]*\}/)
  const parsed = match ? JSON.parse(match[0]) : { points: [content] }

  // Sauvegarder en base
  const { data: synthese } = await supabase
    .from('syntheses_ia')
    .upsert({
      intervenant_id,
      resume_formulaire: parsed,
      resume_formulaire_at: new Date().toISOString(),
    }, { onConflict: 'intervenant_id' })
    .select().single()

  return NextResponse.json({ synthese })
}
