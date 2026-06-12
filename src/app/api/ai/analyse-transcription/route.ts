import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { intervenant_id, contenu } = await req.json()
  const supabase = createServiceClient()

  const { data: intervenant } = await supabase.from('intervenants').select('*').eq('id', intervenant_id).single()

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `Tu es consultant Lean IT. Analyse cette transcription d'entretien avec ${intervenant?.prenom} ${intervenant?.nom}, ${intervenant?.poste} chez ${intervenant?.entite} (groupe HOMERESINE, secteur résine).

TRANSCRIPTION :
${contenu}

Génère une analyse structurée au format JSON :
{
  "resume": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "outils": ["outil 1", "outil 2"],
  "frictions": ["friction 1", "friction 2"],
  "cas_usage_ia": ["cas 1", "cas 2"],
  "questions_sans_reponse": ["question 1"],
  "maturite_digitale": "Faible|Moyen|Élevé",
  "maturite_justification": "Justification en 1-2 phrases"
}

Sois précis et factuel. Extrais uniquement ce qui est clairement mentionné dans la transcription.`
    }]
  })

  const content = message.content[0].type === 'text' ? message.content[0].text : ''
  const match = content.match(/\{[\s\S]*\}/)
  const parsed = match ? JSON.parse(match[0]) : {}

  // Sauvegarder transcription + analyse
  const { data: transcription } = await supabase
    .from('transcriptions')
    .upsert({
      intervenant_id,
      contenu,
      source: 'collage',
      analyse_ia: parsed,
      analyse_generee_at: new Date().toISOString(),
    }, { onConflict: 'intervenant_id' })
    .select().single()

  return NextResponse.json({ transcription })
}
