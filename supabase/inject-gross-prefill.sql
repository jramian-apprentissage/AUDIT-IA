-- ============================================================
-- PRÉ-REMPLISSAGE FORMULAIRE — GROSS Mathieu (Gérant)
-- Sources : réunion cadrage 12/06/2026 + entretien Jim 26/06/2026
-- Objectif : alimenter l'IA pour générer des questions personnalisées
-- ============================================================

-- 1. Assignation formulaire → statut "envoyé"
INSERT INTO formulaire_assignation (formulaire_id, intervenant_id, date_envoi, date_reception, statut)
SELECT f.id, i.id, now(), null, 'envoyé'
FROM formulaires f, intervenants i
WHERE f.statut = 'publié' AND i.prenom = 'Mathieu' AND i.nom = 'GROSS'
ON CONFLICT (formulaire_id, intervenant_id) DO UPDATE
SET statut = 'envoyé', updated_at = now();

-- 2. Suppression anciennes réponses
DELETE FROM formulaire_reponses
WHERE assignation_id = (
  SELECT fa.id FROM formulaire_assignation fa
  JOIN intervenants i ON fa.intervenant_id = i.id
  JOIN formulaires f ON fa.formulaire_id = f.id
  WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS' AND f.statut = 'publié'
  LIMIT 1
);

-- 3. Section A — Identification
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
SELECT fa.id, 'identification', 'anciennete', '"Fondateur — plus de 10 ans"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS' AND f.statut = 'publié';

-- 4. Section B — Tâches (entretien 26/06 : 50% réponses aux questions, 50% réflexion macro)
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'taches', 'tableau_taches', '[
  {"Tâche / Activité": "Répondre aux questions des collaborateurs (validation décisions financières et légales)", "Fréquence": "Quotidien", "Temps moyen": "50% du temps", "Outil(s) utilisé(s)": "Téléphone, WhatsApp"},
  {"Tâche / Activité": "Réflexion stratégique macro : nouveaux secteurs, nouveaux produits, analyse moyen/long terme", "Fréquence": "Quotidien", "Temps moyen": "50% du temps", "Outil(s) utilisé(s)": "Aucun outil — pas d''ordinateur personnel"},
  {"Tâche / Activité": "Contact journalier avec Franck Pelissier pour suivi commercial (RDVs, ventes, CA)", "Fréquence": "Quotidien", "Temps moyen": "", "Outil(s) utilisé(s)": "Téléphone"},
  {"Tâche / Activité": "Réunion bimestrielle avec Nicolas : analyse tableaux stats marketing (dépenses pub / RDVs / CA)", "Fréquence": "Tous les 2 mois", "Temps moyen": "", "Outil(s) utilisé(s)": "Tableaux envoyés par Nicolas"},
  {"Tâche / Activité": "Pilotage campagnes marketing (Google Ads, Facebook, SEO multi-sites)", "Fréquence": "Hebdo", "Temps moyen": "", "Outil(s) utilisé(s)": "Meta Business, Google Ads"},
  {"Tâche / Activité": "Développement stratégique : réseau franchisés, influencer marketing, exploitation groupe Facebook 650k", "Fréquence": "Mensuel", "Temps moyen": "", "Outil(s) utilisé(s)": "Facebook"}
]'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS' AND f.statut = 'publié';

-- 5. Section C — Outils (confirmés entretien 26/06)
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'outils', 'tableau_outils', '[
  {"Outil / Application": "Salesforce", "Usage principal": "CRM groupe — 10+ ans de data. Mathieu n''y est jamais allé lui-même. Géré par Anne et les commerciaux.", "Fréquence": "Quotidien (équipes)", "Satisfaction (1-5)": "3", "Commentaire": "Sous-exploité — veut le connecter à l''IA pour automatiser stats et comptes rendus"},
  {"Outil / Application": "Téléphone / WhatsApp", "Usage principal": "Communication équipe, validation décisions, contact Pelissier quotidien", "Fréquence": "Quotidien", "Satisfaction (1-5)": ""},
  {"Outil / Application": "Géolocalisation Pro (ex-Quartix)", "Usage principal": "Suivi GPS camionnettes et pointage heures ouvriers — géré par Sarah", "Fréquence": "Quotidien", "Satisfaction (1-5)": "", "Commentaire": "Changement récent de prestataire (Quartix → Géolocalisation Pro)"},
  {"Outil / Application": "Meta Business Suite / Facebook", "Usage principal": "Campagnes pub + groupe 650 000 abonnés aménagement extérieur (non monétisé)", "Fréquence": "Hebdo", "Satisfaction (1-5)": ""},
  {"Outil / Application": "Google Ads", "Usage principal": "Multi-sites pour auto-concurrence sur Google Ads", "Fréquence": "Hebdo", "Satisfaction (1-5)": ""},
  {"Outil / Application": "Tableaux Excel / Google Sheets", "Usage principal": "Stats marketing hebdo envoyés par Nicolas — seul outil de pilotage de Mathieu", "Fréquence": "Bimensuel (lecture)", "Satisfaction (1-5)": "2", "Commentaire": "Trop manuels, trop lents — veut automatisation IA"}
]'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS' AND f.statut = 'publié';

