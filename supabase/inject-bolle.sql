-- ============================================================
-- INJECTION FORMULAIRE — BOLLE Nicolas
-- Formulaire Pré-Audit reçu le 26/06/2026
-- ============================================================

-- 1. Statut intervenant → Réalisé
UPDATE intervenants
SET statut_entretien = 'Réalisé', updated_at = now()
WHERE prenom = 'Nicolas' AND nom = 'BOLLE';

-- 2. Entretien → Réalisé
INSERT INTO entretiens (intervenant_id, statut, duree_reelle, notes)
SELECT id, 'Réalisé', 45, 'Formulaire pré-audit reçu le 26/06/2026. Ancienneté : 4 ans et demi. Profil digital très avancé.'
FROM intervenants WHERE prenom = 'Nicolas' AND nom = 'BOLLE'
ON CONFLICT (intervenant_id) DO UPDATE
SET statut = 'Réalisé',
    notes = COALESCE(entretiens.notes, '') || E'\nFormulaire pré-audit reçu le 26/06/2026.',
    updated_at = now();

-- 3. Assignation formulaire → reçu
INSERT INTO formulaire_assignation (formulaire_id, intervenant_id, date_envoi, date_reception, statut)
SELECT f.id, i.id, now() - interval '2 days', now(), 'reçu'
FROM formulaires f, intervenants i
WHERE f.statut = 'publié' AND i.prenom = 'Nicolas' AND i.nom = 'BOLLE'
ON CONFLICT (formulaire_id, intervenant_id) DO UPDATE
SET statut = 'reçu', date_reception = now(), updated_at = now();

-- 4. Suppression anciennes réponses
DELETE FROM formulaire_reponses
WHERE assignation_id = (
  SELECT fa.id FROM formulaire_assignation fa
  JOIN intervenants i ON fa.intervenant_id = i.id
  JOIN formulaires f ON fa.formulaire_id = f.id
  WHERE i.prenom = 'Nicolas' AND i.nom = 'BOLLE' AND f.statut = 'publié'
  LIMIT 1
);

-- 5. Section A — Identification
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'identification', 'nom_prenom', '"Nicolas Bolle"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Nicolas' AND i.nom = 'BOLLE' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'identification', 'poste_fonction', '"Communication et Marketing"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Nicolas' AND i.nom = 'BOLLE' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'identification', 'entite', '"Distri Résine"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Nicolas' AND i.nom = 'BOLLE' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'identification', 'anciennete', '"4 ans et demi"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Nicolas' AND i.nom = 'BOLLE' AND f.statut = 'publié';

-- Section B — Tâches
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'taches', 'tableau_taches', '[
  {"Tâche / Activité": "Gestion des campagnes digitales (Meta Ads / Google Ads)", "Fréquence": "Quotidien", "Temps moyen": "1h", "Outil(s) utilisé(s)": "Meta Business Suite, Google Ads"},
  {"Tâche / Activité": "Suivi des activités prospects/clients (commentaires, avis...)", "Fréquence": "Quotidien", "Temps moyen": "1-2h", "Outil(s) utilisé(s)": "Fiche Google, Facebook, Instagram, Guest Suite, Solocal, Trustpilot Business"},
  {"Tâche / Activité": "Récupération et analyse statistiques / résultats", "Fréquence": "Quotidien", "Temps moyen": "1-2h", "Outil(s) utilisé(s)": "Microsoft Excel, Google Ads, Zapier, Salesforce, Meta Business, Google Sheet, One Drive, Google Agenda"},
  {"Tâche / Activité": "Suivi des sites web / Madagascar", "Fréquence": "Quotidien", "Temps moyen": "1h", "Outil(s) utilisé(s)": "WhatsApp, WordPress, Tag Manager, Google Search Console, Analytics, Discord, Teams, Google Meet"},
  {"Tâche / Activité": "Création / Gestion des documents / stock", "Fréquence": "Hebdo", "Temps moyen": "Variable", "Outil(s) utilisé(s)": "Canva, Suite Adobe, Gemini, Digitofsett / Helloprint"},
  {"Tâche / Activité": "Prise de photos / vidéos / montages vidéo", "Fréquence": "Hebdo", "Temps moyen": "Variable", "Outil(s) utilisé(s)": "Suite Adobe, Smartphone, Gemini"}
]'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Nicolas' AND i.nom = 'BOLLE' AND f.statut = 'publié';

