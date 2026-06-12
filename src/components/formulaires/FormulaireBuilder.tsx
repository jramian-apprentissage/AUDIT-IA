'use client'

import { useState, useCallback } from 'react'
import { Formulaire, Section, Question } from '@/types'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, GripVertical, ChevronDown, ChevronRight, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const TYPES_FORMULAIRE = ['Direction', 'Commercial', 'Admin général', 'SAV', 'Terrain', 'Marketing', 'Phoning', 'TC Terrain']
const TYPES_QUESTION = [
  { value: 'texte_court', label: 'Texte court' },
  { value: 'texte_long', label: 'Texte long' },
  { value: 'tableau', label: 'Tableau' },
  { value: 'select', label: 'Choix unique' },
  { value: 'multi_select', label: 'Choix multiple' },
  { value: 'echelle', label: 'Échelle 1-5' },
  { value: 'date', label: 'Date' },
]

const DEFAULT_SECTIONS: Section[] = [
  { id: 'identification', titre: 'Identification', questions: [
    { id: 'nom_prenom', libelle: 'Nom et prénom', type: 'texte_court', obligatoire: true },
    { id: 'poste', libelle: 'Poste occupé', type: 'texte_court', obligatoire: true },
    { id: 'anciennete', libelle: 'Ancienneté dans l\'entreprise', type: 'texte_court', obligatoire: false },
  ]},
  { id: 'taches', titre: 'Tâches & Organisation', questions: [
    { id: 'taches_quotidiennes', libelle: 'Décrivez vos principales tâches quotidiennes', type: 'texte_long', obligatoire: true },
    { id: 'temps_taches', libelle: 'Répartition du temps par tâche', type: 'tableau', obligatoire: false, colonnes: ['Tâche', 'Fréquence', 'Temps estimé', 'Outil utilisé'] },
  ]},
  { id: 'outils', titre: 'Outils utilisés', questions: [
    { id: 'outils_liste', libelle: 'Quels outils numériques utilisez-vous au quotidien ?', type: 'texte_long', obligatoire: true },
    { id: 'maitrise', libelle: 'Comment évaluez-vous votre maîtrise de ces outils ?', type: 'echelle', obligatoire: true },
  ]},
  { id: 'frictions', titre: 'Frictions & Irritants', questions: [
    { id: 'frictions_principales', libelle: 'Quelles sont vos principales frustrations dans votre travail ?', type: 'texte_long', obligatoire: true },
    { id: 'temps_perdu', libelle: 'Où perdez-vous le plus de temps ?', type: 'texte_long', obligatoire: false },
  ]},
  { id: 'ia', titre: 'Vision IA', questions: [
    { id: 'connaissance_ia', libelle: 'Utilisez-vous déjà des outils d\'intelligence artificielle ?', type: 'select', obligatoire: true, options: ['Oui, régulièrement', 'Oui, occasionnellement', 'Non, mais ça m\'intéresse', 'Non, et je ne suis pas à l\'aise avec ça'] },
    { id: 'cas_usage_ia', libelle: 'Si l\'IA pouvait vous aider dans une tâche, laquelle serait-ce ?', type: 'texte_long', obligatoire: false },
  ]},
]

interface Props {
  formulaire?: Formulaire | null
  intervenants: { id: string; prenom: string; nom: string; entite: string }[]
  onSave: () => void
  onCancel: () => void
}

function uid() { return Math.random().toString(36).slice(2, 9) }

