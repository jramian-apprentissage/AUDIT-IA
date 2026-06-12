'use client'

import { useState } from 'react'
import { Formulaire, FormulaireAssignation } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Plus, Eye, Edit, Copy, Archive, Link2, ExternalLink } from 'lucide-react'
import { FormulaireBuilder } from './FormulaireBuilder'
import { createClient } from '@/lib/supabase/client'

interface Props {
  formulaires: Formulaire[]
  assignations: FormulaireAssignation[]
  intervenants: { id: string; prenom: string; nom: string; entite: string }[]
}

export function FormulairesClient({ formulaires: initial, assignations, intervenants }: Props) {
  const [formulaires, setFormulaires] = useState(initial)
  const [editing, setEditing] = useState<Formulaire | null>(null)
  const [creating, setCreating] = useState(false)
  const supabase = createClient()

  const refresh = async () => {
    const { data } = await supabase.from('formulaires').select('*').order('created_at', { ascending: false })
    if (data) setFormulaires(data)
  }

  const handleNew = () => {
    setEditing(null)
    setCreating(true)
  }

  const handleEdit = (f: Formulaire) => {
    setEditing(f)
    setCreating(true)
  }

  const handleDuplicate = async (f: Formulaire) => {
    const { data } = await supabase.from('formulaires').insert({
      nom: `${f.nom} (copie)`,
      type: f.type,
      description: f.description,
      sections: f.sections,
      statut: 'brouillon',
    }).select().single()
    if (data) setFormulaires(prev => [data, ...prev])
  }

  const handleArchive = async (f: Formulaire) => {
    await supabase.from('formulaires').update({ statut: 'archivé' }).eq('id', f.id)
    setFormulaires(prev => prev.map(x => x.id === f.id ? { ...x, statut: 'archivé' } : x))
  }

  const copyPublicLink = async (f: Formulaire) => {
    const url = `${window.location.origin}/f/form/${f.id}`
    await navigator.clipboard.writeText(url)
    alert('Lien copié !')
  }

  const getAssignCount = (fid: string) => assignations.filter(a => a.formulaire_id === fid).length

  if (creating) {
    return (
      <FormulaireBuilder
        formulaire={editing}
        intervenants={intervenants}
        onSave={async () => { await refresh(); setCreating(false) }}
        onCancel={() => setCreating(false)}
      />
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-zinc-100">Formulaires</h1>
        <Button variant="primary" onClick={handleNew}><Plus size={14} /> Créer un formulaire</Button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Nom</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Type</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Créé le</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Assignations</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Statut</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {formulaires.map(f => (
              <tr key={f.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-5 py-3">
                  <div className="font-medium text-zinc-100">{f.nom}</div>
                  {f.description && <div className="text-xs text-zinc-500 truncate max-w-xs">{f.description}</div>}
                </td>
                <td className="px-5 py-3">
                  <Badge variant="ghost">{f.type}</Badge>
                </td>
                <td className="px-5 py-3 text-zinc-400 text-xs">{formatDate(f.created_at)}</td>
                <td className="px-5 py-3 text-zinc-400 text-xs">{getAssignCount(f.id)} personne{getAssignCount(f.id) !== 1 ? 's' : ''}</td>
                <td className="px-5 py-3">
                  <Badge variant={f.statut === 'publié' ? 'success' : f.statut === 'archivé' ? 'ghost' : 'warning'}>
                    {f.statut}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <ActionBtn icon={<Edit size={13} />} label="Éditer" onClick={() => handleEdit(f)} />
                    <ActionBtn icon={<Copy size={13} />} label="Dupliquer" onClick={() => handleDuplicate(f)} />
                    {f.statut === 'publié' && (
                      <ActionBtn icon={<Link2 size={13} />} label="Copier lien" onClick={() => copyPublicLink(f)} />
                    )}
                    {f.statut !== 'archivé' && (
                      <ActionBtn icon={<Archive size={13} />} label="Archiver" onClick={() => handleArchive(f)} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {formulaires.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-zinc-500 text-sm">
                  Aucun formulaire — créez-en un pour commencer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ActionBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="p-1.5 hover:bg-zinc-700 rounded text-zinc-500 hover:text-zinc-300 transition-colors"
    >
      {icon}
    </button>
  )
}
