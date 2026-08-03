-- ============================================================
-- PRÉPARATION ENTRETIEN — PELISSIER Franck (Directeur Commercial)
-- Entretien planifié aujourd'hui. Questions croisées avec les
-- entretiens de Mathieu (26/06), Brice (03/07), Marion (03/07),
-- Nicolas (07/07).
-- ============================================================

-- 1. Entretien → Planifié aujourd'hui 10h
UPDATE intervenants SET statut_entretien = 'Planifié', updated_at = now()
WHERE prenom = 'Franck' AND nom = 'PELISSIER';

INSERT INTO entretiens (intervenant_id, statut, date_prevue, duree_prevue)
SELECT id, 'Planifié', date_trunc('day', now()) + interval '10 hours', 60
FROM intervenants WHERE prenom = 'Franck' AND nom = 'PELISSIER'
ON CONFLICT (intervenant_id) DO UPDATE
SET statut = 'Planifié', date_prevue = date_trunc('day', now()) + interval '10 hours', updated_at = now();

-- 2. Questions structurées en 6 blocs (~43 min)
INSERT INTO syntheses_ia (intervenant_id, questions_generees, questions_generees_at)
SELECT i.id, '{
  "questions": [
    "[Bloc 1 — Sa journée réelle · 7 min] Décrivez-moi votre journée type — dans l''ordre, qu''est-ce que vous faites en arrivant le matin ?",
    "[Bloc 1] La réunion commerciale de 9h que Mathieu m''a décrite — comment elle se déroule concrètement ? Qui participe, sur quels supports, et qu''est-ce qui en sort ?",
    "[Bloc 1] Vous avez noté ''gestion des services 3-5h par jour au bureau'' dans le formulaire — ça recouvre quoi exactement ? Détaillez-moi ces heures.",
    "[Bloc 2 — CR journalier & coaching vendeurs · 10 min] L''heure d''appels quotidienne avec les vendeurs — c''est un compte rendu chiffré, du coaching, ou les deux ? Vous appelez qui, et pourquoi eux ?",
    "[Bloc 2] Mathieu dit que 80% des RDVs sont vendables mais que le taux de transformation est à 35%. Vous êtes d''accord avec ces chiffres ? D''où vient l''écart selon vous ?",
    "[Bloc 2] Comment vous savez ce qui s''est vraiment dit dans un rendez-vous vendeur-client ? Vous vous basez uniquement sur ce que le vendeur raconte ?",
    "[Bloc 2] Mathieu propose que l''IA fasse le compte rendu chiffré et que vous gardiez le coaching en réunion à 9h — qu''est-ce que vous en pensez ? Qu''est-ce que vous feriez de l''heure libérée ?",
    "[Bloc 3 — Le SMS récap & les données · 8 min] Nicolas m''a montré qu''il reçoit chaque matin votre SMS avec le récap des ventes par commercial (montant, source) — vous construisez ce récap comment ? Depuis quelles sources, et combien de temps ça vous prend ?",
    "[Bloc 3] Ce même récap est ressaisi par Nicolas dans son tableau ET par Marion/Émilie dans le document CA 2026 — vous savez combien de personnes retraitent votre SMS chaque matin ? Pourquoi un SMS et pas Salesforce ?",
    "[Bloc 3] Les RDVs de vos vendeurs sont dans Google Agenda (un agenda par commercial/zone) — pourquoi Google Agenda et pas Salesforce ? Qui les saisit ?",
    "[Bloc 4 — Recrutement & appels · 7 min] Le recrutement vendeurs (1h/RDV) — décrivez le process : d''où viennent les CV, combien d''appels pour joindre un candidat, combien aboutissent ?",
    "[Bloc 4] Mathieu évoquait vos sessions de 20 appels sans réponse — si une machine composait les numéros et ne vous passait que les gens qui décrochent, ça changerait quoi pour vous ?",
    "[Bloc 4] Brice bascule vers vos commerciaux les leads qu''il n''arrive pas à joindre après 4-5 tentatives — que deviennent ces leads ensuite ? Qui suit leur relance et où ?",
    "[Bloc 5 — Pilotage & outils · 6 min] Le traceur GPS ''suivi vendeur'' que vous avez noté — vous l''utilisez pour quoi concrètement ? À quelle fréquence et via quel écran ?",
    "[Bloc 5] Vous avez mis Salesforce 4/5 dans le formulaire — qu''est-ce qui vous manque pour mettre 5 ? Qu''est-ce que vous n''arrivez pas à faire avec ?",
    "[Bloc 5] Votre contact quasi-quotidien avec Mathieu — vous lui remontez quoi, sous quelle forme ? Qu''est-ce qu''il vous demande le plus souvent ?",
    "[Bloc 6 — Vision IA & adhésion · 5 min] Vous avez répondu ''RAS'' à toute la section frictions du formulaire — vraiment aucun point de douleur ? Qu''est-ce qui vous agace le plus dans une semaine type ?",
    "[Bloc 6] Vous avez déjà utilisé l''IA pour créer des visuels — quel outil, et pour quoi faire ?",
    "[Bloc 6] Votre souhait formulaire : l''IA pour la gestion et l''organisation du planning — planning de qui, et à quoi ressemblerait l''outil idéal ?"
  ]
}'::jsonb, now()
FROM intervenants i
WHERE i.prenom = 'Franck' AND i.nom = 'PELISSIER'
ON CONFLICT (intervenant_id) DO UPDATE
SET questions_generees = EXCLUDED.questions_generees, questions_generees_at = now(), updated_at = now();

-- Vérification
SELECT i.prenom, i.nom, i.statut_entretien, e.date_prevue,
       jsonb_array_length(s.questions_generees->'questions') as nb_questions
FROM intervenants i
LEFT JOIN entretiens e ON e.intervenant_id = i.id
LEFT JOIN syntheses_ia s ON s.intervenant_id = i.id
WHERE i.prenom = 'Franck' AND i.nom = 'PELISSIER';
