-- Remplissage de la table Utilisateur
-- Note : Dans une vraie application, le mot de passe doit être haché (ex: avec bcrypt)
INSERT INTO Utilisateur (login, motDePasse, nom, prenom, dateDeNaissance, email, telephone) VALUES
('elouan_dev', 'password123', 'Martin', 'Elouan', '2000-05-15', 'elouan@exemple.fr', '0601020304'),
('lucas_wine', 'securePass456', 'Dubois', 'Lucas', '1998-11-22', 'lucas@exemple.fr', '0611223344'),
('sophie_caviste', 'superSecret789', 'Lemoine', 'Sophie', '1995-02-10', 'sophie@exemple.fr', '0788990011');

-- Remplissage de la table vins
-- J'ai supprimé l'ID manuel pour laisser le AUTO_INCREMENT travailler tout seul
INSERT INTO vins (name, cover, price, category, description) VALUES
('Château Margaux', NULL, 500, 'rouge', 'Un vin rouge de Bordeaux, réputé pour sa qualité exceptionnelle et son goût raffiné.'),
('Petrus 2015', NULL, 3200, 'rouge', 'L\'icône de Pomerol. Un vin d\'une concentration et d\'une profondeur légendaires.'),
('Champagne Dom Pérignon', NULL, 220, 'champagne', 'Le prestige à bulles. Un champagne équilibré entre fraîcheur et notes grillées.'),
('Meursault 1er Cru', NULL, 95, 'blanc', 'Un grand blanc de Bourgogne, onctueux avec des notes de noisette et de beurre.'),
('Côte-Rôtie \'La Mouline\'', NULL, 450, 'rouge', 'Un nectar de la Vallée du Rhône, floral, puissant et d\'une élégance rare.');

