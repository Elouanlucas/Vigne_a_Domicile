-- Remplissage de la table Utilisateur
-- Note : Dans une vraie application, le mot de passe doit être haché (ex: avec bcrypt)
INSERT INTO
    Utilisateur (
        login,
        motDePasse,
        nom,
        prenom,
        dateDeNaissance,
        email,
        telephone,
        role
    )
VALUES (
        'elouan_dev',
        '$2b$10$UimUCZg48JJlQ4XlmtUd9e8pZrWizcu1hAPwOgTSXMLBgqFnb2vvO',
        'Martin',
        'Elouan',
        '2000-05-15',
        'elouan@exemple.fr',
        '0601020304',
        'admin'
    ),
    (
        'lucas_wine',
        '$2b$10$UimUCZg48JJlQ4XlmtUd9e8pZrWizcu1hAPwOgTSXMLBgqFnb2vvO',
        'Dubois',
        'Lucas',
        '1998-11-22',
        'lucas@exemple.fr',
        '0611223344',
        'client'
    ),
    (
        'sophie_caviste',
        '$2b$10$UimUCZg48JJlQ4XlmtUd9e8pZrWizcu1hAPwOgTSXMLBgqFnb2vvO',
        'Lemoine',
        'Sophie',
        '1995-02-10',
        'sophie@exemple.fr',
        '0788990011',
        'client'
    );

-- Remplissage de la table vins
-- J'ai supprimé l'ID manuel pour laisser le AUTO_INCREMENT travailler tout seul
INSERT INTO
    vins (
        name,
        cover,
        price,
        category,
        description
    )
VALUES (
        'Château Margaux',
        'Château_Margaux.png',
        1500,
        'rouge',
        'Un grand cru de Bordeaux, élégant et complexe avec des arômes de fruits noirs et de cèdre.'
    ),
    (
        'Champagne Dom Pérignon',
        'Dom_Perignon.jpg',
        220,
        'champagne',
        'Le prestige à bulles. Un champagne équilibré entre fraîcheur et notes grillées.'
    ),
    (
        'Meursault 1er Cru',
        'Meursault.png',
        95,
        'blanc',
        'Un grand blanc de Bourgogne, onctueux avec des notes de noisette et de beurre.'
    ),
    (
        'Côte-Rôtie \'La Mouline\'',
        'Cote_Rotie.jpg',
        450,
        'rouge',
        'Un nectar de la Vallée du Rhône, floral, puissant et d\'une élégance rare.'
    ),
    (
        'Petrus 2015',
        'Petrus.jpg',
        3000,
        'rouge',
        'Un vin mythique de Pomerol, riche et velouté avec des arômes de truffe et de fruits noirs.'
    ),
    (
        'Sancerre Blanc',
        'sancerre-barbotaine.png',
        25,
        'blanc',
        'Un vin frais et vif de la Loire, avec des notes d\'agrumes et de pierre à fusil.'
    ),
    (
        'Rosé de Provence',
        'rosé_de_provence.png',
        18,
        'rosé',
        'Un rosé léger et fruité, parfait pour l\'été avec des arômes de fraise et de melon.'
    ),
    (
        'Château d\'Yquem',
        'Château_Yquem.jpg',
        500,
        'blanc',
        'Le roi des liquoreux de Sauternes, sucré mais équilibré avec des notes de miel et d\'abricot.'
    );