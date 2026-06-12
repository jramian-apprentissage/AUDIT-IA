-- ÉTAPE 1 : Désactiver RLS sur toutes les tables
alter table if exists mission disable row level security;
alter table if exists intervenants disable row level security;
alter table if exists formulaires disable row level security;
alter table if exists formulaire_assignation disable row level security;
alter table if exists formulaire_reponses disable row level security;
alter table if exists entretiens disable row level security;
alter table if exists transcriptions disable row level security;
alter table if exists syntheses_ia disable row level security;
alter table if exists notes_mission disable row level security;

-- ÉTAPE 2 : Créer les tables manquantes (si le schéma complet n'a pas été exécuté)
create extension if not exists "uuid-ossp";

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
alter table mission disable row level security;

create table if not exists intervenants (
  id uuid primary key default uuid_generate_v4(),
  nom text not null,
  prenom text not null,
  poste text not null,
  entite text not null,
  priorite text not null default 'Haute',
  semaine integer default 1,
  duree_entretien integer default 60,
  email text,
  telephone text,
  statut_entretien text default 'À planifier',
  date_entretien timestamptz,
  notes_generales text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table intervenants disable row level security;

create table if not exists formulaires (
  id uuid primary key default uuid_generate_v4(),
  nom text not null,
  type text not null,
  description text,
  sections jsonb not null default '[]'::jsonb,
  statut text default 'brouillon',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table formulaires disable row level security;

create table if not exists formulaire_assignation (
  id uuid primary key default uuid_generate_v4(),
  formulaire_id uuid references formulaires(id) on delete cascade,
  intervenant_id uuid references intervenants(id) on delete cascade,
  token uuid unique default uuid_generate_v4(),
  date_envoi timestamptz,
  date_reception timestamptz,
  statut text default 'non_envoyé',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table formulaire_assignation disable row level security;

create table if not exists formulaire_reponses (
  id uuid primary key default uuid_generate_v4(),
  assignation_id uuid references formulaire_assignation(id) on delete cascade,
  question_id text not null,
  section_id text not null,
  reponse jsonb,
  created_at timestamptz default now()
);
alter table formulaire_reponses disable row level security;

create table if not exists entretiens (
  id uuid primary key default uuid_generate_v4(),
  intervenant_id uuid references intervenants(id) on delete cascade unique,
  date_prevue timestamptz,
  duree_prevue integer default 60,
  duree_reelle integer,
  statut text default 'À planifier',
  themes jsonb default '[]'::jsonb,
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table entretiens disable row level security;

create table if not exists transcriptions (
  id uuid primary key default uuid_generate_v4(),
  intervenant_id uuid references intervenants(id) on delete cascade unique,
  contenu text,
  source text default 'collage',
  analyse_ia jsonb,
  analyse_generee_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table transcriptions disable row level security;

create table if not exists syntheses_ia (
  id uuid primary key default uuid_generate_v4(),
  intervenant_id uuid references intervenants(id) on delete cascade unique,
  resume_formulaire jsonb,
  questions_generees jsonb,
  synthese_finale jsonb,
  resume_formulaire_at timestamptz,
  questions_generees_at timestamptz,
  synthese_finale_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table syntheses_ia disable row level security;

create table if not exists notes_mission (
  id uuid primary key default uuid_generate_v4(),
  titre text not null,
  contenu text,
  categorie text default 'général',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table notes_mission disable row level security;

-- ÉTAPE 3 : Données initiales
insert into mission (nom_client, groupe, secteur, gerant, entites, effectif_estime, phase_courante, date_demarrage, statut)
select 'HOMERESINE', 'Groupe Gross', 'Installation de résine — sols, chantiers, SAV', 'Mathieu GROSS',
       array['Distri Résine', 'Home Résine', 'Résilux', 'HR Construction'], 54,
       'Phase 01 — Audit Lean IT', current_date, 'En cours'
where not exists (select 1 from mission);

insert into intervenants (prenom, nom, poste, entite, priorite, semaine, duree_entretien)
select * from (values
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
) as v(prenom, nom, poste, entite, priorite, semaine, duree_entretien)
where not exists (select 1 from intervenants);

insert into formulaires (nom, type, description, sections, statut)
select
  'Formulaire Audit Lean IT — Standard',
  'Direction',
  'Dans le cadre de notre mission d''audit Lean IT, nous souhaitons mieux comprendre votre quotidien, vos outils et vos besoins. Ce formulaire prend environ 10 minutes. Merci pour votre participation.',
  '[
    {"id":"identification","titre":"Identification","questions":[
      {"id":"nom_prenom","libelle":"Nom et prénom","type":"texte_court","obligatoire":true},
      {"id":"poste","libelle":"Poste occupé","type":"texte_court","obligatoire":true},
      {"id":"anciennete","libelle":"Ancienneté dans l''entreprise","type":"texte_court","obligatoire":false}
    ]},
    {"id":"taches","titre":"Tâches & Organisation","questions":[
      {"id":"taches_quotidiennes","libelle":"Décrivez vos principales tâches quotidiennes","type":"texte_long","obligatoire":true},
      {"id":"temps_taches","libelle":"Répartition du temps par tâche","type":"tableau","obligatoire":false,"colonnes":["Tâche","Fréquence","Temps estimé","Outil utilisé"]}
    ]},
    {"id":"outils","titre":"Outils utilisés","questions":[
      {"id":"outils_liste","libelle":"Quels outils numériques utilisez-vous au quotidien ?","type":"texte_long","obligatoire":true},
      {"id":"maitrise","libelle":"Évaluez votre maîtrise de ces outils (1 = débutant, 5 = expert)","type":"echelle","obligatoire":true}
    ]},
    {"id":"frictions","titre":"Frictions & Irritants","questions":[
      {"id":"frictions_principales","libelle":"Quelles sont vos principales frustrations dans votre travail ?","type":"texte_long","obligatoire":true},
      {"id":"temps_perdu","libelle":"Où perdez-vous le plus de temps dans votre journée ?","type":"texte_long","obligatoire":false}
    ]},
    {"id":"ia","titre":"Vision IA","questions":[
      {"id":"connaissance_ia","libelle":"Utilisez-vous déjà des outils d''intelligence artificielle ?","type":"select","obligatoire":true,"options":["Oui, régulièrement","Oui, occasionnellement","Non, mais ça m''intéresse","Non, et je ne suis pas à l''aise avec ça"]},
      {"id":"cas_usage_ia","libelle":"Si l''IA pouvait vous aider dans une tâche, laquelle serait-ce ?","type":"texte_long","obligatoire":false}
    ]}
  ]'::jsonb,
  'publié'
where not exists (select 1 from formulaires);

-- Vérification finale
select 'mission' as table_name, count(*) from mission
union all select 'intervenants', count(*) from intervenants
union all select 'formulaires', count(*) from formulaires;
