-- ============================================================
-- INJECTION FORMULAIRE — MOUTON Marion
-- Formulaire Pré-Audit reçu le 26/06/2026
-- ============================================================

-- 1. Statut intervenant → Réalisé
UPDATE intervenants
SET statut_entretien = 'Réalisé', updated_at = now()
WHERE prenom = 'Marion' AND nom = 'MOUTON';

-- 2. Entretien → Réalisé
INSERT INTO entretiens (intervenant_id, statut, duree_reelle, notes)
SELECT id, 'Réalisé', 60, 'Formulaire pré-audit reçu le 26/06/2026. Ancienneté : 5 ans.'
FROM intervenants WHERE prenom = 'Marion' AND nom = 'MOUTON'
ON CONFLICT (intervenant_id) DO UPDATE
SET statut = 'Réalisé',
    notes = COALESCE(entretiens.notes, '') || E'\nFormulaire pré-audit reçu le 26/06/2026.',
    updated_at = now();

-- 3. Assignation formulaire → reçu
INSERT INTO formulaire_assignation (formulaire_id, intervenant_id, date_envoi, date_reception, statut)
SELECT f.id, i.id, now() - interval '2 days', now(), 'reçu'
FROM formulaires f, intervenants i
WHERE f.statut = 'publié' AND i.prenom = 'Marion' AND i.nom = 'MOUTON'
ON CONFLICT (formulaire_id, intervenant_id) DO UPDATE
SET statut = 'reçu', date_reception = now(), updated_at = now();

-- 4. Suppression anciennes réponses
DELETE FROM formulaire_reponses
WHERE assignation_id = (
  SELECT fa.id FROM formulaire_assignation fa
  JOIN intervenants i ON fa.intervenant_id = i.id
  JOIN formulaires f ON fa.formulaire_id = f.id
  WHERE i.prenom = 'Marion' AND i.nom = 'MOUTON' AND f.statut = 'publié'
  LIMIT 1
);

-- 5. Section A — Identification
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'identification', 'nom_prenom', '"Marion MOUTON"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Marion' AND i.nom = 'MOUTON' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'identification', 'poste_fonction', '"Assistante Commerciale"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Marion' AND i.nom = 'MOUTON' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'identification', 'entite', '"Distri Résine"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Marion' AND i.nom = 'MOUTON' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'identification', 'anciennete', '"5 ans"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Marion' AND i.nom = 'MOUTON' AND f.statut = 'publié';

-- Section B — Tâches
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'taches', 'tableau_taches', '[
  {"Tâche / Activité": "Relevé des mails", "Fréquence": "Quotidien", "Temps moyen": "", "Outil(s) utilisé(s)": "Outlook"},
  {"Tâche / Activité": "Inscrire dossiers MAQ", "Fréquence": "Quotidien", "Temps moyen": "", "Outil(s) utilisé(s)": "Numbers"},
  {"Tâche / Activité": "Appels entrants", "Fréquence": "Quotidien", "Temps moyen": "", "Outil(s) utilisé(s)": ""},
  {"Tâche / Activité": "Prise de rendez-vous", "Fréquence": "Quotidien", "Temps moyen": "", "Outil(s) utilisé(s)": "Agenda / Salesforce"},
  {"Tâche / Activité": "Vérification des dossiers", "Fréquence": "Hebdo", "Temps moyen": "", "Outil(s) utilisé(s)": "Salesforce"},
  {"Tâche / Activité": "Faire des devis", "Fréquence": "Quotidien", "Temps moyen": "", "Outil(s) utilisé(s)": "Google Sheets"}
]'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Marion' AND i.nom = 'MOUTON' AND f.statut = 'publié';

-- Section C — Outils
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'outils', 'tableau_outils', '[
  {"Outil / Application": "Salesforce", "Usage principal": "CRM / suivi commercial", "Fréquence": "Quotidien", "Satisfaction (1-5)": ""},
  {"Outil / Application": "Email (Gmail / Outlook)", "Usage principal": "", "Fréquence": "Quotidien", "Satisfaction (1-5)": ""},
  {"Outil / Application": "WhatsApp", "Usage principal": "", "Fréquence": "Quotidien", "Satisfaction (1-5)": ""},
  {"Outil / Application": "Google Drive / Sheets", "Usage principal": "", "Fréquence": "Quotidien", "Satisfaction (1-5)": ""},
  {"Outil / Application": "Traceur GPS camionnettes", "Usage principal": "", "Fréquence": "Hebdo", "Satisfaction (1-5)": ""}
]'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Marion' AND i.nom = 'MOUTON' AND f.statut = 'publié';

-- Section D — Frictions
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'frictions', 'taches_repetitives', '"Photocopies RDC"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Marion' AND i.nom = 'MOUTON' AND f.statut = 'publié';

-- Section E — Vision IA
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'ia', 'ia_usage_actuel', '"Oui, pour créer des affiches de déstockage"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Marion' AND i.nom = 'MOUTON' AND f.statut = 'publié';

-- ============================================================
-- VÉRIFICATION
-- ============================================================
SELECT i.prenom, i.nom, i.statut_entretien, e.statut as entretien_statut,
       fa.statut as formulaire_statut, COUNT(fr.id) as nb_reponses
FROM intervenants i
LEFT JOIN entretiens e ON e.intervenant_id = i.id
LEFT JOIN formulaire_assignation fa ON fa.intervenant_id = i.id
LEFT JOIN formulaire_reponses fr ON fr.assignation_id = fa.id
WHERE i.prenom = 'Marion' AND i.nom = 'MOUTON'
GROUP BY i.prenom, i.nom, i.statut_entretien, e.statut, fa.statut;
