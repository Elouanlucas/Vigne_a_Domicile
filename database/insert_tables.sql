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
        role,
        adresseDeLivraison,
        photo
    )
VALUES (
        'dev',
        '$2b$10$UimUCZg48JJlQ4XlmtUd9e8pZrWizcu1hAPwOgTSXMLBgqFnb2vvO',
        'Martin',
        'Elouan',
        '2000-05-15',
        'elouan@exemple.fr',
        '0601020304',
        'admin',
        '123 Rue du Vin, 75000 Paris',
        NULL
    ),
    (
        'lucas_wine',
        '$2b$10$UimUCZg48JJlQ4XlmtUd9e8pZrWizcu1hAPwOgTSXMLBgqFnb2vvO',
        'Dubois',
        'Lucas',
        '1998-11-22',
        'lucas@exemple.fr',
        '0611223344',
        'client',
        '456 Avenue des Vignes, 69000 Lyon',
        NULL
    ),
    (
        'sophie_caviste',
        '$2b$10$UimUCZg48JJlQ4XlmtUd9e8pZrWizcu1hAPwOgTSXMLBgqFnb2vvO',
        'Lemoine',
        'Sophie',
        '1995-02-10',
        'sophie@exemple.fr',
        '0788990011',
        'client',
        '789 Boulevard des Crus, 33000 Bordeaux',
        NULL
    );

-- Remplissage de la table vins
-- J'ai supprimé l'ID manuel pour laisser le AUTO_INCREMENT travailler tout seul
INSERT INTO
    vins (
        name,
        cover,
        price,
        quantity,
        category,
        description,
        promotion_percentage,
        recommandations
    )