-- 6. Section D — Frictions (nombreuses identifiées sur toute l''équipe)
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'frictions', 'tache_sans_valeur',
  '"Répondre aux questions des collaborateurs qui ont déjà la réponse mais n''osent pas décider seuls. Représente 50% du temps de Mathieu — validations financières et légales bloquent l''autonomie de l''équipe."'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'frictions', 'perte_info',
  '"Pas de tableau de bord consolidé pour Mathieu (pas d''ordinateur personnel). Il reçoit les stats de Nicolas tous les 2 mois seulement. Les données sont dans Salesforce mais Mathieu n''y a jamais accès directement. Historique appels vendeurs non centralisé."'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'frictions', 'decisions_sans_info',
  '"Décisions stratégiques prises sans dashboard temps réel : ouverture de nouveaux secteurs, rentabilité par campagne pub, performance vendeurs. Groupe Facebook 650k abonnés jamais monétisé faute de méthode claire. Taux transformation vendeurs 35% alors que 80% des RDVs sont vendables — coaching insuffisant."'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'frictions', 'taches_repetitives',
  '"Sur toute l''équipe — identifiées par Mathieu lors de l''entretien :\n- Nicolas : tableaux stats marketing manuels (1-3h/semaine)\n- Pelissier : CR journalier vendeurs par téléphone (1h/jour)\n- Jonathan Worms : remplissage planning 18 équipes ouvriers tous les 2-3 jours (2h/jour)\n- Sarah : pointage GPS heures ouvriers manuellement chaque matin + recap fiche paie expert-comptable\n- Brice : leads abandonnés après 4 tentatives sans réponse\n- Marion : devis faits dans Numbers (hors Salesforce)\n- Olivier : gestion stocks via outil ''Maily'' inconnu de Mathieu"'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'frictions', 'info_introuvable',
  '"Rentabilité par commercial et par campagne en temps réel. Taux transformation par vendeur et par secteur. État des stocks sur les dépôts (Metz, Nancy, Reims, Strasbourg). Historique des appels clients non tracé dans Salesforce."'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS' AND f.statut = 'publié';

-- 7. Section E — Vision IA (très détaillée dans l''entretien)
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'ia', 'ia_une_chose',
  '"Objectif clair : doubler le CA avec le même personnel grâce à l''IA. Chaque collaborateur accompagné par un agent IA sur ses tâches répétitives. Cas d''usage prioritaires identifiés :\n1. Agent IA connecté Salesforce → stats auto (RDVs, CA, coût marketing, rentabilité)\n2. IA phoning → relancer les prospects que Brice abandonne après 4 tentatives\n3. IA planning → Jonathan Worms : appels automatiques clients pour remplir les plannings ouvriers\n4. IA pointage GPS → Sarah : calcul automatique heures ouvriers depuis Géolocalisation Pro\n5. IA CR vendeurs → Pelissier : automatiser les comptes rendus journaliers\n6. IA visuels → Nicolas : génération publi/posts depuis templates\nMathieu lui-même : sceptique sur apport IA pour sa réflexion stratégique (''transgresse les raisonnements classiques'') mais ouvert à tester."'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'ia', 'ia_usage_actuel',
  '"Non — n''a jamais utilisé l''IA. A testé des IA vocales gratuites, les a trouvées ''très stupides''. Prêt à tester une IA payante. Conscient que l''IA gratuite ≠ IA professionnelle. N''a pas d''ordinateur personnel — tout passe par téléphone."'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
JOIN formulaires f ON fa.formulaire_id = f.id
WHERE i.prenom = 'Mathieu' AND i.nom = 'GROSS' AND f.statut = 'publié';

INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'ia', 'donnees_partagees',
  '"Tableaux stats marketing bimestriels (Nicolas → Mathieu) : dépenses pub par réseau/foire, nombre RDVs, nombre ventes, CA, coût marketing. Données Salesforce 10 ans (jamais exploitées par Mathieu directement). Données GPS Géolocalisation Pro (ouvriers BTP). Groupe Facebook 650 000 abonnés aménagement extérieur. Réseau franchisés (1 franchisé Dijon). Fiches de paie : Sarah → expert-comptable."'::jsonb
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
