'use client'

import { Mission, Intervenant, FormulaireAssignation, Entretien, ENTITE_COLORS } from '@/types'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, daysSince, isDatePassed } from '@/lib/utils'
import { AlertTriangle, CheckCircle2, Clock, Users, FileText, Calendar, TrendingUp, Bell } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { useRouter } from 'next/navigation'

interface Props {
  mission: Mission | null
  intervenants: Intervenant[]
  assignations: FormulaireAssignation[]
  entretiens: Entretien[]
}

const SEMAINES = [
  { num: 0, label: 'S0', desc: 'Envoi formulaires', color: '#6B7280' },
  { num: 1, label: 'S1', desc: 'Direction & Admin', color: '#3B82F6' },
  { num: 2, label: 'S2', desc: 'Commercial & SAV', color: '#8B5CF6' },
  { num: 3, label: 'S3', desc: 'Terrain & Marketing', color: '#F59E0B' },
  { num: 4, label: 'S4', desc: 'Synthèse & Rapport', color: '#10B981' },
]

export function DashboardClient({ mission, intervenants, assignations, entretiens }: Props) {
  const router = useRouter()
  const totalIntervenants = intervenants.length

  // KPIs
  const envoyes = assignations.filter(a => a.statut === 'envoyé' || a.statut === 'reçu').length
  const recus = assignations.filter(a => a.statut === 'reçu').length
  const planifies = entretiens.filter(e => e.statut === 'Planifié').length
  const realises = entretiens.filter(e => e.statut === 'Réalisé').length
  const totalPrevus = totalIntervenants

  // Semaine courante (basée sur la date de démarrage)
  const dateDemo = mission?.date_demarrage ? new Date(mission.date_demarrage) : new Date()
  const diffDays = Math.floor((new Date().getTime() - dateDemo.getTime()) / (1000 * 60 * 60 * 24))
  const currentSemaine = Math.min(4, Math.max(0, Math.floor(diffDays / 7)))

  // Taux de complétion global
  const completionRate = totalPrevus > 0 ? Math.round((realises / totalPrevus) * 100) : 0

  // Donut data
  const nonEnvoyes = totalIntervenants - assignations.length
  const donutData = [
    { name: 'Non envoyé', value: nonEnvoyes, color: '#52525B' },
    { name: 'Envoyé', value: envoyes - recus, color: '#3B82F6' },
    { name: 'Reçu', value: recus, color: '#10B981' },
    { name: 'Réalisé', value: realises, color: '#F59E0B' },
  ].filter(d => d.value > 0)

  // Bar data par entité
  const entites = ['Distri Résine', 'Home Résine', 'Résilux', 'HR Construction']
  const barData = entites.map(entite => {
    const total = intervenants.filter(i => i.entite === entite).length
    const ids = intervenants.filter(i => i.entite === entite).map(i => i.id)
    const done = entretiens.filter(e => ids.includes(e.intervenant_id) && e.statut === 'Réalisé').length
    return { entite: entite.split(' ')[0], total, done }
  })

  // Alertes
  const alertes: { type: 'warning' | 'info'; message: string; action: string; onClick: () => void }[] = []

  // Formulaires envoyés depuis +5 jours sans réponse
  const enRetard5j = assignations.filter(a => a.statut === 'envoyé' && a.date_envoi && daysSince(a.date_envoi) > 5)
  if (enRetard5j.length > 0) {
    alertes.push({
      type: 'warning',
      message: `${enRetard5j.length} formulaire${enRetard5j.length > 1 ? 's' : ''} envoyé${enRetard5j.length > 1 ? 's' : ''} il y a plus de 5 jours sans réponse`,
      action: 'Relancer',
      onClick: () => router.push('/formulaires'),
    })
  }

  // Entretiens planifiés sans formulaire reçu
  const entretiensSansFormulaire = entretiens.filter(e => {
    if (e.statut !== 'Planifié') return false
    const a = assignations.find(a => a.intervenant_id === e.intervenant_id)
    return !a || a.statut !== 'reçu'
  })
  if (entretiensSansFormulaire.length > 0) {
    alertes.push({
      type: 'info',
      message: `${entretiensSansFormulaire.length} entretien${entretiensSansFormulaire.length > 1 ? 's' : ''} planifié${entretiensSansFormulaire.length > 1 ? 's' : ''} sans formulaire reçu`,
      action: 'Voir',
      onClick: () => router.push('/audit'),
    })
  }

  // Entretien demain sans formulaire
  const demain = new Date()
  demain.setDate(demain.getDate() + 1)
  const entretienDemain = entretiens.find(e => {
    if (!e.date_prevue) return false
    const d = new Date(e.date_prevue)
    return d.toDateString() === demain.toDateString()
  })
  if (entretienDemain) {
    const intervenant = intervenants.find(i => i.id === entretienDemain.intervenant_id)
    const assignation = assignations.find(a => a.intervenant_id === entretienDemain.intervenant_id)
    if (intervenant && (!assignation || assignation.statut !== 'reçu')) {
      alertes.push({
        type: 'warning',
        message: `Entretien ${intervenant.prenom} ${intervenant.nom} prévu demain — formulaire non reçu`,
        action: 'Voir la fiche',
        onClick: () => router.push(`/audit?id=${intervenant.id}`),
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Bloc 1 — Carte identité */}
      <Card>
        <CardContent className="py-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                <span className="text-amber-400 font-black text-sm">HR</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-zinc-100">{mission?.nom_client || 'HOMERESINE'}</h1>
                  <span className="text-zinc-600 text-sm">{mission?.groupe}</span>
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">{mission?.secteur}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-right">
              <div>
                <div className="text-xs text-zinc-500">Gérant</div>
                <div className="text-sm text-zinc-300">{mission?.gerant}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Effectif</div>
                <div className="text-sm text-zinc-300">~{mission?.effectif_estime} pers.</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Phase</div>
                <div className="text-sm text-zinc-300">{mission?.phase_courante}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Démarrage</div>
                <div className="text-sm text-zinc-300">{formatDate(mission?.date_demarrage)}</div>
              </div>
            </div>
          </div>
          {/* Entités */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs text-zinc-500">Entités :</span>
            {(mission?.entites || []).map(e => (
              <span
                key={e}
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: ENTITE_COLORS[e] + '22', color: ENTITE_COLORS[e], border: `1px solid ${ENTITE_COLORS[e]}44` }}
              >
                {e}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bloc 2 — KPIs */}
      <div className="grid grid-cols-6 gap-3">
        <KpiCard
          icon={<FileText size={16} />}
          label="Formulaires envoyés"
          value={`${envoyes} / ${totalIntervenants}`}
          sub={`${Math.round((envoyes / Math.max(totalIntervenants, 1)) * 100)}%`}
          color="blue"
        />
        <KpiCard
          icon={<CheckCircle2 size={16} />}
          label="Formulaires reçus"
          value={`${recus} / ${totalIntervenants}`}
          sub={`${Math.round((recus / Math.max(totalIntervenants, 1)) * 100)}%`}
          color="green"
        />
        <KpiCard
          icon={<Calendar size={16} />}
          label="Entretiens planifiés"
          value={`${planifies} / ${totalPrevus}`}
          color="purple"
        />
        <KpiCard
          icon={<CheckCircle2 size={16} />}
          label="Entretiens réalisés"
          value={`${realises} / ${totalPrevus}`}
          color="amber"
        />
        <KpiCard
          icon={<Clock size={16} />}
          label="Semaine courante"
          value={`S${currentSemaine}`}
          sub={SEMAINES[currentSemaine]?.desc}
          color="zinc"
        />
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 flex flex-col items-center justify-center gap-2">
          <div className="text-xs text-zinc-500 text-center">Complétion globale</div>
          <div className="relative w-16 h-16">
            <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#27272A" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="#F59E0B" strokeWidth="3"
                strokeDasharray={`${completionRate} ${100 - completionRate}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-amber-400">{completionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bloc 3 — Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline de la mission</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 items-stretch">
            {SEMAINES.map(s => {
              const isActive = s.num === currentSemaine
              const isCurrent = s.num > 0
              const intervsThisSemaine = intervenants.filter(i => i.semaine === s.num)

              return (
                <div
                  key={s.num}
                  className={`flex-1 rounded-lg p-3 border transition-all ${isActive ? 'border-amber-500/50 bg-amber-500/10' : 'border-zinc-800 bg-zinc-900/50'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold" style={{ color: s.color }}>{s.label}</span>
                    {isActive && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">En cours</span>}
                  </div>
                  <div className="text-[11px] text-zinc-400 mb-3">{s.desc}</div>
                  {s.num > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {intervsThisSemaine.map(i => {
                        const e = entretiens.find(e => e.intervenant_id === i.id)
                        const isRealise = e?.statut === 'Réalisé'
                        const isPlanifie = e?.statut === 'Planifié'
                        const isEnRetard = e?.date_prevue && isDatePassed(e.date_prevue) && !isRealise
                        return (
                          <div
                            key={i.id}
                            title={`${i.prenom} ${i.nom}`}
                            className={`w-2.5 h-2.5 rounded-full ${isRealise ? 'bg-emerald-500' : isEnRetard ? 'bg-red-500' : isPlanifie ? 'bg-zinc-400' : 'bg-zinc-700'}`}
                          />
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[11px] text-zinc-500">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Réalisé</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-zinc-400" /> Planifié</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> En retard</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-zinc-700" /> À planifier</div>
          </div>
        </CardContent>
      </Card>

      {/* Bloc 4 — Graphiques */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Intervenants par statut</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
                    {donutData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {donutData.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-zinc-400">{d.name}</span>
                    <span className="text-xs font-semibold text-zinc-200 ml-auto pl-4">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avancement par entité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 pt-1">
              {barData.map(d => (
                <div key={d.entite}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-400">{d.entite}</span>
                    <span className="text-xs text-zinc-500">{d.done} / {d.total}</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: d.total > 0 ? `${(d.done / d.total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bloc 5 — Alertes */}
      {alertes.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-amber-400" />
              <CardTitle>Alertes & Actions rapides</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {alertes.map((alerte, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-3 rounded-lg border ${alerte.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-blue-500/5 border-blue-500/20'}`}
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle size={14} className={alerte.type === 'warning' ? 'text-amber-400' : 'text-blue-400'} />
                  <span className="text-sm text-zinc-300">{alerte.message}</span>
                </div>
                <Button variant="outline" size="sm" onClick={alerte.onClick}>{alerte.action}</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {alertes.length === 0 && (
        <div className="flex items-center gap-2 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="text-sm text-zinc-400">Aucune alerte — tout est à jour.</span>
        </div>
      )}
    </div>
  )
}

function KpiCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  color: string
}) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-400',
    green: 'text-emerald-400',
    purple: 'text-purple-400',
    amber: 'text-amber-400',
    zinc: 'text-zinc-400',
  }
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4">
      <div className={`mb-2 ${colorMap[color]}`}>{icon}</div>
      <div className="text-lg font-bold text-zinc-100">{value}</div>
      {sub && <div className="text-[11px] text-zinc-500 mt-0.5">{sub}</div>}
      <div className="text-[11px] text-zinc-600 mt-1">{label}</div>
    </div>
  )
}
