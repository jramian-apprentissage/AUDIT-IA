import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { intervenant_id, assignation_id } = await req.json()
  const supabase = createServiceClient()

  const { data: intervenant } = await supabase.from('intervenants').select('*').eq('id', intervenant_id).single()
  const { data: reponses } = await supabase.from('formulaire_reponses').select('*').eq('assignation_id', assignation_id)
  const { data: synthese } = await supabase.from('syntheses_ia').select('resume_formulaire').eq('intervenant_id', intervenant_id).single()

  const reponsesText = reponses?.map((r: { question_id: string; reponse: unknown }) => `${r.question_id}: ${JSON.stringify(r.reponse)}`).join('\n') || ''
  const resumeText = synthese?.resume_formulaire?.points?.join('\n') || ''

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Tu es consultant IT spécialisé Lean IT. Prépare 6-8 questions d'entretien personnalisées pour ${intervenant?.prenom} ${intervenant?.nom}, ${intervenant?.poste} chez ${intervenant?.entite}.

RÉSUMÉ FORMULAIRE : ${resumeText}
RÉPONSES BRUTES : ${reponsesText}

Génère des questions ouvertes, contextualisées et pertinentes pour approfondir les frictions, outils et posture IA de cet intervenant.
Format JSON : {"questions": ["question 1", "question 2", ...]}

Les questions doivent être en français, directement utilisables en entretien visio.`
    }]
  })

  const content = message.content[0].type === 'text' ? message.content[0].text : ''
  const match = content.match(/\{[\s\S]*\}/)
  const parsed = match ? JSON.parse(match[0]) : { questions: [content] }

  const { data: updatedSynthese } = await supabase
    .from('syntheses_ia')
    .upsert({
      intervenant_id,
      questions_generees: parsed,
      questions_generees_at: new Date().toISOString(),
    }, { onConflict: 'intervenant_id' })
    .select().single()

  return NextResponse.json({ synthese: updatedSynthese })
}
