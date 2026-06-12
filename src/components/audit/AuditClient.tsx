'use client'

import { useState, useCallback } from 'react'
import { Intervenant, FormulaireAssignation, Entretien, SyntheseIA, Transcription, ENTITE_COLORS, PRIORITE_COLORS } from '@/types'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FicheIntervenant } from './FicheIntervenant'
import { formatDate, isDatePassed } from '@/lib/utils'
import { Search, ChevronDown, Link2, SlidersHorizontal } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  intervenants: Intervenant[]
  assignations: FormulaireAssignation[]
  entretiens: Entretien[]
  syntheses: SyntheseIA[]
  transcriptions: Transcription[]
}

export function AuditClient({ intervenants, assignations, entretiens, syntheses, transcriptions }: Props) {
  const [search, setSearch] = useState('')
  const [filterEntite, setFilterEntite] = useState('')
  const [filterStatutForm, setFilterStatutForm] = useState('')
  const [filterStatutEntretien, setFilterStatutEntretien] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [localIntervenants, setLocalIntervenants] = useState(intervenants)
  const [localEntretiens, setLocalEntretiens] = useState(entretiens)
  const [localAssignations, setLocalAssignations] = useState(assignations)

  const supabase = createClient()

  const getAssignation = (id: string) => localAssignations.find(a => a.intervenant_id === id)
  const getEntretien = (id: string) => localEntretiens.find(e => e.intervenant_id === id)

  const getStatutEntretien = (i: Intervenant): 'À planifier' | 'Planifié' | 'Réalisé' | 'En retard' => {
    const e = getEntretien(i.id)
    if (!e) return 'À planifier'
    if (e.statut === 'Réalisé') return 'Réalisé'
    if (e.statut === 'Planifié') {
      if (e.date_prevue && isDatePassed(e.date_prevue)) return 'En retard'
      return 'Planifié'
    }
    return 'À planifier'
  }

  const filtered = localIntervenants.filter(i => {
    const q = search.toLowerCase()
    const matchSearch = !q || `${i.prenom} ${i.nom} ${i.poste} ${i.entite}`.toLowerCase().includes(q)
    const matchEntite = !filterEntite || i.entite === filterEntite
    const a = getAssignation(i.id)
    const matchForm = !filterStatutForm || (a?.statut || 'non_envoyé') === filterStatutForm
    const statut = getStatutEntretien(i)
    const matchEntretien = !filterStatutEntretien || statut === filterStatutEntretien
    return matchSearch && matchEntite && matchForm && matchEntretien
  })

  const copyFormLink = async (i: Intervenant) => {
    const a = getAssignation(i.id)
    if (!a?.token) return
    const url = `${window.location.origin}/f/${a.token}?nom=${encodeURIComponent(i.prenom + ' ' + i.nom)}`
    await navigator.clipboard.writeText(url)
    alert('Lien copié !')
  }

  const selected = selectedId ? localIntervenants.find(i => i.id === selectedId) || null : null

  const handleUpdate = useCallback(() => {
    // Refresh data
    Promise.all([
      supabase.from('intervenants').select('*').order('semaine').order('nom'),
      supabase.from('entretiens').select('*'),
      supabase.from('formulaire_assignation').select('*, formulaire:formulaires(*), reponses:formulaire_reponses(*)'),
    ]).then(([{ data: i }, { data: e }, { data: a }]) => {
      if (i) setLocalIntervenants(i)
      if (e) setLocalEntretiens(e)
      if (a) setLocalAssignations(a)
    })
  }, [supabase])

  return (
    <div className="flex gap-0 relative">
      {/* Table */}
      <div className={`transition-all duration-300 ${selectedId ? 'w-[42%]' : 'w-full'}`}>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-zinc-100">Intervenants <span className="text-zinc-500 text-sm font-normal">({filtered.length})</span></h1>
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
          </div>
          <select value={filterEntite} onChange={e => setFilterEntite(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 focus:outline-none">
            <option value="">Toutes entités</option>
            {['Distri Résine', 'Home Résine', 'Résilux', 'HR Construction'].map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <select value={filterStatutForm} onChange={e => setFilterStatutForm(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 focus:outline-none">
            <option value="">Tous formulaires</option>
            <option value="non_envoyé">Non envoyé</option>
            <option value="envoyé">Envoyé</option>
            <option value="reçu">Reçu</option>
          </select>
          <select value={filterStatutEntretien} onChange={e => setFilterStatutEntretien(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 focus:outline-none">
            <option value="">Tous entretiens</option>
            <option value="À planifier">À planifier</option>
            <option value="Planifié">Planifié</option>
            <option value="Réalisé">Réalisé</option>
            <option value="En retard">En retard</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 w-8"></th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Nom</th>
                {!selectedId && <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Entité</th>}
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Priorité</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Formulaire</th>
                {!selectedId && <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Entretien</th>}
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Statut</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(i => {
                const a = getAssignation(i.id)
                const e = getEntretien(i.id)
                const statut = getStatutEntretien(i)
                const isSelected = selectedId === i.id

                return (
                  <tr
                    key={i.id}
                    onClick={() => setSelectedId(isSelected ? null : i.id)}
                    className={`border-b border-zinc-800/50 cursor-pointer transition-colors ${isSelected ? 'bg-amber-500/5' : 'hover:bg-zinc-800/50'}`}
                  >
                    <td className="px-4 py-3">
                      <Avatar prenom={i.prenom} nom={i.nom} entite={i.entite} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-100">{i.prenom} {i.nom}</div>
                      <div className="text-xs text-zinc-500 truncate max-w-[120px]">{i.poste}</div>
                    </td>
                    {!selectedId && (
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: ENTITE_COLORS[i.entite] }}>{i.entite}</span>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <Badge variant={i.priorite === 'Critique' ? 'danger' : i.priorite === 'Haute' ? 'warning' : 'success'}>
                        {i.priorite}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={a?.statut === 'reçu' ? 'success' : a?.statut === 'envoyé' ? 'info' : 'ghost'}>
                        {a?.statut === 'reçu' ? 'Reçu' : a?.statut === 'envoyé' ? 'Envoyé' : 'Non envoyé'}
                      </Badge>
                    </td>
                    {!selectedId && (
                      <td className="px-4 py-3 text-xs text-zinc-400">
                        {e?.date_prevue ? formatDate(e.date_prevue) : '—'}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <Badge variant={statut === 'Réalisé' ? 'success' : statut === 'En retard' ? 'danger' : statut === 'Planifié' ? 'info' : 'ghost'}>
                        {statut}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={ev => { ev.stopPropagation(); copyFormLink(i) }}
                          className="p-1.5 hover:bg-zinc-700 rounded text-zinc-500 hover:text-zinc-300 transition-colors"
                          title="Copier lien formulaire"
                        >
                          <Link2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fiche slide-over */}
      {selected && (
        <FicheIntervenant
          intervenant={selected}
          assignation={getAssignation(selected.id)}
          entretien={getEntretien(selected.id)}
          synthese={syntheses.find(s => s.intervenant_id === selected.id)}
          transcription={transcriptions.find(t => t.intervenant_id === selected.id)}
          onClose={() => setSelectedId(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}
