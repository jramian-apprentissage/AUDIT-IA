'use client'

import { useState } from 'react'
import { Formulaire, Section, Question } from '@/types'
import { CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react'

interface Intervenant { id: string; prenom: string; nom: string; entite: string }

interface Props {
  assignation: { id: string; token: string }
  formulaire: Formulaire
  intervenant: Intervenant | null
  intervenants: Intervenant[]
}

export function PublicFormClient({ assignation, formulaire, intervenant, intervenants }: Props) {
  const [reponses, setReponses] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {}
    if (intervenant) {
      init['nom_prenom'] = `${intervenant.prenom} ${intervenant.nom}`
      init['entite'] = intervenant.entite
    }
    return init
  })
  const [tableData, setTableData] = useState<Record<string, Record<number, Record<string, string>>>>({})
  const [currentSection, setCurrentSection] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const sections = formulaire.sections
  const section = sections[currentSection]
  const isFirst = currentSection === 0
  const isLast = currentSection === sections.length - 1

  const setReponse = (qid: string, value: unknown) =>
    setReponses(prev => ({ ...prev, [qid]: value }))

  const setTableCell = (qid: string, row: number, col: string, value: string) => {
    setTableData(prev => {
      const updated = {
        ...prev,
        [qid]: { ...(prev[qid] || {}), [row]: { ...(prev[qid]?.[row] || {}), [col]: value } }
      }
      setReponses(r => ({ ...r, [qid]: updated[qid] }))
      return updated
    })
  }

  const validateSection = (s: Section) => {
    const errs: string[] = []
    s.questions.forEach(q => {
      if (q.obligatoire && !reponses[q.id]) errs.push(q.libelle)
    })
    return errs
  }

  const goNext = () => {
    const errs = validateSection(section)
    if (errs.length) { setErrors(errs); return }
    setErrors([])
    setCurrentSection(i => i + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goPrev = () => {
    setErrors([])
    setCurrentSection(i => i - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    const errs = validateSection(section)
    if (errs.length) { setErrors(errs); return }
    setSubmitting(true)

    const reponsesArray = sections.flatMap(s =>
      s.questions.map(q => ({
        assignation_id: assignation.id,
        question_id: q.id,
        section_id: s.id,
        reponse: reponses[q.id] ?? null,
      }))
    )

    const res = await fetch('/api/form/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignation_id: assignation.id, reponses: reponsesArray }),
    })

    if (res.ok) setSubmitted(true)
    else alert('Erreur lors de la soumission. Veuillez réessayer.')
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-amber-50/30 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 text-center max-w-md shadow-xl shadow-zinc-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-800 mb-3">Merci !</h2>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Vos réponses ont bien été enregistrées. L'équipe Cepremium vous contactera prochainement pour planifier votre entretien.
          </p>
          <div className="mt-8 pt-6 border-t border-zinc-100 text-xs text-zinc-400">
            Mission Audit Lean IT — HOMERESINE · Cepremium
          </div>
        </div>
      </div>
    )
  }

  const progress = ((currentSection) / sections.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-amber-50/20">
      {/* Header fixe */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-zinc-100">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">HR</span>
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-800 leading-none">HOMERESINE</div>
              <div className="text-[10px] text-zinc-400 leading-none mt-0.5">Audit Lean IT · Cepremium</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">{currentSection + 1} / {sections.length}</span>
            <div className="w-32 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${progress + (100 / sections.length)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation sections */}
      <div className="max-w-2xl mx-auto px-6 pt-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {sections.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => { if (idx < currentSection) { setErrors([]); setCurrentSection(idx) } }}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-all ${
                idx === currentSection
                  ? 'bg-amber-500 text-white font-semibold'
                  : idx < currentSection
                  ? 'bg-amber-100 text-amber-700 cursor-pointer hover:bg-amber-200'
                  : 'bg-zinc-100 text-zinc-400 cursor-default'
              }`}
            >
              {s.titre.replace(/Section [A-E] — /, '')}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu section */}
      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl shadow-sm shadow-zinc-100 overflow-hidden">
          {/* Section header */}
          <div className="px-8 py-5 border-b border-zinc-50">
            <div className="text-[10px] font-semibold text-amber-500 uppercase tracking-widest mb-1">
              {section.titre.match(/Section [A-E]/)?.[0]}
            </div>
            <h2 className="text-lg font-bold text-zinc-800">
              {section.titre.replace(/Section [A-E] — /, '')}
            </h2>
          </div>

          {/* Questions */}
          <div className="px-8 py-6 space-y-8">
            {section.questions.map((q, qi) => (
              <div key={q.id}>
                <label className="block mb-2">
                  <span className="text-sm font-semibold text-zinc-700">{q.libelle}</span>
                  {q.obligatoire && <span className="text-amber-500 ml-1">*</span>}
                  {q.description && (
                    <span className="block text-xs text-zinc-400 mt-0.5 font-normal">{q.description}</span>
                  )}
                </label>
                <QuestionInput
                  q={q}
                  value={reponses[q.id]}
                  onChange={v => setReponse(q.id, v)}
                  tableData={tableData[q.id]}
                  onTableChange={(row, col, v) => setTableCell(q.id, row, col, v)}
                  intervenants={intervenants}
                  lockedIntervenantNom={intervenant ? `${intervenant.prenom} ${intervenant.nom}` : undefined}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Erreurs */}
        {errors.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            Merci de compléter les champs obligatoires :<br />
            <ul className="mt-1 list-disc list-inside">
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}

        {/* Navigation bas */}
        <div className="flex items-center justify-between mt-6 pb-10">
          {!isFirst ? (
            <button
              onClick={goPrev}
              className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
            >
              <ChevronLeft size={16} /> Précédent
            </button>
          ) : <div />}

          {!isLast ? (
            <button
              onClick={goNext}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
            >
              Suivant <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {submitting ? 'Envoi…' : <><CheckCircle2 size={15} /> Envoyer mes réponses</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function QuestionInput({ q, value, onChange, tableData, onTableChange, intervenants, lockedIntervenantNom }: {
  q: Question
  value: unknown
  onChange: (v: unknown) => void
  tableData?: Record<number, Record<string, string>>
  onTableChange: (row: number, col: string, v: string) => void
  intervenants: Intervenant[]
  lockedIntervenantNom?: string
}) {
  const base = 'w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-zinc-50 transition-all'

  // Dropdown intervenant pré-sélectionné et verrouillé
  if (q.type === 'intervenant_select') {
    return (
      <div className="relative">
        <select
          value={(value as string) || ''}
          disabled={!!lockedIntervenantNom}
          className={`${base} appearance-none pr-8 ${lockedIntervenantNom ? 'text-zinc-500 bg-zinc-50 cursor-not-allowed' : ''}`}
        >
          <option value="">— Sélectionnez votre nom —</option>
          {intervenants.map(i => (
            <option key={i.id} value={`${i.prenom} ${i.nom}`}>
              {i.prenom} {i.nom} ({i.entite})
            </option>
          ))}
        </select>
        {lockedIntervenantNom && (
          <div className="mt-1 text-xs text-zinc-400 flex items-center gap-1">
            <CheckCircle2 size={11} className="text-emerald-500" /> Pré-rempli depuis votre lien personnel
          </div>
        )}
      </div>
    )
  }

  if (q.type === 'texte_court') {
    return (
      <input
        type="text"
        value={(value as string) || ''}
        onChange={e => onChange(e.target.value)}
        className={base}
        placeholder="Votre réponse…"
      />
    )
  }

  if (q.type === 'texte_long') {
    return (
      <textarea
        value={(value as string) || ''}
        onChange={e => onChange(e.target.value)}
        rows={4}
        className={`${base} resize-none leading-relaxed`}
        placeholder="Votre réponse…"
      />
    )
  }

  if (q.type === 'select') {
    return (
      <div className="space-y-2">
        {(q.options || []).map(opt => (
          <label key={opt} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${value === opt ? 'border-amber-400 bg-amber-50' : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50'}`}>
            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${value === opt ? 'border-amber-500 bg-amber-500' : 'border-zinc-300'}`}>
              {value === opt && <div className="w-full h-full rounded-full bg-white scale-[0.4] transform" />}
            </div>
            <span className="text-sm text-zinc-700">{opt}</span>
          </label>
        ))}
        {/* Hidden input to set value */}
        {(q.options || []).map(opt => (
          <input key={opt} type="radio" name={q.id} value={opt} checked={value === opt}
            onChange={() => onChange(opt)} className="sr-only" />
        ))}
      </div>
    )
  }

  if (q.type === 'echelle') {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n} type="button" onClick={() => onChange(n)}
            className={`w-12 h-12 rounded-xl border-2 text-sm font-bold transition-all ${
              value === n ? 'border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-200' : 'border-zinc-200 text-zinc-400 hover:border-amber-300 bg-zinc-50'
            }`}
          >
            {n}
          </button>
        ))}
        <span className="self-center ml-2 text-xs text-zinc-400">
          {value ? `${value}/5 sélectionné` : '1 = débutant · 5 = expert'}
        </span>
      </div>
    )
  }

  // Section B — Tableau des tâches
  if (q.type === 'tableau') {
    const cols = q.colonnes || []
    const ph = q.placeholder_colonnes || []
    const rows = q.lignes || 7

    return (
      <div className="overflow-x-auto rounded-xl border border-zinc-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              {cols.map((c, ci) => (
                <th key={c} className="px-3 py-2.5 text-left text-xs font-semibold text-zinc-500 whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                {cols.map((c, ci) => (
                  <td key={c} className="border-b border-zinc-100 p-0">
                    <input
                      type="text"
                      value={tableData?.[ri]?.[c] || ''}
                      onChange={e => onTableChange(ri, c, e.target.value)}
                      placeholder={ph[ci] || ''}
                      className="w-full px-3 py-2.5 text-xs text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:bg-amber-50 bg-transparent transition-colors min-w-[100px]"
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

  // Section C — Tableau outils avec lignes pré-remplies
  if (q.type === 'tableau_outils') {
    const cols = q.colonnes || []
    const outilsFixes = q.outils_fixes || []
    const ligresLibres = q.lignes_libres || 2
    const totalRows = outilsFixes.length + ligresLibres

    return (
      <div className="overflow-x-auto rounded-xl border border-zinc-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              {cols.map(c => (
                <th key={c} className="px-3 py-2.5 text-left text-xs font-semibold text-zinc-500 whitespace-nowrap">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {outilsFixes.map((outil, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                <td className="border-b border-zinc-100 px-3 py-2.5">
                  <span className="text-xs font-medium text-zinc-600">{outil}</span>
                </td>
                {cols.slice(1).map(c => (
                  <td key={c} className="border-b border-zinc-100 p-0">
                    {c === 'Satisfaction (1-5)' ? (
                      <div className="flex gap-1 px-2 py-1">
                        {[1,2,3,4,5].map(n => (
                          <button key={n} type="button"
                            onClick={() => onTableChange(ri, c, String(n))}
                            className={`w-6 h-6 rounded text-[10px] font-bold transition-all border ${
                              tableData?.[ri]?.[c] === String(n)
                                ? 'border-amber-500 bg-amber-500 text-white'
                                : 'border-zinc-200 text-zinc-400 hover:border-amber-300'
                            }`}
                          >{n}</button>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={tableData?.[ri]?.[c] || ''}
                        onChange={e => onTableChange(ri, c, e.target.value)}
                        placeholder={c === 'Fréquence' ? 'Quotidien…' : 'Décrire…'}
                        className="w-full px-3 py-2.5 text-xs text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:bg-amber-50 bg-transparent transition-colors min-w-[100px]"
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {/* Lignes libres */}
            {Array.from({ length: ligresLibres }).map((_, idx) => {
              const ri = outilsFixes.length + idx
              return (
                <tr key={`libre-${idx}`} className={ri % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                  {cols.map((c, ci) => (
                    <td key={c} className="border-b border-zinc-100 p-0">
                      <input
                        type="text"
                        value={tableData?.[ri]?.[c] || ''}
                        onChange={e => onTableChange(ri, c, e.target.value)}
                        placeholder={ci === 0 ? 'Autre outil…' : c === 'Satisfaction (1-5)' ? '1-5' : ''}
                        className="w-full px-3 py-2.5 text-xs text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:bg-amber-50 bg-transparent transition-colors min-w-[100px]"
                      />
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  return null
}
