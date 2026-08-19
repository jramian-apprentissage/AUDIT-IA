-- ============================================================
-- PRÉPARATION ENTRETIEN — BANDURSKI Sara (Assistante administrative, Home Résine)
-- Formulaire envoyé mais PAS ENCORE REÇU (0 réponse) — questions
-- couvrent donc aussi l'identification de base.
-- Contexte croisé : entretien Mathieu (26/06) et entretien Brice (03/07,
-- qui a dit "c'est ma collègue, la personne que vous allez voir cet
-- après-midi" à propos du suivi GPS).
-- ============================================================

-- Questions structurées en 5 blocs (~38 min)
INSERT INTO syntheses_ia (intervenant_id, questions_generees, questions_generees_at)
SELECT i.id, '{
  "questions": [
    "[Bloc 1 — Identification & journée type · 8 min] Pouvez-vous vous présenter rapidement : depuis combien de temps chez Home Résine, et sur quel périmètre exactement — administratif, RH, paie ? Décrivez-moi votre journée type, dans l''ordre, depuis votre arrivée le matin.",
    "[Bloc 1] Vous travaillez avec Anne GROSS sur la partie RH — comment vous répartissez-vous les sujets entre vous deux ? Qui fait quoi ?",
    "[Bloc 2 — Pointage GPS & Géolocalisation Pro · 12 min] Mathieu m''a décrit votre process de pointage : chaque matin vous regardez l''heure d''arrivée des ouvriers sur le chantier via Géolocalisation Pro, vous vérifiez s''ils ont pris la camionnette pour aller manger (dans ce cas -1h, sinon -20 min de pause). Vous pouvez me montrer ça concrètement, par partage d''écran ?",
    "[Bloc 2] Ce pointage, vous le faites pour combien d''ouvriers et ça vous prend combien de temps chaque semaine ?",
    "[Bloc 2] Une fois le pointage fait, qu''est-ce que vous en faites ? Ça part où, sous quelle forme ?",
    "[Bloc 2] Mathieu a mentionné que les ouvriers ''trichent systématiquement'' en notant l''heure où ils partent de chez eux plutôt que l''heure d''arrivée réelle sur le chantier — vous confirmez ? Comment vous détectez et corrigez ces écarts aujourd''hui ?",
    "[Bloc 3 — Fiches de paie · 8 min] Vous récapitulez les informations pour l''expert-comptable chaque mois (heures, jours fériés, arrêts maladie) — décrivez-moi ce process de A à Z.",
    "[Bloc 3] Mathieu a proposé de tester la génération automatique de 3 à 5 fiches de paie pour les comparer à celles du comptable — qu''est-ce que vous en pensez ? Qu''est-ce qui vous semble le plus risqué à automatiser dans ce process ?",
    "[Bloc 3] Les frais de déplacement (hôtel vs retour à domicile) — comment vous savez qui a découché et qui est rentré chez soi ? C''est déclaratif ou vous avez une source fiable ?",
    "[Bloc 4 — Autres outils & tâches administratives · 6 min] En dehors de Géolocalisation Pro, quels outils utilisez-vous au quotidien ? Salesforce, Excel, autre chose ?",
    "[Bloc 4] Y a-t-il une tâche récurrente qui vous prend beaucoup de temps sans vraiment apporter de valeur ?",
    "[Bloc 5 — Vision IA & adhésion · 4 min] Avez-vous déjà utilisé des outils d''IA (ChatGPT, Gemini, autre) ? Si oui, pour quoi ?",
    "[Bloc 5] Si une IA pouvait vous aider sur une seule chose demain matin, ce serait quoi ?"
  ]
}'::jsonb, now()
FROM intervenants i
WHERE i.prenom = 'Sara' AND i.nom = 'BANDURSKI'
ON CONFLICT (intervenant_id) DO UPDATE
SET questions_generees = EXCLUDED.questions_generees, questions_generees_at = now(), updated_at = now();

-- Vérification
SELECT i.prenom, i.nom, i.poste, i.statut_entretien, fa.statut as formulaire,
       jsonb_array_length(s.questions_generees->'questions') as nb_questions
FROM intervenants i
LEFT JOIN formulaire_assignation fa ON fa.intervenant_id = i.id
LEFT JOIN syntheses_ia s ON s.intervenant_id = i.id
WHERE i.prenom = 'Sara' AND i.nom = 'BANDURSKI';