VALUES (
        'Château Margaux',
        'Château_Margaux.png',
        1500,
        1000,
        'rouge',
        'Un grand cru de Bordeaux, élégant et complexe avec des arômes de fruits noirs et de cèdre.',
        30,
        TRUE
    ),
    (
        'Champagne Dom Pérignon',
        'Dom_Perignon.jpg',
        220,
        1000,
        'champagne',
        'Le prestige à bulles. Un champagne équilibré entre fraîcheur et notes grillées.',
        NULL,
        FALSE
    ),
    (
        'Meursault 1er Cru',
        'Meursault.png',
        95,
        1000,
        'blanc',
        'Un grand blanc de Bourgogne, onctueux avec des notes de noisette et de beurre.',
        10,
        FALSE
    ),
    (
        'Côte-Rôtie \'La Mouline\'',
        'Cote_Rotie.jpg',
        450,
        1000,
        'rouge',
        'Un nectar de la Vallée du Rhône, floral, puissant et d\'une élégance rare.',
        NULL,
        FALSE
    ),
    (
        'Petrus 2015',
        'Petrus.jpg',
        3000,
        1000,
        'rouge',
        'Un vin mythique de Pomerol, riche et velouté avec des arômes de truffe et de fruits noirs.',
        NULL,
        FALSE
    ),
    (
        'Sancerre Blanc',
        'sancerre-barbotaine.png',
        25,
        1000,
        'blanc',
        'Un vin frais et vif de la Loire, avec des notes d\'agrumes et de pierre à fusil.',
        NULL,
        FALSE
    ),
    (
        'Rosé de Provence',
        'rosé_de_provence.png',
        18,
        1000,
        'rosé',
        'Un rosé léger et fruité, parfait pour l\'été avec des arômes de fraise et de melon.',
        NULL,
        FALSE
    ),
    (
        'Château d\'Yquem',
        'Château_Yquem.jpg',
        500,
        1000,
        'blanc',
        'Le roi des liquoreux de Sauternes, sucré mais équilibré avec des notes de miel et d\'abricot.',
        50,
        TRUE
    ),
    (
        'Gevrey-Chambertin',
        'gevrey_chambertin.png',
        75.00,
        1000,
        'rouge',
        'Un Bourgogne puissant, aux arômes de cerise et de réglisse.',
        NULL,
        FALSE
    ),
    (
        'Chablis Grand Cru',
        'chablis_gc.jpg',
        65.00,
        1000,
        'blanc',
        'Un blanc minéral et pur, l’expression parfaite du Chardonnay sur calcaire.',
        NULL,
        FALSE
    ),
    (
        'Pauillac Baron Philippe',
        'pauillac.png',
        110.00,
        1000,
        'rouge',
        'Un classique bordelais, structuré avec des tanins soyeux et des notes de cassis.',
        NULL,
        FALSE
    ),
    (
        'Champagne Krug Grande Cuvée',
        'krug.jpg',
        250.00,
        1000,
        'champagne',
        'Un champagne d’exception, d’une complexité rare avec des notes de pain grillé.',
        NULL,
        TRUE
    ),
    (
        'Condrieu "L’Eclat"',
        'condrieu.png',
        58.00,
        1000,
        'blanc',
        'Le fleuron du Viognier : nez intense de pêche blanche et d’abricot.',
        20,
        FALSE
    ),
    (
        'Châteauneuf-du-Pape',
        'chateauneuf.jpg',
        48.00,
        1000,
        'rouge',
        'Un vin généreux et épicé, mélange parfait de Grenache et Syrah.',
        NULL,
        FALSE
    ),
    (
        'Garrus Rosé',
        'garrus.png',
        120.00,
        1000,
        'rosé',
        'L’un des rosés les plus prestigieux au monde, élevé en fûts de chêne.',
        NULL,
        FALSE
    ),
    (
        'Saint-Émilion Grand Cru',
        'saint_emilion.jpg',
        55.00,
        1000,
        'rouge',
        'Dominante Merlot pour un vin souple aux notes de prune et de vanille.',
        NULL,
        FALSE
    ),
    (
        'Pouilly-Fumé',
        'pouilly_fume.png',
        28.00,
        1000,
        'blanc',
        'Un Sauvignon blanc très aromatique avec une touche fumée caractéristique.',
        10,
        TRUE
    ),
    (
        'Hermitage Rouge',
        'hermitage.jpg',
        85.00,
        1000,
        'rouge',
        'Une Syrah monumentale, sombre et profonde, aux notes de poivre noir.',
        NULL,
        FALSE
    ),
    (
        'Bollinger Special Cuvée',
        'bollinger.png',
        60.00,
        1000,
        'champagne',
        'Un champagne vineux et structuré, favori des amateurs de caractère.',
        NULL,
        FALSE
    ),
    (
        'Pessac-Léognan Blanc',
        'pessac_blanc.jpg',
        42.00,
        1000,
        'blanc',
        'Un assemblage sémillon-sauvignon élégant avec une belle fraîcheur boisée.',
        60,
        FALSE
    ),
    (
        'Bandol Rosé',
        'bandol.png',
        24.00,
        1000,
        'rosé',
        'Un rosé de caractère, structuré et épicé, parfait pour la gastronomie.',
        NULL,
        TRUE
    ),
    (
        'Gigondas Vieilles Vignes',
        'gigondas.jpg',
        32.00,
        1000,
        'rouge',
        'Un vin solaire de la Vallée du Rhône, puissant et gorgé de fruits rouges.',
        NULL,
        FALSE
    ),
    (
        'Puligny-Montrachet',
        'puligny.png',
        90.00,
        1000,
        'blanc',
        'L’élégance absolue de la Bourgogne, entre finesse florale et tension.',
        NULL,
        FALSE
    ),
    (
        'Cahors Malbec Prestige',
        'cahors.jpg',
        22.00,
        1000,
        'rouge',
        'Un vin noir, intense et robuste, aux arômes de mûre et de violette.',
        NULL,
        TRUE
    ),
    (
        'Coteaux d’Aix-en-Provence',
        'aix_rose.png',
        15.00,
        1000,
        'rosé',
        'Un rosé plaisir, frais et désaltérant pour l’apéritif.',
        NULL,
        FALSE
    ),
    (
        'Ruinart Blanc de Blancs',
        'ruinart.jpg',
        95.00,
        1000,
        'champagne',
        'Le fleuron de la maison Ruinart, une pureté de Chardonnay incomparable.',
        NULL,
        FALSE
    ),
    (
        'Cornas "Terres Brûlées"',
        'cornas.png',
        62.00,
        1000,
        'rouge',
        'Une Syrah sauvage et minérale, issue des coteaux granitiques du Rhône.',
        25,
        FALSE
    ),
    (
        'Sauternes Château Suduiraut',
        'sauternes.jpg',
        75.00,
        1000,
        'blanc',
        'Un vin d’or aux saveurs d’écorce d’orange confite et d’épices douces.',
        NULL,
        FALSE
    );

