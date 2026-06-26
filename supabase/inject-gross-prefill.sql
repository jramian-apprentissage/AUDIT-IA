-- ============================================================
-- PRÉ-REMPLISSAGE FORMULAIRE — GROSS Mathieu (Gérant)
-- Basé sur la réunion de cadrage du 12 juin 2026
-- Objectif : alimenter l'IA pour générer des questions personnalisées
-- ============================================================

-- 1. Assignation formulaire → statut "envoyé" (pas encore reçu, pré-rempli depuis réunion)
INSERT INTO formulaire_assignation (formulaire_id, intervenant_id, date_envoi, date_reception, statut)
SELECT f.id, i.id, now(), null, 'envoyé'
FROM formulaires f, intervenants i
WHERE f.statut = 'publié' AND i.prenom = 'Mathieu' AND i.nom = 'GROSS'
ON CONFLICT (formulaire_id, intervenant_id) DO UPDATE
SET statut = 'envoyé', updated_at = now();

-- 2. Suppression anciennes réponses si re-traitement
DELETE FROM formulaire_reponses
WHERE assignation_id = (
  SELECT fa.id FROM formulaire_assignation fa
  JOIN intervenants i ON fa.intervenant_id = i.id
  JOIN formulaires f ON fa.formulaire_id = f.id
  WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS' AND f.statut = 'publié'
  LIMIT 1
);

-- 3. Section A — Identification (connu)
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'identification', 'nom_prenom', '"Mathieu GROSS"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'identification', 'poste_fonction', '"Gérant du groupe"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'identification', 'entite', '"Home Résine"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'identification', 'anciennete', '"Plus de 10 ans"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS' AND f.statut = 'publié';

-- 4. Section B — Tâches (reconstituées depuis réunion du 12/06/2026)
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'taches', 'tableau_taches', '[
  {"Tâche / Activité": "Pilotage stratégique et direction générale du groupe", "Fréquence": "Quotidien", "Temps moyen": "", "Outil(s) utilisé(s)": "Téléphone, WhatsApp"},
  {"Tâche / Activité": "Suivi des campagnes marketing (Google Ads, Facebook, SEO, sites web)", "Fréquence": "Quotidien", "Temps moyen": "1-2h", "Outil(s) utilisé(s)": "Meta Business, Google Ads"},
  {"Tâche / Activité": "Suivi commercial : RDVs positionnés, vendus, chiffre d''affaires", "Fréquence": "Quotidien", "Temps moyen": "", "Outil(s) utilisé(s)": "Salesforce, Téléphone"},
  {"Tâche / Activité": "Réunions et CR journaliers avec les équipes commerciales", "Fréquence": "Quotidien", "Temps moyen": "", "Outil(s) utilisé(s)": "Téléphone, Zoom"},
  {"Tâche / Activité": "Gestion RH / paie / absences des salariés", "Fréquence": "Mensuel", "Temps moyen": "", "Outil(s) utilisé(s)": ""},
  {"Tâche / Activité": "Remplissage tableaux de statistiques (RDVs, CA, coût marketing, rentabilité)", "Fréquence": "Quotidien", "Temps moyen": "", "Outil(s) utilisé(s)": "Excel / Salesforce"}
]'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS' AND f.statut = 'publié';

-- 5. Section C — Outils (reconstitués depuis réunion)
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'outils', 'tableau_outils', '[
  {"Outil / Application": "Salesforce", "Usage principal": "CRM / suivi commercial — utilisé depuis +10 ans", "Fréquence": "Quotidien", "Satisfaction (1-5)": "3", "Commentaire": "Complexe, sous-utilisé, veut le connecter à l''IA pour automatiser les stats"},
  {"Outil / Application": "Email (Gmail / Outlook)", "Usage principal": "Communication", "Fréquence": "Quotidien", "Satisfaction (1-5)": ""},
  {"Outil / Application": "WhatsApp", "Usage principal": "Communication équipe et clients", "Fréquence": "Quotidien", "Satisfaction (1-5)": ""},
  {"Outil / Application": "Google Drive / Sheets", "Usage principal": "Tableaux statistiques manuels", "Fréquence": "Quotidien", "Satisfaction (1-5)": ""},
  {"Outil / Application": "Traceur GPS camionnettes", "Usage principal": "Suivi véhicules", "Fréquence": "Quotidien", "Satisfaction (1-5)": ""},
  {"Outil / Application": "Meta Business Suite / Facebook", "Usage principal": "Suivi campagnes pub + audience 650 000 abonnés", "Fréquence": "Quotidien", "Satisfaction (1-5)": ""},
  {"Outil / Application": "Google Ads", "Usage principal": "Campagnes pub multi-sites (auto-concurrence)", "Fréquence": "Quotidien", "Satisfaction (1-5)": ""}
]'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS' AND f.statut = 'publié';

-- 6. Section D — Frictions (extraites de la réunion)
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'frictions', 'tache_sans_valeur',
  '"Remplissage manuel des tableaux de statistiques : nombre de RDVs positionnés, vendus, CA, calcul coût marketing et rentabilité — toutes ces données sont déjà dans Salesforce mais doivent être extraites et calculées manuellement"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'frictions', 'perte_info',
  '"Pas d''accès automatique aux données Salesforce pour calculer la rentabilité des commerciaux (coût/taxe). Historique des appels clients non tracé systématiquement."'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'frictions', 'decisions_sans_info',
  '"Rentabilité des campagnes publicitaires : coût contact, coût marketing, retour sur la base Facebook de 650 000 abonnés jamais monétisée. Décisions prises sans dashboard consolidé."'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'frictions', 'taches_repetitives',
  '"Calcul manuel des tableaux de stats commerciales et marketing. Suivi des relances prospects non répondus (Brice appelle 4x puis abandonne — perte de leads). Gestion du répondeur téléphonique fermé hors horaires (8h/jour seulement)."'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'frictions', 'info_introuvable',
  '"Données consolidées sur la rentabilité par commercial et par campagne. Synthèse automatique des appels clients passés."'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS' AND f.statut = 'publié';

-- 7. Section E — Vision IA (extraite de la réunion)
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'ia', 'ia_une_chose',
  '"Que l''IA pilote tout automatiquement et que je lui donne juste les consignes. Priorité : agent IA connecté à Salesforce pour générer les tableaux de stats (RDVs, CA, coût marketing, rentabilité) sans intervention humaine. Second usage prioritaire : IA de phoning pour relancer les prospects que Brice ne peut plus rappeler."'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'ia', 'ia_usage_actuel',
  '"Non, pas encore utilisé l''IA actuellement. Conscient du potentiel mais n''a pas encore franchi le pas. Questionne comment l''intégrer concrètement dans la société (pas d''installation spéciale nécessaire)."'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'ia', 'donnees_partagees',
  '"Statistiques commerciales : RDVs positionnés / vendus / CA par commercial. Données Salesforce (10+ ans d''historique). Données campagnes pub (Google Ads, Meta). Audience Facebook 650 000 abonnés non monétisée. Données RH / paie."'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS' AND f.statut = 'publié';

-- ============================================================
-- VÉRIFICATION
-- ============================================================
SELECT i.prenom, i.nom, i.statut_entretien, fa.statut as formulaire_statut,
       COUNT(fr.id) as nb_reponses
FROM intervenants i
LEFT JOIN formulaire_assignation fa ON fa.intervenant_id = i.id
LEFT JOIN formulaire_reponses fr ON fr.assignation_id = fa.id
WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS'
GROUP BY i.prenom, i.nom, i.statut_entretien, fa.statut;
