-- HOMERESINE AUDIT PLATFORM — Schéma Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================
-- TABLE: mission
-- =====================
create table if not exists mission (
  id uuid primary key default uuid_generate_v4(),
  nom_client text not null default 'HOMERESINE',
  groupe text default 'Groupe Gross',
  secteur text default 'Installation de résine — sols, chantiers, SAV',
  gerant text default 'Mathieu GROSS',
  entites text[] default array['Distri Résine', 'Home Résine', 'Résilux', 'HR Construction'],
  effectif_estime integer default 54,
  phase_courante text default 'Phase 01 — Audit Lean IT',
  date_demarrage date default current_date,
  statut text default 'En cours',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- TABLE: intervenants
-- =====================
create table if not exists intervenants (
  id uuid primary key default uuid_generate_v4(),
  nom text not null,
  prenom text not null,
  poste text not null,
  entite text not null check (entite in ('Distri Résine', 'Home Résine', 'Résilux', 'HR Construction')),
  priorite text not null default 'Haute' check (priorite in ('Critique', 'Haute', 'Complémentaire')),
  semaine integer default 1 check (semaine between 1 and 4),
  duree_entretien integer default 60, -- en minutes
  email text,
  telephone text,
  statut_entretien text default 'À planifier' check (statut_entretien in ('À planifier', 'Planifié', 'Réalisé', 'En retard')),
  date_entretien timestamptz,
  notes_generales text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- TABLE: formulaires
-- =====================
create table if not exists formulaires (
  id uuid primary key default uuid_generate_v4(),
  nom text not null,
  type text not null check (type in ('Direction', 'Commercial', 'Admin général', 'SAV', 'Terrain', 'Marketing', 'Phoning', 'TC Terrain')),
  description text,
  sections jsonb not null default '[]'::jsonb,
  -- Structure sections: [{id, titre, questions: [{id, libelle, description, type, obligatoire, options, colonnes}]}]
  statut text default 'brouillon' check (statut in ('brouillon', 'publié', 'archivé')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- TABLE: formulaire_assignation
-- =====================
create table if not exists formulaire_assignation (
  id uuid primary key default uuid_generate_v4(),
  formulaire_id uuid references formulaires(id) on delete cascade,
  intervenant_id uuid references intervenants(id) on delete cascade,
  token uuid unique default uuid_generate_v4(),
  date_envoi timestamptz,
  date_reception timestamptz,
  statut text default 'non_envoyé' check (statut in ('non_envoyé', 'envoyé', 'reçu')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(formulaire_id, intervenant_id)
);

-- =====================
-- TABLE: formulaire_reponses
-- =====================
create table if not exists formulaire_reponses (
  id uuid primary key default uuid_generate_v4(),
  assignation_id uuid references formulaire_assignation(id) on delete cascade,
  question_id text not null,
  section_id text not null,
  reponse jsonb,
  created_at timestamptz default now()
);

-- =====================
-- TABLE: entretiens
-- =====================
create table if not exists entretiens (
  id uuid primary key default uuid_generate_v4(),
  intervenant_id uuid references intervenants(id) on delete cascade unique,
  date_prevue timestamptz,
  duree_prevue integer default 60,
  duree_reelle integer,
  statut text default 'À planifier' check (statut in ('À planifier', 'Planifié', 'Réalisé', 'Annulé')),
  themes jsonb default '[]'::jsonb,
  -- [{id, libelle, checked}]
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- TABLE: transcriptions
-- =====================
create table if not exists transcriptions (
  id uuid primary key default uuid_generate_v4(),
  intervenant_id uuid references intervenants(id) on delete cascade unique,
  contenu text,
  source text default 'upload' check (source in ('upload', 'collage')),
  analyse_ia jsonb,
  -- {resume, outils, frictions, cas_usage_ia, questions_sans_reponse, maturite_digitale, maturite_justification}
  analyse_generee_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- TABLE: syntheses_ia
-- =====================
create table if not exists syntheses_ia (
  id uuid primary key default uuid_generate_v4(),
  intervenant_id uuid references intervenants(id) on delete cascade unique,
  resume_formulaire jsonb,
  -- {points: [string]}
  questions_generees jsonb,
  -- {questions: [string]}
  synthese_finale jsonb,
  -- {profil_digital, douleurs, outils_cles, posture_ia, recommandations, cas_usage_prioritaire}
  resume_formulaire_at timestamptz,
  questions_generees_at timestamptz,
  synthese_finale_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- TABLE: notes_mission
-- =====================
create table if not exists notes_mission (
  id uuid primary key default uuid_generate_v4(),
  titre text not null,
  contenu text,
  categorie text default 'général',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- RLS Policies
-- =====================

-- Disable RLS for now (single user, auth handled by Supabase Auth)
alter table mission disable row level security;
alter table intervenants disable row level security;
alter table formulaires disable row level security;
alter table formulaire_assignation disable row level security;
alter table formulaire_reponses disable row level security;
alter table entretiens disable row level security;
alter table transcriptions disable row level security;
alter table syntheses_ia disable row level security;
alter table notes_mission disable row level security;

-- =====================
-- ENABLE REALTIME
-- =====================
alter publication supabase_realtime add table formulaire_assignation;
alter publication supabase_realtime add table entretiens;

-- =====================
-- DONNÉES INITIALES — Mission HOMERESINE
-- =====================
insert into mission (nom_client, groupe, secteur, gerant, entites, effectif_estime, phase_courante, date_demarrage, statut)
values ('HOMERESINE', 'Groupe Gross', 'Installation de résine — sols, chantiers, SAV', 'Mathieu GROSS',
        array['Distri Résine', 'Home Résine', 'Résilux', 'HR Construction'], 54,
        'Phase 01 — Audit Lean IT', current_date, 'En cours')
on conflict do nothing;

-- Intervenants initiaux HOMERESINE
insert into intervenants (prenom, nom, poste, entite, priorite, semaine, duree_entretien) values
('Mathieu', 'GROSS', 'Gérant / Direction', 'Home Résine', 'Critique', 1, 90),
('Brice', 'GENTILE', 'Responsable Commercial', 'Home Résine', 'Critique', 2, 60),
('Sophie', 'MARTIN', 'Responsable Administration', 'Distri Résine', 'Haute', 1, 60),
('Thomas', 'BERNARD', 'Chef de chantier', 'HR Construction', 'Haute', 3, 45),
('Julie', 'DUPONT', 'SAV / Relation client', 'Home Résine', 'Haute', 2, 45),
('Marc', 'LEBLANC', 'TC Terrain', 'Distri Résine', 'Complémentaire', 3, 45),
('Céline', 'ROUSSEAU', 'Marketing', 'Résilux', 'Complémentaire', 3, 45),
('Pierre', 'FONTAINE', 'Phoning / Commercial sédentaire', 'Home Résine', 'Complémentaire', 2, 30),
('Isabelle', 'MERCIER', 'Comptabilité', 'Distri Résine', 'Complémentaire', 1, 45),
('Antoine', 'LAMBERT', 'Applicateur terrain', 'HR Construction', 'Complémentaire', 3, 30),
('Nathalie', 'SIMON', 'Assistante de direction', 'Résilux', 'Haute', 1, 45)
on conflict do nothing;
