import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { intervenant_id } = await req.json()
  const supabase = createServiceClient()

  const [
    { data: intervenant },
    { data: synthese },
    { data: transcription },
    { data: entretien },
  ] = await Promise.all([
    supabase.from('intervenants').select('*').eq('id', intervenant_id).single(),
    supabase.from('syntheses_ia').select('*').eq('intervenant_id', intervenant_id).single(),
    supabase.from('transcriptions').select('*').eq('intervenant_id', intervenant_id).single(),
    supabase.from('entretiens').select('*').eq('intervenant_id', intervenant_id).single(),
  ])

  const context = `
INTERVENANT : ${intervenant?.prenom} ${intervenant?.nom}, ${intervenant?.poste} (${intervenant?.entite})
PRIORITÉ : ${intervenant?.priorite}

RÉSUMÉ FORMULAIRE : ${JSON.stringify(synthese?.resume_formulaire?.points || [])}

ANALYSE TRANSCRIPTION : ${JSON.stringify(transcription?.analyse_ia || {})}

NOTES D'ENTRETIEN : ${entretien?.notes || 'Aucune note'}
`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `Tu es consultant Lean IT senior. Génère une synthèse finale complète pour cet intervenant de la mission HOMERESINE (Groupe Gross, installation de résine).

${context}

Format JSON :
{
  "profil_digital": "Description du profil digital en 2-3 phrases",
  "douleurs": ["douleur 1", "douleur 2", "douleur 3"],
  "outils_cles": ["outil 1", "outil 2"],
  "posture_ia": "réticent|neutre|enthousiaste",
  "recommandations": ["recommandation IA 1", "recommandation IA 2", "recommandation IA 3"],
  "cas_usage_prioritaire": "Description du cas d'usage IA prioritaire pour ce profil en 2-3 phrases"
}

Base-toi uniquement sur les données fournies. Sois actionnable et précis.`
    }]
  })

  const content = message.content[0].type === 'text' ? message.content[0].text : ''
  const match = content.match(/\{[\s\S]*\}/)
  const parsed = match ? JSON.parse(match[0]) : {}

  const { data: updatedSynthese } = await supabase
    .from('syntheses_ia')
    .upsert({
      intervenant_id,
      synthese_finale: parsed,
      synthese_finale_at: new Date().toISOString(),
    }, { onConflict: 'intervenant_id' })
    .select().single()

  return NextResponse.json({ synthese: updatedSynthese })
}
