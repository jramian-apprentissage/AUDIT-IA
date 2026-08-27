-- ============================================================
-- PRÉPARATION ENTRETIEN — BOUCHER Jordan (Responsable SAV, Home Résine)
-- Formulaire non reçu (absent, arrêt maladie) — questions couvrent
-- donc aussi l'identification de base.
-- Contexte croisé : entretien Sara BANDURSKI (standard, 3 boîtes mail,
-- garantie/hors-garantie, mobilité sans Salesforce sur la route) et
-- entretien Nicolas BOLLE (manque de détail des appels SAV sur Salesforce,
-- idée de retranscription IA).
-- ============================================================

INSERT INTO syntheses_ia (intervenant_id, questions_generees, questions_generees_at)
SELECT i.id, '{
  "questions": [
    "[Bloc 1 — Identification & journée type · 8 min] Pouvez-vous vous présenter rapidement : depuis combien de temps chez Home Résine sur le poste de responsable SAV ? Décrivez-moi votre journée type, dans l''ordre.",
    "[Bloc 1] Sara m''a expliqué qu''elle gère le standard et redirige vers vous les appels SAV, mais que vous êtes souvent injoignable car vous roulez beaucoup entre chantiers (jusqu''à 6h de route certains jours) et n''avez ni Salesforce ni ordinateur en déplacement. Comment ça se passe concrètement pour vous au quotidien ?",
    "[Bloc 1] Quand vous n''êtes pas joignable, Sara prend note et vous demande de rappeler — comment vous récupérez ces messages et sous quel délai vous rappelez en général ?",
    "[Bloc 2 — Le dossier SAV de bout en bout · 12 min] Décrivez-moi le parcours complet d''un dossier SAV : de l''appel initial du client jusqu''à la résolution. Qui intervient à chaque étape ?",
    "[Bloc 2] Sara distingue les dossiers ''garantie'' et ''hors garantie'', gérés par deux personnes différentes — vous gérez laquelle des deux, ou les deux ? Comment se fait la bascule entre les deux ?",
    "[Bloc 2] Les délais de garantie sont fixes selon le type de travaux (1 an pour la résine seule, 10 ans si maçonnerie/étanchéité) — comment vous vérifiez rapidement ce qui a été vendu sur un dossier pour déterminer si le client est encore sous garantie ?",
    "[Bloc 2] Sara m''a parlé de dossiers qui remontent jusqu''à une expertise assurance, voire un tribunal ou un avocat quand expert et responsable SAV ne sont pas d''accord — à quelle fréquence ça arrive, et comment vous suivez ces dossiers dans la durée ?",
    "[Bloc 3 — Outils & informations dispersées · 8 min] Sara m''a dit qu''elle doit chercher des informations dans trois boîtes mail différentes en plus de Salesforce parce que les assurances n''ont pas l''adresse mail Salesforce du service SAV. Vous confirmez ce fonctionnement ? Comment vous gérez ça de votre côté ?",
    "[Bloc 3] Nicolas m''a signalé un manque de détail sur les fiches Salesforce : un appel SAV est parfois juste noté ''appel du SAV'' sans savoir ce qui s''est dit, y compris sur des dossiers vieux de plusieurs années. Comment vous notez aujourd''hui le contenu d''un échange avec un client ou une assurance ?",
    "[Bloc 3] Si Salesforce gardait automatiquement un résumé de chaque appel (qui a appelé, pourquoi, ce qui a été convenu), en quoi ça changerait votre façon de reprendre un dossier après plusieurs mois ou années ?",
    "[Bloc 4 — Volume & charge · 6 min] Combien de dossiers SAV actifs vous suivez en moyenne à un instant donné ? Et sur une semaine, combien de nouveaux dossiers ouverts ?",
    "[Bloc 4] Quelle est la tâche qui vous prend le plus de temps sans vraiment apporter de valeur dans votre semaine ?",
    "[Bloc 5 — Vision IA & adhésion · 5 min] Avez-vous déjà utilisé des outils d''IA (ChatGPT, Gemini, autre) ? Si oui, pour quoi ?",
    "[Bloc 5] Si une IA pouvait vous aider sur une seule chose demain matin, ce serait quoi ?"
  ]
}'::jsonb, now()
FROM intervenants i
WHERE i.prenom = 'Jordan' AND i.nom = 'BOUCHER'
ON CONFLICT (intervenant_id) DO UPDATE
SET questions_generees = EXCLUDED.questions_generees, questions_generees_at = now(), updated_at = now();

-- Vérification
SELECT i.prenom, i.nom, i.poste, i.statut_entretien,
       jsonb_array_length(s.questions_generees->'questions') as nb_questions
FROM intervenants i
LEFT JOIN syntheses_ia s ON s.intervenant_id = i.id
WHERE i.prenom = 'Jordan' AND i.nom = 'BOUCHER';
