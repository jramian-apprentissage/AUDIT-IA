-- ============================================================
-- INJECTION FORMULAIRE — BANDURSKI Sara
-- Formulaire Pré-Audit reçu (scanné manuscrit)
-- ============================================================

-- 1. Assignation formulaire → reçu
UPDATE formulaire_assignation
SET statut = 'reçu', date_reception = now(), updated_at = now()
WHERE intervenant_id = (SELECT id FROM intervenants WHERE prenom = 'Sara' AND nom = 'BANDURSKI');

-- 2. Suppression anciennes réponses si re-soumission
DELETE FROM formulaire_reponses
WHERE assignation_id = (
  SELECT fa.id FROM formulaire_assignation fa
  JOIN intervenants i ON fa.intervenant_id = i.id
  WHERE i.prenom = 'Sara' AND i.nom = 'BANDURSKI'
  LIMIT 1
);

-- 3. Section A — Identification
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'identification', q.qid, q.rep::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
CROSS JOIN (VALUES
  ('nom_prenom', '"Sara BANDURSKI"'),
  ('poste_fonction', '"Assistante Administratif"'),
  ('entite', '"Home Résine"'),
  ('anciennete', '"3 ans et 3 mois"')
) AS q(qid, rep)
WHERE i.prenom = 'Sara' AND i.nom = 'BANDURSKI';

-- 4. Section B — Tâches
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'taches', 'tableau_taches', '[
  {"Tâche / Activité": "Standard téléphonique", "Fréquence": "Quotidien", "Temps moyen": "8h", "Outil(s) utilisé(s)": "Téléphone"},
  {"Tâche / Activité": "Facturation", "Fréquence": "Quotidien", "Temps moyen": "3h", "Outil(s) utilisé(s)": "Salesforce"},
  {"Tâche / Activité": "Dossiers de pose", "Fréquence": "Hebdo", "Temps moyen": "1h", "Outil(s) utilisé(s)": "Salesforce"},
  {"Tâche / Activité": "SAV", "Fréquence": "Quotidien", "Temps moyen": "6h", "Outil(s) utilisé(s)": "Salesforce, mail, téléphone"},
  {"Tâche / Activité": "Paie", "Fréquence": "Hebdo", "Temps moyen": "8h", "Outil(s) utilisé(s)": "Excel"},
  {"Tâche / Activité": "Pointage", "Fréquence": "Hebdo", "Temps moyen": "8h", "Outil(s) utilisé(s)": "Excel"},
  {"Tâche / Activité": "Gestion du courrier", "Fréquence": "Quotidien", "Temps moyen": "8h", "Outil(s) utilisé(s)": ""}
]'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
WHERE i.prenom = 'Sara' AND i.nom = 'BANDURSKI';

-- 5. Section C — Outils
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'outils', 'tableau_outils', '[
  {"Outil / Application": "Salesforce", "Usage principal": "CRM / suivi commercial", "Fréquence": "Quotidien", "Satisfaction (1-5)": "4"},
  {"Outil / Application": "Email (Gmail / Outlook)", "Usage principal": "Mail", "Fréquence": "Quotidien", "Satisfaction (1-5)": "4"},
  {"Outil / Application": "WhatsApp", "Usage principal": "Contact poseurs", "Fréquence": "Quotidien", "Satisfaction (1-5)": "5"},
  {"Outil / Application": "Google Drive / Sheets", "Usage principal": "Suivi des heures", "Fréquence": "Hebdo", "Satisfaction (1-5)": "4"},
  {"Outil / Application": "Traceur GPS camionnettes", "Usage principal": "", "Fréquence": "Quotidien", "Satisfaction (1-5)": "4"}
]'::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
WHERE i.prenom = 'Sara' AND i.nom = 'BANDURSKI';

-- 6. Section D — Frictions
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'frictions', q.qid, q.rep::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
CROSS JOIN (VALUES
  ('tache_sans_valeur', '"Téléphone"'),
  ('perte_info', '"Entre les services"'),
  ('decisions_sans_info', '"Réponses clients"'),
  ('taches_repetitives', '"Téléphone"'),
  ('info_introuvable', '"Demande SAV"')
) AS q(qid, rep)
WHERE i.prenom = 'Sara' AND i.nom = 'BANDURSKI';

-- 7. Section E — Vision IA
INSERT INTO formulaire_reponses (assignation_id, section_id, question_id, reponse)
SELECT fa.id, 'ia', q.qid, q.rep::jsonb
FROM formulaire_assignation fa JOIN intervenants i ON fa.intervenant_id = i.id
CROSS JOIN (VALUES
  ('ia_une_chose', '"Le standard téléphonique"'),
  ('ia_usage_actuel', '"Oui, ChatGPT"'),
  ('donnees_partagees', '"Les dossiers clients"')
) AS q(qid, rep)
WHERE i.prenom = 'Sara' AND i.nom = 'BANDURSKI';