-- Section C — Outils
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'outils', 'tableau_outils', '[
  {"Outil / Application": "Salesforce", "Usage principal": "CRM / suivi commercial", "Fréquence": "Quotidien", "Satisfaction (1-5)": "4", "Commentaire": "Utilisation de 10% de Salesforce à peine — logiciel complet mais complexe"},
  {"Outil / Application": "Email (Gmail / Outlook)", "Usage principal": "Envoi / réception mail, suivi agenda Outlook", "Fréquence": "Quotidien", "Satisfaction (1-5)": "4", "Commentaire": "Switch Google / Outlook n''est pas tjs pertinent"},
  {"Outil / Application": "WhatsApp", "Usage principal": "", "Fréquence": "", "Satisfaction (1-5)": ""},
  {"Outil / Application": "Google Drive / Sheets", "Usage principal": "Stockage / récup données", "Fréquence": "Quotidien", "Satisfaction (1-5)": "5", "Commentaire": "Environnement Google pratique"},
  {"Outil / Application": "Wordpress / OVH", "Usage principal": "Suivi sites web", "Fréquence": "Hebdo", "Satisfaction (1-5)": "5"},
  {"Outil / Application": "Suite Adobe", "Usage principal": "Création img/vidéo", "Fréquence": "Hebdo", "Satisfaction (1-5)": "5", "Commentaire": "Il n''y a pas mieux"},
  {"Outil / Application": "Guest Suite / Solocal", "Usage principal": "Suivi des avis", "Fréquence": "Quotidien", "Satisfaction (1-5)": "4", "Commentaire": "Manque d''automatisation"},
  {"Outil / Application": "Brevo mailing", "Usage principal": "Envoi newsletter", "Fréquence": "Hebdo", "Satisfaction (1-5)": "4"}
]'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Nicolas' AND i.nom = 'BOLLE' AND f.statut = 'publié';

-- Section D — Frictions
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'frictions', 'tache_sans_valeur',
  '"Suivi des avis clients (récupération fiche satisfaction puis envoi des demandes d''avis)"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Nicolas' AND i.nom = 'BOLLE' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'frictions', 'perte_info',
  '"Informations précises des contacts clients (appels / mails). Manque de pointage sur Salesforce (ex : résumé d''appel)"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Nicolas' AND i.nom = 'BOLLE' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'frictions', 'decisions_sans_info', '"RAS"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Nicolas' AND i.nom = 'BOLLE' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'frictions', 'taches_repetitives',
  '"Certaines récupérations sur mon Excel de stats. Ex : dépenses ads, prospects quotidien par zone"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Nicolas' AND i.nom = 'BOLLE' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'frictions', 'info_introuvable',
  '"Nombre de fois où le client a contacté. Récupérer les infos des appels (demande obligatoire aux collègues pour suivi des avis négatifs). Oubli de ce qui s''est dit au téléphone si ancien..."'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Nicolas' AND i.nom = 'BOLLE' AND f.statut = 'publié';

-- Section E — Vision IA
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'ia', 'ia_une_chose',
  '"Suivi et analyse des statistiques marketing. Données des axes d''amélioration résultats marketing. Automatisation de certaines tâches répétitives au quotidien"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Nicolas' AND i.nom = 'BOLLE' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'ia', 'ia_usage_actuel',
  '"Oui — ChatGPT et Gemini pour génération d''image, support technique, résolution de problèmes, inspiration..."'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Nicolas' AND i.nom = 'BOLLE' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'ia', 'donnees_partagees',
  '"Statistiques marketing : coût contact, coût marketing. Nombre de contacts quotidien par source... Avis négatifs"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Nicolas' AND i.nom = 'BOLLE' AND f.statut = 'publié';

-- ============================================================
-- VÉRIFICATION
-- ============================================================
SELECT i.prenom, i.nom, i.statut_entretien, e.statut as entretien_statut,
       fa.statut as formulaire_statut, COUNT(fr.id) as nb_reponses
FROM intervenants i
LEFT JOIN entretiens e ON e.intervenant_id = i.id
LEFT JOIN formulaire_assignation fa ON fa.intervenant_id = i.id
LEFT JOIN formulaire_reponses fr ON fr.assignation_id = fa.id
WHERE i.prenom = 'Nicolas' AND i.nom = 'BOLLE'
GROUP BY i.prenom, i.nom, i.statut_entretien, e.statut, fa.statut;
