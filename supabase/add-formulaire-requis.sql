-- ============================================================
-- AJOUT — colonne formulaire_requis sur intervenants
-- Certains profils (poseurs, techniciens terrain) n'ont pas besoin
-- de remplir le formulaire pré-audit — seul l'entretien compte pour eux.
-- ============================================================

ALTER TABLE intervenants
ADD COLUMN IF NOT EXISTS formulaire_requis boolean NOT NULL DEFAULT true;

-- Désactiver le formulaire pour les profils terrain génériques non nominatifs
-- (placeholders "à définir" — un poseur/technicien terrain réel et nommé,
-- comme Olivier WITTMANN, garde le formulaire car il a déjà répondu)
UPDATE intervenants
SET formulaire_requis = false, updated_at = now()
WHERE nom = 'Terrain' AND prenom IN ('TC', 'Poseur');

-- Vérification
SELECT prenom, nom, poste, formulaire_requis
FROM intervenants
ORDER BY formulaire_requis, nom;
