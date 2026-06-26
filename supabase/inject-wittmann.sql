-- ============================================================
-- INJECTION FORMULAIRE — WITTMANN Olivier
-- Formulaire Pré-Audit reçu le 26/06/2026
-- ============================================================

-- 1. Mise à jour du statut intervenant → Réalisé
UPDATE intervenants
SET statut_entretien = 'Réalisé', updated_at = now()
WHERE prenom = 'Olivier' AND nom = 'WITTMANN';

-- 2. Mise à jour du poste (formulaire indique "Poseur" + Chef de chantier)
UPDATE intervenants
SET poste = 'Chef de chantier / Poseur', updated_at = now()
WHERE prenom = 'Olivier' AND nom = 'WITTMANN';

-- 3. Création de l'entretien si inexistant, sinon mise à jour → Réalisé
INSERT INTO entretiens (intervenant_id, statut, duree_reelle, notes)
SELECT id, 'Réalisé', 60, 'Formulaire pré-audit reçu le 26/06/2026. Ancienneté : 1 an et 6 mois.'
FROM intervenants WHERE prenom = 'Olivier' AND nom = 'WITTMANN'
ON CONFLICT (intervenant_id) DO UPDATE
SET statut = 'Réalisé',
    notes = COALESCE(entretiens.notes, '') || E'\nFormulaire pré-audit reçu le 26/06/2026.',
    updated_at = now();

-- 4. Création de l'assignation formulaire → statut reçu
INSERT INTO formulaire_assignation (formulaire_id, intervenant_id, date_envoi, date_reception, statut)
SELECT
  f.id,
  i.id,
  now() - interval '2 days',
  now(),
  'reçu'
FROM formulaires f, intervenants i
WHERE f.statut = 'publié'
  AND i.prenom = 'Olivier' AND i.nom = 'WITTMANN'
ON CONFLICT (formulaire_id, intervenant_id) DO UPDATE
SET statut = 'reçu', date_reception = now(), updated_at = now();

-- 5. Suppression des anciennes réponses si re-soumission
DELETE FROM formulaire_reponses
WHERE assignation_id = (
  SELECT fa.id FROM formulaire_assignation fa
  JOIN intervenants i ON fa.intervenant_id = i.id
  JOIN formulaires f ON fa.formulaire_id = f.id
  WHERE i.prenom = 'Olivier' AND i.nom = 'WITTMANN' AND f.statut = 'publié'
  LIMIT 1
);

-- 6. Insertion des réponses
-- Section A — Identification
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'identification', 'nom_prenom', '"Olivier WITTMANN"'::jsonb
FROM formulaire_assignation fa
JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Olivier' AND i.nom = 'WITTMANN' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'identification', 'poste_fonction', '"Poseur"'::jsonb
FROM formulaire_assignation fa
JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Olivier' AND i.nom = 'WITTMANN' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'identification', 'entite', '"HR Construction"'::jsonb
FROM formulaire_assignation fa
JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Olivier' AND i.nom = 'WITTMANN' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'identification', 'anciennete', '"1 an et 6 mois"'::jsonb
FROM formulaire_assignation fa
JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Olivier' AND i.nom = 'WITTMANN' AND f.statut = 'publié';

-- Section B — Cartographie des tâches
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'taches', 'tableau_taches', '[
  {"Tâche / Activité": "Chargement / déchargement du matériel dans les véhicules poseur", "Fréquence": "Quotidien", "Temps moyen": "1h", "Outil(s) utilisé(s)": ""},
  {"Tâche / Activité": "Gestion des stocks", "Fréquence": "Quotidien", "Temps moyen": "30 min", "Outil(s) utilisé(s)": ""},
  {"Tâche / Activité": "Prise de rendez-vous clients", "Fréquence": "Quotidien", "Temps moyen": "2h", "Outil(s) utilisé(s)": ""},
  {"Tâche / Activité": "Visite de chantiers", "Fréquence": "Quotidien", "Temps moyen": "5h", "Outil(s) utilisé(s)": ""},
  {"Tâche / Activité": "Organisation des plannings poseurs", "Fréquence": "Quotidien", "Temps moyen": "1h", "Outil(s) utilisé(s)": ""}
]'::jsonb
FROM formulaire_assignation fa
JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Olivier' AND i.nom = 'WITTMANN' AND f.statut = 'publié';

-- Section C — Inventaire des outils
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'outils', 'tableau_outils', '[
  {"Outil / Application": "Salesforce", "Usage principal": "CRM / suivi commercial", "Fréquence": "Quotidien", "Satisfaction (1-5)": ""},
  {"Outil / Application": "Email (Gmail / Outlook)", "Usage principal": "Communication avec les clients", "Fréquence": "", "Satisfaction (1-5)": "4"},
  {"Outil / Application": "WhatsApp", "Usage principal": "Échange avec les poseurs", "Fréquence": "", "Satisfaction (1-5)": "5"},
  {"Outil / Application": "Google Drive / Sheets", "Usage principal": "Coordination des équipes", "Fréquence": "", "Satisfaction (1-5)": "4"},
  {"Outil / Application": "Traceur GPS camionnettes", "Usage principal": "Suivi déplacements et organisation des tournées", "Fréquence": "", "Satisfaction (1-5)": "4"}
]'::jsonb
FROM formulaire_assignation fa
JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Olivier' AND i.nom = 'WITTMANN' AND f.statut = 'publié';

-- Section D — Frictions & Points de douleur
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'frictions', 'tache_sans_valeur', '"Réapprovisionnement des stocks sur Maily"'::jsonb
FROM formulaire_assignation fa
JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Olivier' AND i.nom = 'WITTMANN' AND f.statut = 'publié';

-- ============================================================
-- VÉRIFICATION
-- ============================================================
SELECT i.prenom, i.nom, i.statut_entretien, e.statut as statut_entretien_detail,
       fa.statut as statut_formulaire, fa.date_reception,
       COUNT(fr.id) as nb_reponses
FROM intervenants i
LEFT JOIN entretiens e ON e.intervenant_id = i.id
LEFT JOIN formulaire_assignation fa ON fa.intervenant_id = i.id
LEFT JOIN formulaire_reponses fr ON fr.assignation_id = fa.id
WHERE i.prenom = 'Olivier' AND i.nom = 'WITTMANN'
GROUP BY i.prenom, i.nom, i.statut_entretien, e.statut, fa.statut, fa.date_reception;
