-- Supprimer les intervenants fictifs et insérer les vrais
delete from formulaire_assignation;
delete from entretiens;
delete from syntheses_ia;
delete from transcriptions;
delete from intervenants;

insert into intervenants (prenom, nom, poste, entite, priorite, semaine, duree_entretien) values
('Mathieu',  'GROSS',      'Gérant du groupe',                    'Home Résine',    'Critique',        1, 90),
('Anne',     'GROSS',      'DAF / DRH',                           'Home Résine',    'Critique',        1, 75),
('Sara',     'BANDURSKI',  'Assistante administrative',           'Home Résine',    'Critique',        1, 60),
('Franck',   'PELISSIER',  'Directeur commercial / Gérant',       'Distri Résine',  'Critique',        2, 75),
('Marion',   'MOUTON',     'Assistante commerciale',              'Distri Résine',  'Haute',           2, 60),
('Brice',    'GENTILE',    'Prospecteur phoning',                 'Distri Résine',  'Critique',        2, 60),
('Jordan',   'BOUCHER',    'Responsable SAV',                     'Home Résine',    'Haute',           2, 60),
('Olivier',  'WITTMANN',   'Chef de chantier',                    'HR Construction','Haute',           3, 60),
('Nicolas',  'BOLLE',      'Chargé de communication',             'Distri Résine',  'Haute',           3, 45),
('TC',       'Terrain',    'Technicien Conseil terrain (à définir avec Franck)', 'Résilux', 'Complémentaire', 3, 45),
('Poseur',   'Terrain',    'Poseur terrain (à définir avec Olivier)', 'HR Construction', 'Complémentaire', 3, 30);

-- Vérification
select prenom, nom, entite, priorite, semaine from intervenants order by semaine, priorite;
