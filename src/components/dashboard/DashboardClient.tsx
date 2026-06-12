'use client'

import { Mission, Intervenant, FormulaireAssignation, Entretien, ENTITE_COLORS } from '@/types'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, daysSince, isDatePassed } from '@/lib/utils'
import { AlertTriangle, CheckCircle2, Clock, FileText, Calendar, Bell, Target, Map, BookOpen, Mic, FileCheck, Clock3, Plus } from 'lucide-react'
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
            <MissionInsight
              totalIntervenants={totalIntervenants}
              envoyes={envoyes}
              recus={recus}
              planifies={planifies}
              realises={realises}
              currentSemaine={currentSemaine}
              semaines={SEMAINES}
            />
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

      {/* Bloc 4 — Mission : Objectifs, Périmètre, Règles */}
      <div className="grid grid-cols-3 gap-4">

        {/* 1.2 Objectifs */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                <Target size={14} className="text-amber-400" />
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-wide">1.2</div>
                <CardTitle>Objectifs de l&apos;audit</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-3">
              {[
                { icon: <Map size={12} />, text: 'Cartographier les processus clés de chaque entité (commercial, devis, chantiers, SAV, RH, admin)' },
                { icon: <FileText size={12} />, text: 'Inventorier les outils en place et identifier leurs connexions — ou absences de connexion' },
                { icon: <CheckCircle2 size={12} />, text: 'Analyser les flux d\'information : qui génère, qui consomme, où l\'information se perd' },
                { icon: <Target size={12} />, text: 'Identifier les cas d\'usage IA à fort impact et les quick wins prioritaires' },
                { icon: <FileCheck size={12} />, text: 'Produire un rapport d\'audit complet avec recommandations et roadmap d\'implémentation' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 group">
                  <div className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-amber-400">
                    {item.icon}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 1.3 Périmètre */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                <Map size={14} className="text-blue-400" />
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-wide">1.3</div>
                <CardTitle>Périmètre de l&apos;audit</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-2">
              {[
                {
                  entite: 'DISTRI RÉSINE',
                  scope: 'Commercial, devis, prospection, marketing',
                  priorite: 'Haute',
                  color: ENTITE_COLORS['Distri Résine'],
                },
                {
                  entite: 'HOME RÉSINE',
                  scope: 'Admin, facturation, SAV, RH, pose',
                  priorite: 'Haute',
                  color: ENTITE_COLORS['Home Résine'],
                },
                {
                  entite: 'RÉSILUX',
                  scope: 'Commercial agence, technique pose',
                  priorite: 'Moyenne',
                  color: ENTITE_COLORS['Résilux'],
                },
                {
                  entite: 'HR CONSTRUCTION',
                  scope: 'Chantiers, gestion poseurs, pointage',
                  priorite: 'Moyenne',
                  color: ENTITE_COLORS['HR Construction'],
                },
              ].map((row) => (
                <div
                  key={row.entite}
                  className="rounded-lg p-3 border"
                  style={{ backgroundColor: row.color + '0D', borderColor: row.color + '33' }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold" style={{ color: row.color }}>{row.entite}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${row.priorite === 'Haute' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {row.priorite === 'Haute' ? '🔴' : '🟡'} {row.priorite}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500">{row.scope}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 4.2 Règles de fonctionnement */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                <BookOpen size={14} className="text-purple-400" />
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-wide">4.2</div>
                <CardTitle>Règles de fonctionnement</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-3">
              {[
                {
                  icon: <FileText size={12} />,
                  color: 'text-amber-400 bg-amber-500/10',
                  text: 'Formulaire pré-audit à retourner 48h avant chaque entretien',
                },
                {
                  icon: <Mic size={12} />,
                  color: 'text-blue-400 bg-blue-500/10',
                  text: 'Entretiens en visio — 1 personne à la fois, sans manager hiérarchique direct',
                },
                {
                  icon: <CheckCircle2 size={12} />,
                  color: 'text-emerald-400 bg-emerald-500/10',
                  text: 'Chaque entretien est enregistré et transcrit via Fireflies',
                },
                {
                  icon: <Clock3 size={12} />,
                  color: 'text-purple-400 bg-purple-500/10',
                  text: 'Compte-rendu produit dans les 24h et partagé à Mathieu GROSS',
                },
                {
                  icon: <Plus size={12} />,
                  color: 'text-zinc-400 bg-zinc-700/50',
                  text: 'Entretien complémentaire (30 min) possible si information critique émerge',
                },
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${rule.color}`}>
                    {rule.icon}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{rule.text}</p>
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

function MissionInsight({
  totalIntervenants, envoyes, recus, planifies, realises, currentSemaine, semaines,
}: {
  totalIntervenants: number
  envoyes: number
  recus: number
  planifies: number
  realises: number
  currentSemaine: number
  semaines: { num: number; label: string; desc: string; color: string }[]
}) {
  // Génère une phrase de synthèse contextuelle selon l'avancement réel
  const lines: { dot: string; text: string }[] = []

  const pctEnvoyes = totalIntervenants > 0 ? Math.round((envoyes / totalIntervenants) * 100) : 0
  const pctRecus = totalIntervenants > 0 ? Math.round((recus / totalIntervenants) * 100) : 0

  if (envoyes === 0) {
    lines.push({ dot: 'bg-zinc-600', text: `Formulaires pas encore envoyés — ${totalIntervenants} intervenants à couvrir` })
  } else if (recus === 0) {
    lines.push({ dot: 'bg-amber-500', text: `${envoyes} formulaire${envoyes > 1 ? 's' : ''} envoyé${envoyes > 1 ? 's' : ''} — en attente de réponses (${pctEnvoyes}% du panel)` })
  } else if (recus < totalIntervenants) {
    lines.push({ dot: 'bg-emerald-500', text: `${recus} réponse${recus > 1 ? 's' : ''} reçue${recus > 1 ? 's' : ''} sur ${totalIntervenants} — ${pctRecus}% du panel couvert` })
  } else {
    lines.push({ dot: 'bg-emerald-500', text: `Tous les formulaires reçus — panel complet (${totalIntervenants}/${totalIntervenants})` })
  }

  if (realises === 0 && planifies === 0) {
    lines.push({ dot: 'bg-zinc-600', text: 'Aucun entretien planifié pour l\'instant' })
  } else if (realises === 0) {
    lines.push({ dot: 'bg-blue-400', text: `${planifies} entretien${planifies > 1 ? 's' : ''} planifié${planifies > 1 ? 's' : ''} — phase terrain à venir` })
  } else if (realises < totalIntervenants) {
    lines.push({ dot: 'bg-purple-400', text: `${realises} entretien${realises > 1 ? 's' : ''} réalisé${realises > 1 ? 's' : ''} · ${planifies} en attente — terrain en cours` })
  } else {
    lines.push({ dot: 'bg-emerald-500', text: `Tous les entretiens réalisés — prêt pour la synthèse finale` })
  }

  const semaineActuelle = semaines[currentSemaine]
  lines.push({ dot: 'bg-amber-500/60', text: `${semaineActuelle.label} en cours — ${semaineActuelle.desc}` })

  return (
    <div className="flex flex-col justify-center gap-1.5 min-w-[280px] max-w-[340px]">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded-sm bg-amber-500/20 flex items-center justify-center">
          <span className="text-amber-400 text-[8px] font-black">IA</span>
        </span>
        Insight mission
      </div>
      {lines.map((l, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${l.dot}`} />
          <span className="text-xs text-zinc-400 leading-snug">{l.text}</span>
        </div>
      ))}
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