export function FormulaireBuilder({ formulaire, intervenants, onSave, onCancel }: Props) {
  const [nom, setNom] = useState(formulaire?.nom || '')
  const [type, setType] = useState(formulaire?.type || 'Direction')
  const [description, setDescription] = useState(formulaire?.description || '')
  const [sections, setSections] = useState<Section[]>(formulaire?.sections || DEFAULT_SECTIONS)
  const [saving, setSaving] = useState(false)
  const [previewNom, setPreviewNom] = useState('Mathieu GROSS')
  const supabase = createClient()

  const addSection = () => {
    setSections(prev => [...prev, { id: uid(), titre: 'Nouvelle section', questions: [] }])
  }

  const removeSection = (sId: string) => setSections(prev => prev.filter(s => s.id !== sId))

  const updateSection = (sId: string, titre: string) => {
    setSections(prev => prev.map(s => s.id === sId ? { ...s, titre } : s))
  }

  const addQuestion = (sId: string) => {
    const q: Question = { id: uid(), libelle: 'Nouvelle question', type: 'texte_court', obligatoire: false }
    setSections(prev => prev.map(s => s.id === sId ? { ...s, questions: [...s.questions, q] } : s))
  }

  const removeQuestion = (sId: string, qId: string) => {
    setSections(prev => prev.map(s => s.id === sId ? { ...s, questions: s.questions.filter(q => q.id !== qId) } : s))
  }

  const updateQuestion = (sId: string, qId: string, changes: Partial<Question>) => {
    setSections(prev => prev.map(s => s.id === sId ? {
      ...s,
      questions: s.questions.map(q => q.id === qId ? { ...q, ...changes } : q)
    } : s))
  }

  const save = async (statut: 'brouillon' | 'publié') => {
    setSaving(true)
    if (formulaire) {
      await supabase.from('formulaires').update({ nom, type, description, sections, statut, updated_at: new Date().toISOString() }).eq('id', formulaire.id)
    } else {
      await supabase.from('formulaires').insert({ nom, type, description, sections, statut })
    }
    setSaving(false)
    onSave()
  }

  return (
    <div className="flex gap-0 h-[calc(100vh-120px)]">
      {/* Constructeur */}
      <div className="flex-1 overflow-y-auto pr-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onCancel} className="text-zinc-500 hover:text-zinc-300 transition-colors">← Retour</button>
            <h1 className="text-lg font-semibold text-zinc-100">{formulaire ? 'Éditer' : 'Créer'} un formulaire</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => save('brouillon')} loading={saving}>Sauvegarder brouillon</Button>
            <Button variant="primary" onClick={() => save('publié')} loading={saving}>Publier</Button>
          </div>
        </div>

        {/* Infos générales */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-4 space-y-4">
          <Input label="Nom du formulaire" value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex : Formulaire Direction" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none">
                {TYPES_FORMULAIRE.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <Textarea label="Description / Introduction" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Texte d'introduction visible par l'intervenant..." />
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {sections.map((s, sIdx) => (
            <div key={s.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-zinc-800/50 border-b border-zinc-800">
                <GripVertical size={14} className="text-zinc-600" />
                <input
                  value={s.titre}
                  onChange={e => updateSection(s.id, e.target.value)}
                  className="flex-1 bg-transparent text-sm font-semibold text-zinc-100 focus:outline-none"
                />
                <button onClick={() => removeSection(s.id)} className="p-1 hover:bg-zinc-700 rounded text-zinc-600 hover:text-red-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="p-4 space-y-2">
                {s.questions.map(q => (
                  <div key={q.id} className="flex items-start gap-2 bg-zinc-800/50 rounded-lg p-3">
                    <GripVertical size={13} className="text-zinc-600 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <input
                        value={q.libelle}
                        onChange={e => updateQuestion(s.id, q.id, { libelle: e.target.value })}
                        className="w-full bg-transparent text-sm text-zinc-100 focus:outline-none"
                        placeholder="Libellé de la question"
                      />
                      <div className="flex items-center gap-2">
                        <select
                          value={q.type}
                          onChange={e => updateQuestion(s.id, q.id, { type: e.target.value as Question['type'] })}
                          className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none"
                        >
                          {TYPES_QUESTION.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <label className="flex items-center gap-1 text-xs text-zinc-500 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={q.obligatoire}
                            onChange={e => updateQuestion(s.id, q.id, { obligatoire: e.target.checked })}
                            className="accent-amber-500"
                          />
                          Obligatoire
                        </label>
                        {(q.type === 'select' || q.type === 'multi_select') && (
                          <input
                            value={q.options?.join(', ') || ''}
                            onChange={e => updateQuestion(s.id, q.id, { options: e.target.value.split(',').map(x => x.trim()) })}
                            className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none"
                            placeholder="Options séparées par des virgules"
                          />
                        )}
                        {q.type === 'tableau' && (
                          <input
                            value={q.colonnes?.join(', ') || ''}
                            onChange={e => updateQuestion(s.id, q.id, { colonnes: e.target.value.split(',').map(x => x.trim()) })}
                            className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none"
                            placeholder="Colonnes: Tâche, Fréquence, Temps..."
                          />
                        )}
                      </div>
                    </div>
                    <button onClick={() => removeQuestion(s.id, q.id)} className="p-1 hover:bg-zinc-700 rounded text-zinc-600 hover:text-red-400 transition-colors flex-shrink-0">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addQuestion(s.id)}
                  className="w-full py-2 text-xs text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Plus size={12} /> Ajouter une question
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addSection}
            className="w-full py-3 text-sm text-zinc-600 hover:text-zinc-400 border border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={14} /> Ajouter une section
          </button>
        </div>
      </div>

      {/* Prévisualisation */}
      <div className="w-[400px] flex-shrink-0 border-l border-zinc-800 overflow-y-auto">
        <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 px-5 py-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Prévisualisation</span>
          <input
            value={previewNom}
            onChange={e => setPreviewNom(e.target.value)}
            className="text-xs bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-300 focus:outline-none w-40"
            placeholder="Nom de l'intervenant"
          />
        </div>
        <div className="p-5">
          <FormPreview nom={nom} description={description} sections={sections} intervenantNom={previewNom} />
        </div>
      </div>
    </div>
  )
}

function FormPreview({ nom, description, sections, intervenantNom }: {
  nom: string; description: string; sections: Section[]; intervenantNom: string
}) {
  return (
    <div className="bg-white rounded-xl p-5 text-zinc-800 text-sm space-y-5">
      <div className="text-center border-b border-zinc-200 pb-4">
        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center mx-auto mb-2">
          <span className="text-white font-black text-xs">HR</span>
        </div>
        <div className="font-bold text-base">{nom || 'Nom du formulaire'}</div>
        {intervenantNom && <div className="text-zinc-500 text-xs mt-1">Pour : {intervenantNom}</div>}
        {description && <div className="text-zinc-600 text-xs mt-2">{description}</div>}
      </div>
      {sections.map(s => (
        <div key={s.id}>
          <div className="font-semibold text-amber-600 text-xs uppercase tracking-wide mb-3">{s.titre}</div>
          <div className="space-y-3">
            {s.questions.map(q => (
              <div key={q.id}>
                <div className="text-xs font-medium text-zinc-700 mb-1">
                  {q.libelle} {q.obligatoire && <span className="text-red-400">*</span>}
                </div>
                {q.type === 'texte_court' && <div className="border border-zinc-300 rounded px-2 py-1.5 text-xs text-zinc-400 bg-zinc-50">Réponse courte...</div>}
                {q.type === 'texte_long' && <div className="border border-zinc-300 rounded px-2 py-2 text-xs text-zinc-400 bg-zinc-50 h-14">Réponse longue...</div>}
                {q.type === 'echelle' && (
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(n => <div key={n} className="w-7 h-7 rounded-full border border-zinc-300 flex items-center justify-center text-xs text-zinc-500">{n}</div>)}
                  </div>
                )}
                {(q.type === 'select' || q.type === 'multi_select') && (
                  <div className="space-y-1">
                    {(q.options || []).slice(0, 3).map(o => (
                      <div key={o} className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <div className="w-3 h-3 rounded-full border border-zinc-300" />
                        {o}
                      </div>
                    ))}
                  </div>
                )}
                {q.type === 'tableau' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border border-zinc-200 rounded">
                      <thead><tr>{(q.colonnes || ['Col 1', 'Col 2']).map(c => <th key={c} className="border border-zinc-200 px-2 py-1 bg-zinc-50 text-zinc-600">{c}</th>)}</tr></thead>
                      <tbody><tr>{(q.colonnes || ['', '']).map((_, i) => <td key={i} className="border border-zinc-200 px-2 py-1 h-6" />)}</tr></tbody>
                    </table>
                  </div>
                )}
                {q.type === 'date' && <div className="border border-zinc-300 rounded px-2 py-1.5 text-xs text-zinc-400 bg-zinc-50">jj/mm/aaaa</div>}
              </div>
            ))}
          </div>
        </div>
      ))}
      <button className="w-full bg-amber-500 text-white rounded-lg py-2 text-sm font-semibold">Envoyer mes réponses</button>
    </div>
  )
}
