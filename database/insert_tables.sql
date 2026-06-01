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
    ),
    (
        'thomas_bordeaux',
        '$2b$10$UimUCZg48JJlQ4XlmtUd9e8pZrWizcu1hAPwOgTSXMLBgqFnb2vvO',
        'Bernard',
        'Thomas',
        '1992-04-14',
        'thomas.b@exemple.fr',
        '0622334455',
        'client',
        '12 Place de la Bourse, 33000 Bordeaux',
        NULL
    ),
    (
        'julie_sommeliere',
        '$2b$10$UimUCZg48JJlQ4XlmtUd9e8pZrWizcu1hAPwOgTSXMLBgqFnb2vvO',
        'Petit',
        'Julie',
        '1996-08-05',
        'julie.p@exemple.fr',
        '0633445566',
        'client',
        '87 Rue des Cépages, 21000 Dijon',
        NULL
    ),
    (
        'max_vintage',
        '$2b$10$UimUCZg48JJlQ4XlmtUd9e8pZrWizcu1hAPwOgTSXMLBgqFnb2vvO',
        'Durand',
        'Maxime',
        '1989-12-01',
        'maxime.d@exemple.fr',
        '0644556677',
        'client',
        '54 Allée du Chardonnay, 51100 Reims',
        NULL
    ),
    (
        'emma_grape',
        '$2b$10$UimUCZg48JJlQ4XlmtUd9e8pZrWizcu1hAPwOgTSXMLBgqFnb2vvO',
        'Leroy',
        'Emma',
        '2001-07-19',
        'emma.l@exemple.fr',
        '0755667788',
        'client',
        '3 Avenue du Merlot, 44000 Nantes',
        NULL
    ),
    (
        'admin_test',
        '$2b$10$UimUCZg48JJlQ4XlmtUd9e8pZrWizcu1hAPwOgTSXMLBgqFnb2vvO',
        'Moreau',
        'Alexandre',
        '1994-03-25',
        'alexandre.m@exemple.fr',
        '0666778899',
        'admin',
        '9 Rue de la Paix, 75002 Paris',
        NULL
    ),
    (
        'pierre_rhone',
        '$2b$10$UimUCZg48JJlQ4XlmtUd9e8pZrWizcu1hAPwOgTSXMLBgqFnb2vvO',
        'Fournier',
        'Pierre',
        '1985-06-30',
        'pierre.f@exemple.fr',
        '0677889900',
        'client',
        '21 Route des Côtes, 26000 Valence',
        NULL
    ),
    (
        'chloe_nectar',
        '$2b$10$UimUCZg48JJlQ4XlmtUd9e8pZrWizcu1hAPwOgTSXMLBgqFnb2vvO',
        'Girard',
        'Chloé',
        '1997-10-12',
        'chloe.g@exemple.fr',
        '0711335577',
        'client',
        '68 Chemin du Pressoir, 49100 Angers',
        NULL
    ),
    (
        'luc_terroir',
        '$2b$10$UimUCZg48JJlQ4XlmtUd9e8pZrWizcu1hAPwOgTSXMLBgqFnb2vvO',
        'Rousseau',
        'Luc',
        '1990-01-15',
        'luc.r@exemple.fr',
        '0622446688',
        'client',
        '104 Boulevard d''Alsace, 67000 Strasbourg',
        NULL
    ),
    (
        'lea_vigne',
        '$2b$10$UimUCZg48JJlQ4XlmtUd9e8pZrWizcu1hAPwOgTSXMLBgqFnb2vvO',
        'Mercier',
        'Léa',
        '1999-09-08',
        'lea.m@exemple.fr',
        '0633557799',
        'client',
        '15 Rue de la Cave, 34000 Montpellier',
        NULL
    ),
    (
        'nico_tinto',
        '$2b$10$UimUCZg48JJlQ4XlmtUd9e8pZrWizcu1hAPwOgTSXMLBgqFnb2vvO',
        'Blanc',
        'Nicolas',
        '1993-02-14',
        'nicolas.b@exemple.fr',
        '0744668800',
        'client',
        '42 Impasse du Syrah, 31000 Toulouse',
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
VALUES (
        'BIENVENUE10',
        '10% de réduction sur votre première commande pour découvrir notre sélection de vins et prestations.',
        10.00,
        '2024-01-01',
        '2034-12-31'
    );

-- Remplissage de la table avis (20 avis réalistes)
INSERT INTO
    avis (
        numUtilisateur,
        vin_id,
        prestation_id,
        note,
        commentaire,
        reponse_admin,
        valider
    )
VALUES
    -- Château Margaux (Vin ID 1)
    (
        2,
        1,
        NULL,
        5,
        'Un millésime absolument exceptionnel. Des tanins soyeux, une longueur en bouche incroyable. Certes cher, mais unique.',
        NULL,
        1
    ),
    (
        3,
        1,
        NULL,
        4,
        'Excellent bordeaux, très complexe, mais demande à vieillir encore un peu en cave pour révéler tout son potentiel.',
        NULL,
        1
    ),
    -- Champagne Dom Pérignon (Vin ID 2)
    (
        1,
        2,
        NULL,
        5,
        'La référence incontournable. Les bulles sont d''une finesse rare, parfait pour les grandes occasions !',
        NULL,
        1
    ),
    -- Meursault 1er Cru (Vin ID 3)
    (
        2,
        3,
        NULL,
        5,
        'Mon blanc préféré de Bourgogne. Ces notes beurrées et de noisette sont un pur bonheur avec un poisson en sauce.',
        NULL,
        1
    ),
    -- Côte-Rôtie 'La Mouline' (Vin ID 4)
    (
        3,
        4,
        NULL,
        4,
        'Un très grand nez, beaucoup de finesse et de puissance aromatique. Très satisfait de mon achat.',
        NULL,
        1
    ),
    -- Petrus 2015 (Vin ID 5)
    (
        1,
        5,
        NULL,
        5,
        'Un mythe accessible pour un grand événement. Robe sombre, arômes de truffe magiques. Grandiose.',
        NULL,
        1
    ),
    -- Sancerre Blanc (Vin ID 6)
    (
        2,
        6,
        NULL,
        4,
        'Très bon rapport qualité-prix. Idéal pour accompagner un plateau de fruits de mer ou du fromage de chèvre.',
        NULL,
        1
    ),
    -- Rosé de Provence (Vin ID 7)
    (
        3,
        7,
        NULL,
        3,
        'Rosé correct et très frais pour l''été, mais reste assez classique par rapport à d''autres références.',
        NULL,
        1
    ),
    -- Château d'Yquem (Vin ID 8)
    (
        1,
        8,
        NULL,
        5,
        'Le roi des liquoreux porte bien son nom. Un équilibre parfait entre le sucre et l''acidité, des notes de miel intenses.',
        NULL,
        1
    ),
    -- Gevrey-Chambertin (Vin ID 9)
    (
        2,
        9,
        NULL,
        4,
        'Un Bourgogne puissant comme on les aime, belles notes de cerise noire. Parfait sur une viande rouge.',
        NULL,
        1
    ),
    -- Chablis Grand Cru (Vin ID 10)
    (
        3,
        10,
        NULL,
        5,
        'Une minéralité tranchante et pure. Un magnifique Chardonnay, très élégant.',
        NULL,
        1
    ),
    -- Champagne Krug Grande Cuvée (Vin ID 12)
    (
        2,
        12,
        NULL,
        5,
        'Une complexité folle ! Les notes de pain grillé et de fruits mûrs sont exceptionnelles.',
        NULL,
        1
    ),
    -- Condrieu "L’Eclat" (Vin ID 13)
    (
        1,
        13,
        NULL,
        4,
        'L''explosion de fruits (pêche, abricot) typique du Viognier. Très aromatique et agréable.',
        NULL,
        1
    ),
    -- Châteauneuf-du-Pape (Vin ID 14)
    (
        3,
        14,
        NULL,
        4,
        'Un vin chaleureux, épicé et bien structuré. À carafer une heure avant le repas.',
        NULL,
        1
    ),
    -- Pouilly-Fumé (Vin ID 17)
    (
        2,
        17,
        NULL,
        4,
        'Ce côté pierre à fusil et légèrement fumé est top. Très sympa à l''apéritif.',
        NULL,
        1
    ),
    -- Visite Historique & Dégustation (Prestation ID 1)
    (
        2,
        NULL,
        1,
        5,
        'Superbe visite de la cave parisienne. Le guide était passionné et la sélection des 3 crus était parfaite pour conclure !',
        NULL,
        1
    ),
    (
        3,
        NULL,
        1,
        4,
        'Cadre magnifique en plein Paris. Les explications étaient claires et la dégustation très interactive.',
        NULL,
        1
    ),
    -- Atelier Initiation Rhône & Bourgogne (Prestation ID 2)
    (
        1,
        NULL,
        2,
        5,
        'Je recommande vivement cet atelier à Lyon ! J''ai enfin compris les différences de terroirs grâce aux conseils du sommelier.',
        NULL,
        1
    ),
    -- Grand Cru Experience (Prestation ID 3)
    (
        2,
        NULL,
        3,
        5,
        'Une expérience exclusive incroyable à Bordeaux. Goûter à ces grands crus classés vaut largement le détour et le prix.',
        NULL,
        1
    ),
    -- Sommelier Privé à Domicile (Prestation ID 5)
    (
        3,
        NULL,
        5,
        5,
        'Prestation haut de gamme pour l''anniversaire de mon conjoint. Le sommelier est venu avec des pépites, nos invités ont adoré !',
        NULL,
        1
    );

INSERT INTO livre_d_or (
    numUtilisateur, 
    avis_prestation, 
    avis_vin, 
    note_generale, -- Changé ici
    avis_livraison, 
    avis_SAV, 
    avis_site, 
    message, 
    created_at
) VALUES
(
    1, 
    1, 0, 5, 0, 0, 1, -- Note : 5/5 (Super site, recommande vivement)
    'Super site ! Très intuitif et facile à utiliser. Je recommande vivement.', 
    '2026-05-15 10:30:00'
),
(
    2, 
    0, 0, 5, 0, 1, 1, -- Note : 5/5 (Service client au top en - de 5 min)
    'Le service client est au top, ils ont répondu à ma question en moins de 5 minutes. Merci !', 
    '2026-05-16 14:15:22'
),
(
    3, 
    0, 1, 3, 1, 0, 0, -- Note : 3/5 (Un peu de retard sur la livraison)
    'Un peu de retard sur la livraison de ma dernière commande, mais le produit est conforme.', 
    '2026-05-17 09:05:11'
),
(
    4, 
    1, 0, 5, 0, 0, 0, -- Note : 5/5 (Fait gagner un temps fou)
    'Je l''utilise tous les jours pour mon travail, ça me fait gagner un temps fou.', 
    '2026-05-18 18:42:00'
),
(
    5, 
    0, 0, 4, 0, 0, 1, -- Note : 4/5 (Propre mais quelques petits bugs sur mobile)
    'Le design est propre et moderne. Quelques petits bugs sur mobile mais rien de méchant.', 
    '2026-05-19 11:20:34'
),
(
    6, 
    1, 0, 5, 0, 0, 1, -- Note : 5/5 (Super communauté, bravo à l'équipe)
    'Une super communauté et des fonctionnalités vraiment bien pensées. Bravo à l''équipe !', 
    '2026-05-20 16:55:03'
),
(
    7, 
    0, 1, 5, 0, 0, 0, -- Note : 5/5 (Rapport qualité-prix imbattable)
    'Rapport qualité-prix imbattable. Je ne regrette pas mon inscription.', 
    '2026-05-21 08:12:45'
),
(
    8, 
    1, 0, 4, 0, 0, 1, -- Note : 4/5 (Concept génial, attend la mise à jour)
    'J''attends la prochaine mise à jour avec impatience, le concept est génial.', 
    '2026-05-21 21:30:12'
),
(
    9, 
    1, 1, 5, 1, 1, 1, -- Note : 5/5 (Franchement parfait, la totale)
    'Franchement parfait, rien à redire. Tout fonctionne comme prévu.', 
    '2026-05-22 07:45:19'
),
(
    10, 
    0, 0, 5, 1, 0, 1, -- Note : 5/5 (Expérience globale très fluide)
    'Une expérience utilisateur globale très fluide. Merci pour cette plateforme !', 
    '2026-05-22 09:15:00'
);