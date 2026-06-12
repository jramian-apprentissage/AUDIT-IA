-- Reset complet du formulaire et recréation avec la structure exacte du document
delete from formulaire_reponses;
delete from formulaire_assignation;
delete from formulaires;

insert into formulaires (nom, type, description, sections, statut) values (
  'Formulaire Pré-Audit — HOMERESINE AI',
  'Direction',
  'Dans le cadre de la mission d''audit Lean IT HOMERESINE, merci de compléter ce formulaire avant votre entretien. Vos réponses nous permettront de préparer une session d''analyse approfondie plutôt que de collecte brute. Retour attendu 48h avant votre visio.',
  '[
    {
      "id": "identification",
      "titre": "Section A — Identification",
      "questions": [
        {
          "id": "nom_prenom",
          "libelle": "Nom & Prénom",
          "type": "intervenant_select",
          "obligatoire": true
        },
        {
          "id": "poste_fonction",
          "libelle": "Poste / Fonction",
          "type": "texte_court",
          "obligatoire": true
        },
        {
          "id": "entite",
          "libelle": "Entité",
          "type": "select",
          "obligatoire": true,
          "options": ["Distri Résine", "Home Résine", "Résilux", "HR Construction"]
        },
        {
          "id": "anciennete",
          "libelle": "Ancienneté dans le poste",
          "type": "texte_court",
          "obligatoire": false,
          "description": "Ex : 2 ans, 6 mois…"
        }
      ]
    },
    {
      "id": "taches",
      "titre": "Section B — Cartographie des tâches",
      "questions": [
        {
          "id": "tableau_taches",
          "libelle": "Listez vos 5 à 10 tâches principales, leur fréquence et le temps moyen passé",
          "type": "tableau",
          "obligatoire": true,
          "colonnes": ["Tâche / Activité", "Fréquence", "Temps moyen", "Outil(s) utilisé(s)"],
          "lignes": 8,
          "placeholder_colonnes": ["Ex : Saisie devis", "Quotidien / Hebdo / Mensuel", "__ min / __ h", "Ex : Salesforce"]
        }
      ]
    },
    {
      "id": "outils",
      "titre": "Section C — Inventaire des outils",
      "questions": [
        {
          "id": "tableau_outils",
          "libelle": "Pour chaque outil que vous utilisez, indiquez la fréquence et l''usage",
          "type": "tableau_outils",
          "obligatoire": false,
          "colonnes": ["Outil / Application", "Usage principal", "Fréquence", "Satisfaction (1-5)"],
          "outils_fixes": ["Salesforce", "Email (Gmail / Outlook)", "WhatsApp", "Google Drive / Sheets", "Traceur GPS camionnettes"],
          "lignes_libres": 2
        }
      ]
    },
    {
      "id": "frictions",
      "titre": "Section D — Frictions & Points de douleur",
      "questions": [
        {
          "id": "tache_sans_valeur",
          "libelle": "Quelle tâche vous prend le plus de temps sans vraiment apporter de valeur ?",
          "type": "texte_long",
          "obligatoire": true
        },
        {
          "id": "perte_info",
          "libelle": "Où perdez-vous des informations importantes ? (entre qui et qui ?)",
          "type": "texte_long",
          "obligatoire": true
        },
        {
          "id": "decisions_sans_info",
          "libelle": "Quelles décisions prenez-vous souvent sans avoir toutes les informations nécessaires ?",
          "type": "texte_long",
          "obligatoire": false
        },
        {
          "id": "taches_repetitives",
          "libelle": "Quelles tâches répétitives aimeriez-vous ne plus jamais faire manuellement ?",
          "type": "texte_long",
          "obligatoire": true
        },
        {
          "id": "info_introuvable",
          "libelle": "Y a-t-il des informations que vous cherchez souvent et que vous n''arrivez pas à trouver rapidement ?",
          "type": "texte_long",
          "obligatoire": false
        }
      ]
    },
    {
      "id": "ia",
      "titre": "Section E — Vision & Attentes IA",
      "questions": [
        {
          "id": "ia_une_chose",
          "libelle": "Si un assistant IA pouvait vous aider sur une seule chose, ce serait quoi ?",
          "type": "texte_long",
          "obligatoire": true
        },
        {
          "id": "ia_usage_actuel",
          "libelle": "Avez-vous déjà utilisé des outils IA (ChatGPT, Gemini, etc.) ? Si oui, pour quoi ?",
          "type": "texte_long",
          "obligatoire": true
        },
        {
          "id": "donnees_partagees",
          "libelle": "Quelles données ou informations produisez-vous régulièrement que vous partagez avec d''autres ?",
          "type": "texte_long",
          "obligatoire": false
        }
      ]
    }
  ]'::jsonb,
  'publié'
);

select id, nom, statut from formulaires;