-- 8. Questions d'entretien — mises à jour avec les données réelles du formulaire
INSERT INTO syntheses_ia (intervenant_id, questions_generees, questions_generees_at)
SELECT i.id, '{
  "questions": [
    "[Bloc 1 — Journée type & répartition du temps · 8 min] Décrivez-moi votre journée type — dans l''ordre, qu''est-ce que vous faites en arrivant le matin ?",
    "[Bloc 1] Dans votre formulaire, vous indiquez 8h sur le standard, 3h sur la facturation, 6h sur le SAV et 8h sur le courrier, tous en quotidien — sur une journée de 8h, comment ça s''articule concrètement ? Ce sont des tâches en parallèle, ou ces heures représentent autre chose (un total hebdo par exemple) ?",
    "[Bloc 1] Vous travaillez avec Anne GROSS sur la partie RH — comment vous répartissez-vous les sujets entre vous deux ?",
    "[Bloc 2 — Standard téléphonique · 8 min] Le standard téléphonique — c''est la tâche que vous avez citée deux fois comme sans valeur ET comme tâche répétitive à éliminer. Qu''est-ce qui vous pèse le plus dedans ? Quel volume d''appels par jour, et quelle proportion nécessite vraiment votre intervention ?",
    "[Bloc 2] Vous avez répondu ''le standard'' à la question ''si l''IA pouvait vous aider sur une seule chose'' — vous imaginez ça comment concrètement ? Un premier filtre, une IA qui décroche, autre chose ?",
    "[Bloc 3 — SAV & pertes d''information · 8 min] Le SAV vous prend 6h par jour — décrivez-moi le traitement d''une demande SAV de bout en bout, quels outils, quelles étapes.",
    "[Bloc 3] Vous avez noté ''demande SAV'' comme information que vous cherchez souvent sans la trouver rapidement — qu''est-ce qui manque exactement ? C''est un historique, un statut, un contact ?",
    "[Bloc 3] Vous perdez des informations ''entre les services'' — entre quels services précisément, et sur quel type d''information ?",
    "[Bloc 4 — Pointage GPS & Géolocalisation Pro · 10 min] Mathieu m''a décrit votre process de pointage : chaque matin vous regardez l''heure d''arrivée des ouvriers sur le chantier via Géolocalisation Pro, avec une règle sur la pause déjeuner selon qu''ils prennent ou non la camionnette. Vous pouvez me montrer ça par partage d''écran ?",
    "[Bloc 4] Ce pointage (noté 8h/semaine dans votre formulaire), une fois fait, qu''est-ce que vous en faites ? Ça part où, sous quelle forme ?",
    "[Bloc 4] Mathieu dit que les ouvriers ''trichent systématiquement'' sur leurs horaires déclarés — vous confirmez ? Comment vous détectez ces écarts ?",
    "[Bloc 5 — Paie (focus prioritaire Mathieu) · 15 min] La paie (8h/semaine, sur Excel) — décrivez-moi ce process de A à Z, depuis la collecte des heures jusqu''à l''envoi à l''expert-comptable. Montrez-moi votre fichier Excel par partage d''écran si possible.",
    "[Bloc 5] Concrètement, quelles informations vous devez rassembler pour CHAQUE ouvrier avant de faire le récapitulatif : heures travaillées, jours fériés, arrêts maladie, frais de déplacement — d''où vient chacune de ces données et qui vous les transmet ?",
    "[Bloc 5] Sur les frais de déplacement — comment vous savez si un ouvrier a découché à l''hôtel ou s''il est rentré chez lui ? C''est déclaratif, ou vous avez une source fiable (réservation hôtel, GPS) ?",
    "[Bloc 5] Combien de temps ça vous prend pour UN ouvrier, du pointage brut jusqu''au récapitulatif prêt à envoyer au comptable ? Et pour l''ensemble de l''effectif chaque mois ?",
    "[Bloc 5] Une fois votre récapitulatif envoyé au comptable, comment se passe la suite ? Vous recevez les fiches de paie en retour, vous les vérifiez, il y a des allers-retours fréquents ?",
    "[Bloc 5] Mathieu m''a dit qu''un essai de fiches de paie automatisées avait déjà été tenté il y a quelques années avec un prestataire (M. Hans) et que ça comportait trop d''erreurs — vous étiez déjà en poste à ce moment-là ? Qu''est-ce qui avait posé problème selon vous ?",
    "[Bloc 5] Mathieu propose de tester la génération automatique de 3 à 5 fiches de paie ce mois-ci, à comparer avec celles du comptable pour vérifier s''il y a des erreurs — qu''est-ce que vous en pensez ? Sur quels profils d''ouvriers (simples vs complexes : déplacements, arrêts, heures sup) faudrait-il tester en priorité pour que ce soit un test représentatif ?",
    "[Bloc 5] Si ce test réussit et qu''on automatise progressivement la paie, qu''est-ce qui, selon vous, doit absolument rester sous contrôle humain — et qu''est-ce qui pourrait être automatisé sans risque ?",
    "[Bloc 5] Les dossiers de pose (1h/semaine) — c''est quoi exactement, et en quoi ça se distingue du SAV ?",
    "[Bloc 6 — Vision IA & adhésion · 4 min] Vous utilisez déjà ChatGPT — pour quoi faire concrètement, et à quelle fréquence ?",
    "[Bloc 6] Vous partagez régulièrement les dossiers clients avec d''autres — avec qui, et sous quelle forme aujourd''hui ?"
  ]
}'::jsonb, now()
FROM intervenants i
WHERE i.prenom = 'Sara' AND i.nom = 'BANDURSKI'
ON CONFLICT (intervenant_id) DO UPDATE
SET questions_generees = EXCLUDED.questions_generees,
    questions_generees_at = now(),
    updated_at = now();

-- ============================================================
-- VÉRIFICATION
-- ============================================================
SELECT i.prenom, i.nom, i.statut_entretien, fa.statut as formulaire,
       COUNT(fr.id) as nb_reponses,
       jsonb_array_length(s.questions_generees->'questions') as nb_questions
FROM intervenants i
LEFT JOIN formulaire_assignation fa ON fa.intervenant_id = i.id
LEFT JOIN formulaire_reponses fr ON fr.assignation_id = fa.id
LEFT JOIN syntheses_ia s ON s.intervenant_id = i.id
WHERE i.prenom = 'Sara' AND i.nom = 'BANDURSKI'
GROUP BY i.prenom, i.nom, i.statut_entretien, fa.statut, s.questions_generees;
