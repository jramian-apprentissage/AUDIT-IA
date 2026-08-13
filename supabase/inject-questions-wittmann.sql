-- ============================================================
-- PRÉPARATION ENTRETIEN — WITTMANN Olivier (Chef de chantier / Poseur, Nancy-Épinal)
-- Entretien planifié pour DEMAIN. Questions croisées avec :
-- - son propre formulaire (stocks sur "Maily", planning, RDV clients)
-- - l'entretien Mathieu du 26/06 (statut poseur = astuce chômage intempérie,
--   Olivier = seule exception au planning géré par Jonathan Worms,
--   "Maily" totalement inconnu de la direction)
-- - l'entretien Brice du 03/07 (process foire papier → Salesforce)
-- ============================================================

-- 1. Entretien → Planifié demain 9h
UPDATE intervenants SET statut_entretien = 'Planifié', updated_at = now()
WHERE prenom = 'Olivier' AND nom = 'WITTMANN';

INSERT INTO entretiens (intervenant_id, statut, date_prevue, duree_prevue)
SELECT id, 'Planifié', date_trunc('day', now()) + interval '1 day' + interval '9 hours', 60
FROM intervenants WHERE prenom = 'Olivier' AND nom = 'WITTMANN'
ON CONFLICT (intervenant_id) DO UPDATE
SET statut = 'Planifié', date_prevue = date_trunc('day', now()) + interval '1 day' + interval '9 hours', updated_at = now();

-- 2. Questions structurées en 5 blocs (~40 min)
INSERT INTO syntheses_ia (intervenant_id, questions_generees, questions_generees_at)
SELECT i.id, '{
  "questions": [
    "[Bloc 1 — Son vrai poste · 6 min] Mathieu m''a expliqué que votre statut ''poseur'' sur le papier est en fait administratif — pour pouvoir vous mettre en chômage intempéries l''hiver — mais que dans les faits vous êtes responsable technique / chef de chantier du secteur Nancy-Épinal. Ça correspond à ce que vous vivez au quotidien ?",
    "[Bloc 1] Décrivez-moi votre journée type — dans l''ordre, du matin jusqu''au soir.",
    "[Bloc 1] Vous êtes la seule exception au planning que gère Jonathan Worms pour toute la France — vous faites votre propre planning pour Nancy-Épinal. Pourquoi cette exception, et comment vous le construisez concrètement ?",
    "[Bloc 2 — Chargement, stocks & l''outil ''Maily'' · 10 min] Dans votre formulaire vous avez noté le réapprovisionnement des stocks sur un outil ''Maily'' — ni Mathieu ni Jonathan ne connaissent cet outil. Vous pouvez me montrer comment vous l''utilisez (partage d''écran) ? D''où il vient, qui vous l''a donné ou pourquoi vous l''avez choisi ?",
    "[Bloc 2] Mathieu pensait que le suivi des stocks passait par Marc (parti au Luxembourg) qui appelait chaque dépôt pour compter les palettes. Comment ça se passe réellement pour vous à Nancy depuis son départ ?",
    "[Bloc 2] Le chargement/déchargement du matériel dans les véhicules (1h/jour) — vous partez d''une liste, d''un bon de commande, ou vous savez déjà ce qu''il faut par expérience ?",
    "[Bloc 3 — Plannings, RDV clients & visites de chantier · 8 min] Vous passez 5h/jour en visite de chantiers et 1h à organiser les plannings des poseurs — comment vous décidez qui va où et quel jour ?",
    "[Bloc 3] La prise de RDV clients (2h/jour) — les demandes arrivent d''où ? Vous les avez déjà en main via Salesforce ou on vous les transmet autrement ?",
    "[Bloc 3] Mathieu imagine qu''une IA pourrait appeler les clients pour caler les interventions (''on peut intervenir mercredi, il faut une prise de courant...'') et vous laisser gérer les cas particuliers (meubles à déplacer, garde-corps à déposer). Qu''est-ce que vous en pensez pour votre secteur ?",
    "[Bloc 4 — Terrain, imprévus & remontées · 8 min] Sur un chantier, qu''est-ce qui vous fait perdre le plus de temps ou vous complique la vie le plus souvent ?",
    "[Bloc 4] Quand un imprévu arrive sur chantier (accès compliqué, matériel manquant, client absent), comment vous le gérez et comment ça remonte à Nancy/au siège ?",
    "[Bloc 4] Vous travaillez avec des ouvriers sur le terrain — comment se passe le pointage de leurs heures ? Vous en avez la responsabilité ou c''est centralisé ailleurs ?",
    "[Bloc 5 — Vision IA & adhésion · 6 min] Aujourd''hui vous utilisez quoi comme outils numériques au quotidien, en dehors de Maily ? Téléphone, Salesforce, autre ?",
    "[Bloc 5] Si vous pouviez ne plus jamais faire une seule tâche de votre liste — laquelle ce serait ?",
    "[Bloc 5] Si une IA pouvait vous aider sur une seule chose demain matin, ce serait quoi ?"
  ]
}'::jsonb, now()
FROM intervenants i
WHERE i.prenom = 'Olivier' AND i.nom = 'WITTMANN'
ON CONFLICT (intervenant_id) DO UPDATE
SET questions_generees = EXCLUDED.questions_generees, questions_generees_at = now(), updated_at = now();

-- Vérification
SELECT i.prenom, i.nom, i.poste, i.statut_entretien, e.date_prevue,
       jsonb_array_length(s.questions_generees->'questions') as nb_questions
FROM intervenants i
LEFT JOIN entretiens e ON e.intervenant_id = i.id
LEFT JOIN syntheses_ia s ON s.intervenant_id = i.id
WHERE i.prenom = 'Olivier' AND i.nom = 'WITTMANN';