-- Remplissage de la table prestations
INSERT INTO
    cave (
        nom,
        adresse,
        quantite,
        description
    )
VALUES (
        'Cave de Paris',
        '10 Rue des Vins, 75000 Paris',
        1000,
        'Une cave historique au cœur de Paris, offrant une sélection exceptionnelle de vins français.'
    ),
    (
        'Cave de Lyon',
        '20 Avenue des Crus, 69000 Lyon',
        1000,
        'Une cave réputée à Lyon, spécialisée dans les vins du Rhône et de Bourgogne.'
    ),
    (
        'Cave de Bordeaux',
        '30 Boulevard des Châteaux, 33000 Bordeaux',
        1000,
        'Une cave emblématique à Bordeaux, proposant une large gamme de grands crus et de vins locaux.'
    ),
    (
        'Cave de Marseille',
        '40 Rue des Vignerons, 13000 Marseille',
        1000,
        'Une cave dynamique à Marseille, mettant en avant les vins du Sud de la France et de la Méditerranée.'
    );

INSERT INTO
    prestations (
        nom,
        type,
        cover,
        description,
        id_cave,
        adresse_fixe,
        prix,
        quantity
    )
VALUES
    -- Prestations liées aux caves (Visites sur place)
    (
        'Visite Historique & Dégustation',
        'cave',
        'paris_cave.jpg',
        'Découvrez les secrets de notre cave historique parisienne suivis d’une dégustation de 3 crus.',
        1, -- ID de la Cave de Paris
        NULL,
        45.00,
        20
    ),
    (
        'Atelier Initiation Rhône & Bourgogne',
        'cave',
        'lyon_atelier.jpg',
        'Un cours œnologique focalisé sur les terroirs locaux dans notre cave lyonnaise.',
        2, -- ID de la Cave de Lyon
        NULL,
        55.00,
        15
    ),
    (
        'Grand Cru Experience',
        'cave',
        'bordeaux_prestige.jpg',
        'Une immersion exclusive dans le monde des grands crus classés au cœur de Bordeaux.',
        3, -- ID de la Cave de Bordeaux
        NULL,
        89.00,
        20
    ),
    (
        'Vins du Sud & Tapas',
        'cave',
        'marseille_soleil.jpg',
        'Une dégustation décontractée face au vieux port, mettant à l’honneur les rosés et blancs du Sud.',
        4, -- ID de la Cave de Marseille
        NULL,
        35.00,
        25
    ),
    -- Prestation à domicile (Indépendante)
    (
        'Sommelier Privé à Domicile',
        'domicile',
        'tonneau_de_vin.png',
        'Un expert se déplace chez vous avec 5 bouteilles d’exception pour une soirée inoubliable.',
        NULL, -- Pas de cave
        NULL, -- L'adresse sera saisie par le client lors de la commande
        150.00,
        NULL
    );

INSERT INTO
    code_promo (
        code,
        description,
        discount_percentage,
        valid_from,
        valid_to
    )
VALUES
    (
        'BIENVENUE10',
        '10% de réduction sur votre première commande pour découvrir notre sélection de vins et prestations.',
        10.00,
        '2024-01-01',
        '2034-12-31'
    );
  