-- ============================================================
-- QUESTIONS D'ENTRETIEN PERSONNALISÉES
-- GENTILE Brice + MOUTON Marion
-- Générées manuellement depuis les formulaires reçus
-- + contexte entretien Mathieu GROSS du 26/06/2026
-- ============================================================


-- ============================================================
-- BRICE GENTILE — Prospecteur, Distri Résine, 7 ans
-- Contexte : 8h/jour d'appels, abandonne après 4 tentatives,
-- "Fausse demande de Projet" comme friction principale
-- ============================================================

INSERT INTO syntheses_ia (intervenant_id, questions_generees, questions_generees_at)
SELECT
  i.id,
  '{
    "questions": [
      "Sur une journée type, combien d''appels émettez-vous et quel est votre taux de réponse moyen ? Combien de temps passez-vous à attendre que quelqu''un décroche ?",
      "Quand un prospect ne répond pas après plusieurs tentatives, à quel moment décidez-vous d''abandonner définitivement le lead ? Que se passe-t-il dans Salesforce à ce moment-là ?",
      "Vous avez mentionné les ''fausses demandes de projet'' comme tâche répétitive. Pouvez-vous décrire concrètement ce phénomène ? Comment les détectez-vous et combien de temps vous font-elles perdre par semaine ?",
      "Comment qualifiez-vous un lead entrant avant de positionner un RDV commercial ? Quels critères vous font décider qu''un prospect vaut la peine d''insister 3 ou 4 fois ?",
      "Comment utilisez-vous Salesforce et l''Agenda au quotidien pour votre prospection ? Est-ce que les deux sont synchronisés ou devez-vous saisir les infos dans les deux outils ?",
      "Les présences sur les foires représentent une tâche mensuelle — comment les leads récoltés sur foire sont-ils gérés ensuite ? Qui fait le suivi et avec quel outil ?",
      "Si une IA pouvait rappeler automatiquement les prospects qui ne répondent pas (après vos 4 tentatives), qu''est-ce que vous feriez de ce temps libéré ? Sur quoi préféreriez-vous vous concentrer ?",
      "Avez-vous un script d''appel standardisé ou chaque appel est-il différent selon le profil du prospect ? Qu''est-ce qui marche le mieux pour obtenir un RDV ?"
    ]
  }'::jsonb,
  now()
FROM intervenants i
WHERE i.prenom = 'Brice' AND i.nom = 'GENTILE'
ON CONFLICT (intervenant_id) DO UPDATE
SET questions_generees = EXCLUDED.questions_generees,
    questions_generees_at = now(),
    updated_at = now();


-- ============================================================
-- MARION MOUTON — Assistante Commerciale, Distri Résine, 5 ans
-- Contexte : devis hors Salesforce (inconnu de Mathieu),
-- dossiers MAQ dans Numbers, photocopies RDC, IA pour affiches
-- ============================================================

INSERT INTO syntheses_ia (intervenant_id, questions_generees, questions_generees_at)
SELECT
  i.id,
  '{
    "questions": [
      "Vous faites les devis dans Google Sheets / Numbers plutôt que dans Salesforce — pourquoi ce choix ? Est-ce une limitation de Salesforce, un manque de formation, ou une préférence de l''équipe ?",
      "Une fois un devis finalisé, que se passe-t-il ? Comment est-il transmis au client, archivé et suivi jusqu''à la signature ou au refus ?",
      "''Inscrire les dossiers MAQ'' est une de vos tâches quotidiennes — pouvez-vous expliquer ce processus de A à Z ? Quelles informations y entrent, depuis quelle source, et qui consulte ces dossiers ensuite ?",
      "Vous avez mentionné les photocopies RDC comme tâche répétitive que vous aimeriez ne plus faire. De quels documents s''agit-il exactement ? Pourquoi n''est-il pas possible de les dématérialiser aujourd''hui ?",
      "La prise de RDV se fait via l''Agenda ET Salesforce — comment les deux sont-ils synchronisés ? Y a-t-il des doublons, des oublis ou des conflits entre les deux outils ?",
      "Pour les appels entrants, quelles informations capturez-vous et où exactement — dans Salesforce, sur papier, dans un fichier ? Qu''est-ce qui se perd le plus souvent dans ce flux ?",
      "Vous avez déjà utilisé l''IA pour créer des affiches de déstockage — quel outil avez-vous utilisé et comment ? Qu''est-ce qui vous a plu et qu''est-ce qui était encore limité ?",
      "Si vous pouviez automatiser une seule chose dans votre journée, laquelle choisiriez-vous en priorité et pourquoi ?"
    ]
  }'::jsonb,
  now()
FROM intervenants i
WHERE i.prenom = 'Marion' AND i.nom = 'MOUTON'
ON CONFLICT (intervenant_id) DO UPDATE
SET questions_generees = EXCLUDED.questions_generees,
    questions_generees_at = now(),
    updated_at = now();


-- ============================================================
-- VÉRIFICATION
-- ============================================================
SELECT i.prenom, i.nom, i.poste,
       s.questions_generees_at,
       jsonb_array_length(s.questions_generees->'questions') as nb_questions
FROM intervenants i
JOIN syntheses_ia s ON s.intervenant_id = i.id
WHERE (i.prenom = 'Brice' AND i.nom = 'GENTILE')
   OR (i.prenom = 'Marion' AND i.nom = 'MOUTON')
ORDER BY i.nom;
