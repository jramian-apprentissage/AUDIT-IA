'use client'

import { useState } from 'react'
import { Formulaire, Section, Question } from '@/types'
import { CheckCircle2 } from 'lucide-react'

interface Props {
  assignation: { id: string; token: string }
  formulaire: Formulaire
  intervenantNom: string
}

export function PublicFormClient({ assignation, formulaire, intervenantNom }: Props) {
  const [reponses, setReponses] = useState<Record<string, unknown>>({})
  const [tableData, setTableData] = useState<Record<string, Record<number, Record<string, string>>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const setReponse = (qid: string, value: unknown) => setReponses(prev => ({ ...prev, [qid]: value }))

  const setTableCell = (qid: string, row: number, col: string, value: string) => {
    setTableData(prev => ({
      ...prev,
      [qid]: { ...(prev[qid] || {}), [row]: { ...(prev[qid]?.[row] || {}), [col]: value } }
    }))
    setReponses(prev => ({ ...prev, [qid]: tableData[qid] }))
  }

  const validate = () => {
    const errs: string[] = []
    formulaire.sections.forEach(s => {
      s.questions.forEach(q => {
        if (q.obligatoire && !reponses[q.id]) {
          errs.push(q.libelle)
        }
      })
    })
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (errs.length > 0) { setErrors(errs); return }
    setSubmitting(true)

    // Construire les réponses
    const reponsesArray: { assignation_id: string; question_id: string; section_id: string; reponse: unknown }[] = []
    formulaire.sections.forEach(s => {
      s.questions.forEach(q => {
        reponsesArray.push({
          assignation_id: assignation.id,
          question_id: q.id,
          section_id: s.id,
          reponse: reponses[q.id] ?? null,
        })
      })
    })

    const res = await fetch('/api/form/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignation_id: assignation.id, reponses: reponsesArray }),
    })

    if (res.ok) {
      setSubmitted(true)
    } else {
      alert('Erreur lors de la soumission. Veuillez réessayer.')
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-zinc-800 mb-2">Merci !</div>
          <div className="text-zinc-500 text-sm">Vos réponses ont bien été enregistrées. L'équipe Cepremium vous contactera pour planifier votre entretien.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-black text-sm">HR</span>
          </div>
          <div className="text-2xl font-bold text-zinc-800">{formulaire.nom}</div>
          <div className="text-zinc-500 text-sm mt-1">Pour : {intervenantNom}</div>
          {formulaire.description && (
            <div className="text-zinc-600 text-sm mt-3 bg-amber-50 border border-amber-100 rounded-xl p-4 text-left">{formulaire.description}</div>
          )}
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {formulaire.sections.map(s => (
            <div key={s.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-amber-500 text-white">
                <div className="text-sm font-semibold uppercase tracking-wide">{s.titre}</div>
              </div>
              <div className="p-6 space-y-5">
                {s.questions.map(q => (
                  <div key={q.id}>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      {q.libelle} {q.obligatoire && <span className="text-red-400">*</span>}
                    </label>
                    {q.description && <div className="text-xs text-zinc-500 mb-2">{q.description}</div>}
                    <QuestionInput q={q} value={reponses[q.id]} onChange={v => setReponse(q.id, v)} tableData={tableData[q.id]} onTableChange={(row, col, v) => setTableCell(q.id, row, col, v)} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {errors.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            Veuillez compléter les champs obligatoires : {errors.join(', ')}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-6 w-full bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl py-4 text-base transition-colors disabled:opacity-50"
        >
          {submitting ? 'Envoi en cours...' : 'Envoyer mes réponses'}
        </button>

        <div className="text-center mt-4 text-xs text-zinc-400">Audit Lean IT — HOMERESINE · Cepremium</div>
      </div>
    </div>
  )
}

function QuestionInput({ q, value, onChange, tableData, onTableChange }: {
  q: Question
  value: unknown
  onChange: (v: unknown) => void
  tableData?: Record<number, Record<string, string>>
  onTableChange: (row: number, col: string, v: string) => void
}) {
  const baseClass = 'w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400'

  if (q.type === 'texte_court') {
    return <input type="text" value={(value as string) || ''} onChange={e => onChange(e.target.value)} className={baseClass} />
  }
  if (q.type === 'texte_long') {
    return <textarea value={(value as string) || ''} onChange={e => onChange(e.target.value)} rows={4} className={`${baseClass} resize-none`} />
  }
  if (q.type === 'date') {
    return <input type="date" value={(value as string) || ''} onChange={e => onChange(e.target.value)} className={baseClass} />
  }
  if (q.type === 'echelle') {
    return (
      <div className="flex gap-3">
        {[1,2,3,4,5].map(n => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className={`w-10 h-10 rounded-full border-2 text-sm font-semibold transition-all ${value === n ? 'border-amber-500 bg-amber-500 text-white' : 'border-zinc-300 text-zinc-500 hover:border-amber-400'}`}>
            {n}
          </button>
        ))}
      </div>
    )
  }
  if (q.type === 'select') {
    return (
      <div className="space-y-2">
        {(q.options || []).map(o => (
          <label key={o} className="flex items-center gap-2.5 cursor-pointer group">
            <input type="radio" name={q.id} value={o} checked={value === o} onChange={() => onChange(o)} className="accent-amber-500 w-4 h-4" />
            <span className="text-sm text-zinc-700">{o}</span>
          </label>
        ))}
      </div>
    )
  }
  if (q.type === 'multi_select') {
    const selected = (value as string[]) || []
    return (
      <div className="space-y-2">
        {(q.options || []).map(o => (
          <label key={o} className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(o)}
              onChange={e => onChange(e.target.checked ? [...selected, o] : selected.filter(x => x !== o))}
              className="accent-amber-500 w-4 h-4"
            />
            <span className="text-sm text-zinc-700">{o}</span>
          </label>
        ))}
      </div>
    )
  }
  if (q.type === 'tableau') {
    const cols = q.colonnes || ['Colonne 1', 'Colonne 2']
    const rows = 5
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>{cols.map(c => <th key={c} className="border border-zinc-200 px-3 py-2 bg-zinc-50 text-left text-xs font-semibold text-zinc-600">{c}</th>)}</tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, ri) => (
              <tr key={ri}>
                {cols.map(c => (
                  <td key={c} className="border border-zinc-200 p-0">
                    <input
                      type="text"
                      value={tableData?.[ri]?.[c] || ''}
                      onChange={e => onTableChange(ri, c, e.target.value)}
                      className="w-full px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:bg-amber-50"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  return null
}
