'use client'

import { useState, useEffect, useRef } from 'react'
import { Intervenant, FormulaireAssignation, Entretien, SyntheseIA, Transcription, ENTITE_COLORS } from '@/types'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate, formatDateTime } from '@/lib/utils'
import { X, Link2, CheckCircle2, Sparkles, Copy, Send, ChevronDown, Clock, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRole } from '@/components/providers/RoleProvider'

interface Props {
  intervenant: Intervenant
  assignation?: FormulaireAssignation
  entretien?: Entretien
  synthese?: SyntheseIA
  transcription?: Transcription
  formulairesDisponibles: { id: string; nom: string; type: string }[]
  onClose: () => void
  onUpdate: () => void
}

type TabId = 'formulaire' | 'entretien' | 'transcription' | 'synthese'

export function FicheIntervenant({ intervenant, assignation, entretien, synthese, transcription, formulairesDisponibles, onClose, onUpdate }: Props) {
  const [tab, setTab] = useState<TabId>('formulaire')
  const [loading, setLoading] = useState<string | null>(null)
  const [localEntretien, setLocalEntretien] = useState(entretien)
  const [localSynthese, setLocalSynthese] = useState(synthese)
  const [localTranscription, setLocalTranscription] = useState(transcription)
  const [localAssignation, setLocalAssignation] = useState(assignation)
  const [notes, setNotes] = useState(entretien?.notes || '')
  const [transcriptionText, setTranscriptionText] = useState(transcription?.contenu || '')
  const [showFormPicker, setShowFormPicker] = useState(false)
  const [copied, setCopied] = useState(false)
  const notesTimer = useRef<NodeJS.Timeout | undefined>(undefined)
  const supabase = createClient()
  const { isReadOnly } = useRole()

  const i = intervenant

  // Autosave notes
  useEffect(() => {
    if (!localEntretien) return
    clearTimeout(notesTimer.current)
    notesTimer.current = setTimeout(async () => {
      await supabase.from('entretiens').update({ notes }).eq('id', localEntretien.id)
    }, 1500)
    return () => clearTimeout(notesTimer.current)
  }, [notes])

  const getFormUrl = (token: string) =>
    `${window.location.origin}/f/${token}?nom=${encodeURIComponent(i.prenom + ' ' + i.nom)}`

  const copyLink = async () => {
    if (!localAssignation?.token) {
      setShowFormPicker(true)
      return
    }
    await navigator.clipboard.writeText(getFormUrl(localAssignation.token))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const assignerFormulaire = async (formulaireId: string) => {
    setShowFormPicker(false)
    setLoading('assigner')
    // Upsert assignation
    const { data, error } = await supabase
      .from('formulaire_assignation')
      .upsert(
        { formulaire_id: formulaireId, intervenant_id: i.id, statut: 'envoyé', date_envoi: new Date().toISOString() },
        { onConflict: 'formulaire_id,intervenant_id' }
      )
      .select()
      .single()
    if (data) {
      setLocalAssignation(data)
      await navigator.clipboard.writeText(getFormUrl(data.token))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      onUpdate()
    }
    setLoading(null)
  }

  const markAsRealise = async () => {
    if (!localEntretien) {
      // Create entretien
      const { data } = await supabase.from('entretiens')
        .insert({ intervenant_id: i.id, statut: 'Réalisé', notes })
        .select().single()
      if (data) setLocalEntretien(data)
    } else {
      await supabase.from('entretiens').update({ statut: 'Réalisé' }).eq('id', localEntretien.id)
      setLocalEntretien({ ...localEntretien, statut: 'Réalisé' })
    }
    await supabase.from('intervenants').update({ statut_entretien: 'Réalisé' }).eq('id', i.id)
    onUpdate()
  }

  const updateDateEntretien = async (date: string) => {
    if (!localEntretien) {
      const { data } = await supabase.from('entretiens')
        .insert({ intervenant_id: i.id, date_prevue: date, statut: 'Planifié', notes })
        .select().single()
      if (data) setLocalEntretien(data)
      await supabase.from('intervenants').update({ statut_entretien: 'Planifié', date_entretien: date }).eq('id', i.id)
    } else {
      await supabase.from('entretiens').update({ date_prevue: date, statut: 'Planifié' }).eq('id', localEntretien.id)
      setLocalEntretien({ ...localEntretien, date_prevue: date, statut: 'Planifié' })
      await supabase.from('intervenants').update({ statut_entretien: 'Planifié', date_entretien: date }).eq('id', i.id)
    }
    onUpdate()
  }

  const toggleTheme = async (themeId: string) => {
    if (!localEntretien) return
    const updated = (localEntretien.themes || []).map((t: any) =>
      t.id === themeId ? { ...t, checked: !t.checked } : t
    )
    await supabase.from('entretiens').update({ themes: updated }).eq('id', localEntretien.id)
    setLocalEntretien({ ...localEntretien, themes: updated })
  }

  const generateResumeFormulaire = async () => {
    setLoading('resume')
    try {
      const res = await fetch('/api/ai/resume-formulaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervenant_id: i.id, assignation_id: localAssignation?.id }),
      })
      const data = await res.json()
      setLocalSynthese(data.synthese)
    } catch (e) { console.error(e) }
    setLoading(null)
  }

  const generateQuestions = async () => {
    setLoading('questions')
    try {
      const res = await fetch('/api/ai/questions-entretien', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervenant_id: i.id, assignation_id: localAssignation?.id }),
      })
      const data = await res.json()
      setLocalSynthese(data.synthese)
    } catch (e) { console.error(e) }
    setLoading(null)
  }

  const analyseTranscription = async () => {
    setLoading('analyse')
    try {
      const res = await fetch('/api/ai/analyse-transcription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervenant_id: i.id, contenu: transcriptionText }),
      })
      const data = await res.json()
      setLocalTranscription(data.transcription)
    } catch (e) { console.error(e) }
    setLoading(null)
  }

  const generateSynthese = async () => {
    setLoading('synthese')
    try {
      const res = await fetch('/api/ai/synthese-finale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervenant_id: i.id }),
      })
      const data = await res.json()
      setLocalSynthese(data.synthese)
    } catch (e) { console.error(e) }
    setLoading(null)
  }

  const saveTranscription = async () => {
    const { data } = await supabase
      .from('transcriptions')
      .upsert({ intervenant_id: i.id, contenu: transcriptionText, source: 'collage' }, { onConflict: 'intervenant_id' })
      .select().single()
    if (data) setLocalTranscription(data)
  }

  const defaultThemes = [
    { id: 'taches', libelle: 'Tâches quotidiennes & organisation', checked: false },
    { id: 'outils', libelle: 'Outils utilisés & maîtrise', checked: false },
    { id: 'frictions', libelle: 'Frictions & irritants', checked: false },
    { id: 'communication', libelle: 'Communication interne / externe', checked: false },
    { id: 'donnees', libelle: 'Gestion des données & reporting', checked: false },
    { id: 'ia', libelle: 'Vision & posture vis-à-vis de l\'IA', checked: false },
  ]
  const themes = localEntretien?.themes?.length ? localEntretien.themes : defaultThemes

  const tabs: { id: TabId; label: string }[] = [
    { id: 'formulaire', label: 'Formulaire' },
    { id: 'entretien', label: 'Entretien' },
    { id: 'transcription', label: 'Transcription' },
    { id: 'synthese', label: 'Synthèse' },
  ]

  return (
    <div className="fixed inset-0 lg:left-auto lg:right-0 lg:top-14 lg:bottom-0 lg:w-[58%] top-0 left-0 right-0 bottom-0 bg-zinc-950 border-l border-zinc-800 flex flex-col z-50 lg:z-20 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-800 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar prenom={i.prenom} nom={i.nom} entite={i.entite} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-zinc-100">{i.prenom} {i.nom}</h2>
              <Badge variant={i.priorite === 'Critique' ? 'danger' : i.priorite === 'Haute' ? 'warning' : 'success'}>
                {i.priorite}
              </Badge>
            </div>
            <div className="text-sm text-zinc-400">{i.poste}</div>
            <div className="text-xs mt-0.5" style={{ color: ENTITE_COLORS[i.entite] }}>{i.entite} · {i.duree_entretien} min</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Bouton formulaire — crée l'assignation si besoin */}
          <div className="relative">
            {localAssignation?.token ? (
              <Button variant="ghost" size="sm" onClick={copyLink}>
                {copied ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
                {copied ? 'Copié !' : 'Copier le lien'}
              </Button>
            ) : !isReadOnly ? (
              <Button
                variant="outline"
                size="sm"
                loading={loading === 'assigner'}
                onClick={() => setShowFormPicker(v => !v)}
              >
                <Link2 size={13} />
                Assigner un formulaire
                <ChevronDown size={11} />
              </Button>
            ) : (
              <span className="text-xs text-zinc-600 flex items-center gap-1"><Eye size={11} /> Non assigné</span>
            )}
            {showFormPicker && (
              <div className="absolute right-0 top-full mt-1 w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="px-3 py-2 border-b border-zinc-800 text-xs font-medium text-zinc-400">
                  Choisir un formulaire à assigner
                </div>
                {formulairesDisponibles.length === 0 ? (
                  <div className="px-3 py-4 text-xs text-zinc-500 text-center">
                    Aucun formulaire publié.<br />Créez-en un dans la section Formulaires.
                  </div>
                ) : (
                  formulairesDisponibles.map(f => (
                    <button
                      key={f.id}
                      onClick={() => assignerFormulaire(f.id)}
                      className="w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-sm text-zinc-100 group-hover:text-white">{f.nom}</div>
                        <div className="text-[11px] text-zinc-500">{f.type}</div>
                      </div>
                      <Send size={12} className="text-zinc-600 group-hover:text-amber-400 transition-colors" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          {!isReadOnly && <Button variant="primary" size="sm" onClick={markAsRealise}><CheckCircle2 size={13} /> Marquer réalisé</Button>}
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-300 transition-colors ml-1">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 px-6">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm transition-colors border-b-2 -mb-px ${tab === t.id ? 'border-amber-500 text-amber-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">

        {/* ONGLET FORMULAIRE — affichage des réponses */}
        {tab === 'formulaire' && (
          <div className="space-y-4">
            {!localAssignation ? (
              /* Pas encore de formulaire assigné */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-3">
                  <Link2 size={20} className="text-zinc-600" />
                </div>
                <div className="text-zinc-400 text-sm font-medium mb-1">Formulaire non assigné</div>
                <div className="text-zinc-600 text-xs">Assigne un formulaire via le bouton en haut à droite pour générer le lien.</div>
              </div>
            ) : localAssignation.statut !== 'reçu' ? (
              /* Formulaire envoyé, en attente */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
                  <Send size={18} className="text-blue-400" />
                </div>
                <Badge variant="info" className="mb-2">Envoyé le {formatDate(localAssignation.date_envoi)}</Badge>
                <div className="text-zinc-500 text-sm">En attente de réponse de l&apos;intervenant</div>
                <Button variant="outline" size="sm" className="mt-4" onClick={copyLink}>
                  <Copy size={13} /> Copier le lien à relancer
                </Button>
              </div>
            ) : (
              /* Réponses reçues */
              <div className="space-y-4">
                {/* Bandeau statut + résumé IA */}
                <div className="flex items-center justify-between">
                  <Badge variant="success">Reçu le {formatDate(localAssignation.date_reception)}</Badge>
                  {!localSynthese?.resume_formulaire && (
                    <Button variant="outline" size="sm" loading={loading === 'resume'} disabled={isReadOnly} onClick={generateResumeFormulaire}>
                      <Sparkles size={13} /> Résumé IA
                    </Button>
                  )}
                </div>

                {localSynthese?.resume_formulaire && (
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={13} className="text-amber-400" />
                      <span className="text-xs font-semibold text-amber-400">Résumé IA</span>
                    </div>
                    <ul className="space-y-1.5">
                      {localSynthese.resume_formulaire.points.map((p, idx) => (
                        <li key={idx} className="text-sm text-zinc-300 flex gap-2">
                          <span className="text-amber-500 mt-0.5 flex-shrink-0">·</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Réponses structurées par section */}
                {(localAssignation as any).reponses?.length > 0 && (() => {
                  const reponses: any[] = (localAssignation as any).reponses
                  const form: any = (localAssignation as any).formulaire
                  const sections: any[] = form?.sections || []

                  return sections.map((s: any) => {
                    const sReponses = reponses.filter((r: any) => r.section_id === s.id)
                    if (!sReponses.length) return null
                    return (
                      <div key={s.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                        <div className="px-4 py-2.5 bg-zinc-800/60 border-b border-zinc-800">
                          <span className="text-xs font-semibold text-zinc-300">{s.titre}</span>
                        </div>
                        <div className="divide-y divide-zinc-800/60">
                          {s.questions.map((q: any) => {
                            const r = sReponses.find((r: any) => r.question_id === q.id)
                            if (!r || r.reponse === null) return null
                            return (
                              <div key={q.id} className="px-4 py-3">
                                <div className="text-[11px] text-zinc-500 mb-1.5">{q.libelle}</div>
                                <ReponseDisplay reponse={r.reponse} type={q.type} colonnes={q.colonnes} outils_fixes={q.outils_fixes} />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            )}
          </div>
        )}

        {/* ONGLET ENTRETIEN */}
        {tab === 'entretien' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">Date & heure</label>
                <input
                  type="datetime-local"
                  defaultValue={localEntretien?.date_prevue ? localEntretien.date_prevue.slice(0, 16) : ''}
                  onChange={e => updateDateEntretien(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500/50 w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">Durée réelle (min)</label>
                <input
                  type="number"
                  defaultValue={localEntretien?.duree_reelle || ''}
                  onBlur={async e => {
                    if (localEntretien) {
                      await supabase.from('entretiens').update({ duree_reelle: parseInt(e.target.value) }).eq('id', localEntretien.id)
                    }
                  }}
                  className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500/50 w-full"
                  placeholder={String(i.duree_entretien)}
                />
              </div>
            </div>

            {/* Thèmes */}
            <div>
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Thèmes à couvrir</div>
              <div className="space-y-2">
                {themes.map((t: any) => (
                  <label key={t.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={t.checked}
                      onChange={() => toggleTheme(t.id)}
                      className="w-4 h-4 rounded border-zinc-600 accent-amber-500"
                    />
                    <span className={`text-sm ${t.checked ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>{t.libelle}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Questions IA — actif seulement si réponses reçues */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Questions personnalisées IA</div>
                {localAssignation?.statut === 'reçu' && !localSynthese?.questions_generees && (
                  <Button variant="outline" size="sm" loading={loading === 'questions'} disabled={isReadOnly} onClick={generateQuestions}>
                    <Sparkles size={13} /> Générer
                  </Button>
                )}
              </div>
              {localAssignation?.statut !== 'reçu' ? (
                <div className="flex items-center gap-2 p-3 bg-zinc-800/50 rounded-lg border border-zinc-800">
                  <Clock size={13} className="text-zinc-600 flex-shrink-0" />
                  <span className="text-xs text-zinc-600">Disponible une fois le formulaire reçu.</span>
                </div>
              ) : localSynthese?.questions_generees ? (
                <div className="space-y-2">
                  {localSynthese.questions_generees.questions.map((q, idx) => (
                    <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 flex gap-2">
                      <span className="text-amber-500 font-medium flex-shrink-0">{idx + 1}.</span> {q}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-zinc-500 italic">Cliquez sur &quot;Générer&quot; pour obtenir des questions personnalisées basées sur les réponses.</div>
              )}
            </div>

            {/* Notes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Mes notes d&apos;entretien</div>
                <span className="text-[10px] text-zinc-600">Autosauvegarde</span>
              </div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Prends tes notes ici pendant l'entretien..."
                rows={10}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none font-mono"
              />
            </div>
          </div>
        )}

        {/* ONGLET TRANSCRIPTION */}
        {tab === 'transcription' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 h-[calc(100vh-320px)]">
              {/* Panneau gauche */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Transcription</div>
                  <Button variant="outline" size="sm" onClick={saveTranscription} disabled={isReadOnly}>Sauvegarder</Button>
                </div>
                <textarea
                  value={transcriptionText}
                  onChange={e => setTranscriptionText(e.target.value)}
                  placeholder="Collez ici la transcription de l'entretien..."
                  className="flex-1 w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none font-mono leading-relaxed"
                />
                {transcriptionText && (
                  <Button variant="primary" loading={loading === 'analyse'} disabled={isReadOnly} onClick={analyseTranscription}>
                    <Sparkles size={13} /> Analyser avec l&apos;IA
                  </Button>
                )}
              </div>

              {/* Panneau droit */}
              <div className="flex flex-col gap-3">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Analyse IA</div>
                {localTranscription?.analyse_ia ? (
                  <div className="flex-1 overflow-y-auto space-y-3">
                    <AnalyseSection titre="Résumé" items={localTranscription.analyse_ia.resume} />
                    <AnalyseSection titre="Outils mentionnés" items={localTranscription.analyse_ia.outils} />
                    <AnalyseSection titre="Frictions identifiées" items={localTranscription.analyse_ia.frictions} />
                    <AnalyseSection titre="Cas d'usage IA" items={localTranscription.analyse_ia.cas_usage_ia} />
                    <AnalyseSection titre="Questions sans réponse" items={localTranscription.analyse_ia.questions_sans_reponse} />
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                      <div className="text-xs font-semibold text-zinc-500 mb-1">Maturité digitale</div>
                      <Badge variant={localTranscription.analyse_ia.maturite_digitale === 'Élevé' ? 'success' : localTranscription.analyse_ia.maturite_digitale === 'Moyen' ? 'warning' : 'danger'}>
                        {localTranscription.analyse_ia.maturite_digitale}
                      </Badge>
                      <div className="text-xs text-zinc-400 mt-2">{localTranscription.analyse_ia.maturite_justification}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-600 text-sm">
                    L'analyse apparaîtra ici
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ONGLET SYNTHESE */}
        {tab === 'synthese' && (
          <div className="space-y-4">
            {!localTranscription?.contenu ? (
              <div className="text-center py-12 text-zinc-500 text-sm">
                La synthèse nécessite au minimum une transcription chargée.
              </div>
            ) : !localSynthese?.synthese_finale ? (
              <div className="text-center py-12 space-y-3">
                <div className="text-zinc-400 text-sm">Prêt à générer la synthèse complète</div>
                <Button variant="primary" loading={loading === 'synthese'} disabled={isReadOnly} onClick={generateSynthese}>
                  <Sparkles size={14} /> Générer la synthèse IA
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-400" />
                    <span className="text-sm font-semibold text-amber-400">Synthèse IA complète</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={generateSynthese} loading={loading === 'synthese'} disabled={isReadOnly}>Régénérer</Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <SyntheseBlock titre="Profil digital" content={localSynthese.synthese_finale.profil_digital} />
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="text-xs font-semibold text-zinc-500 mb-2">Posture IA</div>
                    <Badge variant={localSynthese.synthese_finale.posture_ia === 'enthousiaste' ? 'success' : localSynthese.synthese_finale.posture_ia === 'neutre' ? 'warning' : 'danger'}>
                      {localSynthese.synthese_finale.posture_ia}
                    </Badge>
                  </div>
                </div>

                <SyntheseListBlock titre="Douleurs principales" items={localSynthese.synthese_finale.douleurs} />
                <SyntheseListBlock titre="Outils clés" items={localSynthese.synthese_finale.outils_cles} />
                <SyntheseListBlock titre="Recommandations IA" items={localSynthese.synthese_finale.recommandations} />
                <SyntheseBlock titre="Cas d'usage prioritaire" content={localSynthese.synthese_finale.cas_usage_prioritaire} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function AnalyseSection({ titre, items }: { titre: string; items: string[] }) {
  if (!items?.length) return null
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
      <div className="text-xs font-semibold text-zinc-500 mb-2">{titre}</div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-zinc-300 flex gap-1.5"><span className="text-amber-500">·</span>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function SyntheseBlock({ titre, content }: { titre: string; content: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="text-xs font-semibold text-zinc-500 mb-2">{titre}</div>
      <p className="text-sm text-zinc-300">{content}</p>
    </div>
  )
}

function SyntheseListBlock({ titre, items }: { titre: string; items: string[] }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="text-xs font-semibold text-zinc-500 mb-2">{titre}</div>
      <ul className="space-y-1.5">
        {items?.map((item, i) => (
          <li key={i} className="text-sm text-zinc-300 flex gap-2"><span className="text-amber-500 mt-0.5">·</span>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function ReponseDisplay({ reponse, type, colonnes, outils_fixes }: {
  reponse: unknown
  type: string
  colonnes?: string[]
  outils_fixes?: string[]
}) {
  if (reponse === null || reponse === undefined) return <span className="text-xs text-zinc-600 italic">—</span>

  // Tableau (Section B — tâches)
  if (type === 'tableau' && typeof reponse === 'object' && colonnes) {
    const rows = reponse as Record<number, Record<string, string>>
    const filledRows = Object.entries(rows).filter(([, cells]) =>
      Object.values(cells).some(v => v?.trim())
    )
    if (!filledRows.length) return <span className="text-xs text-zinc-600 italic">Aucune tâche renseignée</span>
    return (
      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-800/50">
              {colonnes.map(c => <th key={c} className="px-3 py-2 text-left text-zinc-400 font-medium whitespace-nowrap">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {filledRows.map(([ri, cells]) => (
              <tr key={ri} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                {colonnes.map(c => (
                  <td key={c} className="px-3 py-2 text-zinc-300">{cells[c] || '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // Tableau outils (Section C)
  if (type === 'tableau_outils' && typeof reponse === 'object' && colonnes) {
    const rows = reponse as Record<number, Record<string, string>>
    const allTools = [...(outils_fixes || []), 'Autre', 'Autre']
    return (
      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-800/50">
              {colonnes.map(c => <th key={c} className="px-3 py-2 text-left text-zinc-400 font-medium whitespace-nowrap">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {allTools.map((tool, ri) => {
              const cells = rows[ri] || {}
              const hasData = Object.values(cells).some(v => v?.trim())
              if (!hasData && ri >= (outils_fixes?.length || 0)) return null
              return (
                <tr key={ri} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-3 py-2 text-zinc-400 font-medium">{cells[colonnes[0]] || tool}</td>
                  {colonnes.slice(1).map(c => (
                    <td key={c} className="px-3 py-2 text-zinc-300">{cells[c] || '—'}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  // Texte simple
  if (typeof reponse === 'string') {
    return <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{reponse}</p>
  }

  // Nombre (échelle)
  if (typeof reponse === 'number') {
    return (
      <div className="flex items-center gap-1.5">
        {[1,2,3,4,5].map(n => (
          <div key={n} className={`w-7 h-7 rounded-md text-xs font-bold flex items-center justify-center ${n === reponse ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-600'}`}>{n}</div>
        ))}
        <span className="text-xs text-zinc-500 ml-1">{reponse}/5</span>
      </div>
    )
  }

  return <span className="text-sm text-zinc-300">{JSON.stringify(reponse)}</span>
}
