export interface Mission {
  id: string
  nom_client: string
  groupe: string
  secteur: string
  gerant: string
  entites: string[]
  effectif_estime: number
  phase_courante: string
  date_demarrage: string
  statut: string
  created_at: string
  updated_at: string
}

export interface Intervenant {
  id: string
  nom: string
  prenom: string
  poste: string
  entite: string
  priorite: 'Critique' | 'Haute' | 'Complémentaire'
  semaine: number
  duree_entretien: number
  email?: string
  telephone?: string
  statut_entretien: 'À planifier' | 'Planifié' | 'Réalisé' | 'En retard'
  date_entretien?: string
  notes_generales?: string
  created_at: string
  updated_at: string
}

export interface Formulaire {
  id: string
  nom: string
  type: string
  description?: string
  sections: Section[]
  statut: 'brouillon' | 'publié' | 'archivé'
  created_at: string
  updated_at: string
}

export interface Section {
  id: string
  titre: string
  questions: Question[]
}

export interface Question {
  id: string
  libelle: string
  description?: string
  type: 'texte_court' | 'texte_long' | 'tableau' | 'select' | 'multi_select' | 'echelle' | 'date'
  obligatoire: boolean
  options?: string[]
  colonnes?: string[]
}

export interface FormulaireAssignation {
  id: string
  formulaire_id: string
  intervenant_id: string
  token: string
  date_envoi?: string
  date_reception?: string
  statut: 'non_envoyé' | 'envoyé' | 'reçu'
  created_at: string
  updated_at: string
  formulaire?: Formulaire
  intervenant?: Intervenant
}

export interface FormulaireReponse {
  id: string
  assignation_id: string
  question_id: string
  section_id: string
  reponse: unknown
  created_at: string
}

export interface Entretien {
  id: string
  intervenant_id: string
  date_prevue?: string
  duree_prevue: number
  duree_reelle?: number
  statut: 'À planifier' | 'Planifié' | 'Réalisé' | 'Annulé'
  themes: Theme[]
  notes: string
  created_at: string
  updated_at: string
}

export interface Theme {
  id: string
  libelle: string
  checked: boolean
}

export interface Transcription {
  id: string
  intervenant_id: string
  contenu?: string
  source: 'upload' | 'collage'
  analyse_ia?: AnalyseIA
  analyse_generee_at?: string
  created_at: string
  updated_at: string
}

export interface AnalyseIA {
  resume: string[]
  outils: string[]
  frictions: string[]
  cas_usage_ia: string[]
  questions_sans_reponse: string[]
  maturite_digitale: 'Faible' | 'Moyen' | 'Élevé'
  maturite_justification: string
}

export interface SyntheseIA {
  id: string
  intervenant_id: string
  resume_formulaire?: { points: string[] }
  questions_generees?: { questions: string[] }
  synthese_finale?: SyntheseFinal
  resume_formulaire_at?: string
  questions_generees_at?: string
  synthese_finale_at?: string
  created_at: string
  updated_at: string
}

export interface SyntheseFinal {
  profil_digital: string
  douleurs: string[]
  outils_cles: string[]
  posture_ia: 'réticent' | 'neutre' | 'enthousiaste'
  recommandations: string[]
  cas_usage_prioritaire: string
}

export type EntiteType = 'Distri Résine' | 'Home Résine' | 'Résilux' | 'HR Construction'

export const ENTITE_COLORS: Record<string, string> = {
  'Distri Résine': '#3B82F6',
  'Home Résine': '#10B981',
  'Résilux': '#F59E0B',
  'HR Construction': '#8B5CF6',
}

export const PRIORITE_COLORS: Record<string, string> = {
  'Critique': '#EF4444',
  'Haute': '#F59E0B',
  'Complémentaire': '#10B981',
}
