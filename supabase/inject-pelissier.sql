-- ============================================================
-- INJECTION FORMULAIRE — PELISSIER Franck
-- Formulaire Pré-Audit reçu le 26/06/2026
-- ============================================================

-- 1. Mise à jour statut intervenant → Réalisé
UPDATE intervenants
SET statut_entretien = 'Réalisé', updated_at = now()
WHERE prenom = 'Franck' AND nom = 'PELISSIER';

-- 2. Création / mise à jour entretien → Réalisé
INSERT INTO entretiens (intervenant_id, statut, duree_reelle, notes)
SELECT id, 'Réalisé', 75, 'Formulaire pré-audit reçu le 26/06/2026. Ancienneté : 5 ans.'
FROM intervenants WHERE prenom = 'Franck' AND nom = 'PELISSIER'
ON CONFLICT (intervenant_id) DO UPDATE
SET statut = 'Réalisé',
    notes = COALESCE(entretiens.notes, '') || E'\nFormulaire pré-audit reçu le 26/06/2026.',
    updated_at = now();

-- 3. Assignation formulaire → reçu
INSERT INTO formulaire_assignation (formulaire_id, intervenant_id, date_envoi, date_reception, statut)
SELECT f.id, i.id, now() - interval '2 days', now(), 'reçu'
FROM formulaires f, intervenants i
WHERE f.statut = 'publié' AND i.prenom = 'Franck' AND i.nom = 'PELISSIER'
ON CONFLICT (formulaire_id, intervenant_id) DO UPDATE
SET statut = 'reçu', date_reception = now(), updated_at = now();

-- 4. Suppression anciennes réponses
DELETE FROM formulaire_reponses
WHERE assignation_id = (
  SELECT fa.id FROM formulaire_assignation fa
  JOIN intervenants i ON fa.intervenant_id = i.id
  JOIN formulaires f ON fa.formulaire_id = f.id
  WHERE i.prenom = 'Franck' AND i.nom = 'PELISSIER' AND f.statut = 'publié'
  LIMIT 1
);

-- 5. Insertion réponses — Section A
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'identification', 'nom_prenom', '"Franck PELISSIER"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Franck' AND i.nom = 'PELISSIER' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'identification', 'poste_fonction', '"Directeur Commercial"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Franck' AND i.nom = 'PELISSIER' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'identification', 'entite', '"Distri Résine"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Franck' AND i.nom = 'PELISSIER' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'identification', 'anciennete', '"5 ans"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Franck' AND i.nom = 'PELISSIER' AND f.statut = 'publié';

-- Section B — Tâches
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'taches', 'tableau_taches', '[
  {"Tâche / Activité": "Réunion commercial", "Fréquence": "Quotidien", "Temps moyen": "30 min", "Outil(s) utilisé(s)": "Zoom"},
  {"Tâche / Activité": "Recrutement vendeurs", "Fréquence": "Quotidien", "Temps moyen": "1h / RDV", "Outil(s) utilisé(s)": "Zoom et entretien"},
  {"Tâche / Activité": "Gestion des rendez-vous vendeurs", "Fréquence": "Quotidien", "Temps moyen": "30 min / appel", "Outil(s) utilisé(s)": "Téléphone"},
  {"Tâche / Activité": "CR journalier avec les vendeurs", "Fréquence": "Quotidien", "Temps moyen": "1h", "Outil(s) utilisé(s)": "Téléphone"},
  {"Tâche / Activité": "Gestion des services", "Fréquence": "Quotidien", "Temps moyen": "3-5h / jour", "Outil(s) utilisé(s)": "Bureau"}
]'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Franck' AND i.nom = 'PELISSIER' AND f.statut = 'publié';

-- Section C — Outils
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'outils', 'tableau_outils', '[
  {"Outil / Application": "Salesforce", "Usage principal": "CRM / suivi commercial", "Fréquence": "Quotidien", "Satisfaction (1-5)": "4"},
  {"Outil / Application": "Email (Gmail / Outlook)", "Usage principal": "Communication", "Fréquence": "Chaque jour", "Satisfaction (1-5)": "4"},
  {"Outil / Application": "WhatsApp", "Usage principal": "Groupe", "Fréquence": "Chaque jour", "Satisfaction (1-5)": "5"},
  {"Outil / Application": "Google Drive / Sheets", "Usage principal": "Planning & agenda vendeurs", "Fréquence": "Au besoin", "Satisfaction (1-5)": "5"},
  {"Outil / Application": "Traceur GPS camionnettes", "Usage principal": "Suivi vendeur", "Fréquence": "Au besoin", "Satisfaction (1-5)": "4"}
]'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Franck' AND i.nom = 'PELISSIER' AND f.statut = 'publié';

-- Section D — Frictions (RAS sur toutes les questions)
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'frictions', 'perte_info', '"RAS"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Franck' AND i.nom = 'PELISSIER' AND f.statut = 'publié';

-- Section E — Vision IA
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'ia', 'ia_une_chose', '"Gestion et organisation du planning"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Franck' AND i.nom = 'PELISSIER' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'ia', 'ia_usage_actuel', '"Oui, pour créer des visuels"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Franck' AND i.nom = 'PELISSIER' AND f.statut = 'publié';

-- ============================================================
-- VÉRIFICATION
-- ============================================================
SELECT i.prenom, i.nom, i.statut_entretien, e.statut as entretien_statut,
       fa.statut as formulaire_statut, COUNT(fr.id) as nb_reponses
FROM intervenants i
LEFT JOIN entretiens e ON e.intervenant_id = i.id
LEFT JOIN formulaire_assignation fa ON fa.intervenant_id = i.id
LEFT JOIN formulaire_reponses fr ON fr.assignation_id = fa.id
WHERE i.prenom = 'Franck' AND i.nom = 'PELISSIER'
GROUP BY i.prenom, i.nom, i.statut_entretien, e.statut, fa.statut;
