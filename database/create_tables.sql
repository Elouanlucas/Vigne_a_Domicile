-- 1. On supprime d'abord les tables ENFANTS (celles qui pointent vers les autres)
-- 1. On supprime les tables ENFANTS d'abord (Liaisons et Items)
DROP TABLE IF EXISTS panier_items;

DROP TABLE IF EXISTS panier_prestations;

DROP TABLE IF EXISTS commande_items;

DROP TABLE IF EXISTS commande_prestations;

-- 2. On supprime les tables INTERMÉDIAIRES
DROP TABLE IF EXISTS panier_utilisateur;

DROP TABLE IF EXISTS commandes;

-- 3. On supprime les tables PARENTS (Référentiels)
DROP TABLE IF EXISTS vins;

DROP TABLE IF EXISTS prestations;

DROP TABLE IF EXISTS Utilisateur;

DROP TABLE IF EXISTS cave;

DROP TABLE IF EXISTS code_promo;

DROP TABLE IF EXISTS litiges;

DROP TABLE IF EXISTS avis;

DROP TABLE IF EXISTS livre_d_or;

-- 3. Table des utilisateurs
CREATE TABLE Utilisateur (
    numUtilisateur INT NOT NULL AUTO_INCREMENT,
    login VARCHAR(50) UNIQUE NOT NULL,
    motDePasse VARCHAR(255) NOT NULL,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    dateDeNaissance DATE NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    photo LONGBLOB,
    adresseDeLivraison VARCHAR(255),
    role ENUM('client', 'admin') DEFAULT 'client',
    PRIMARY KEY (numUtilisateur)
) ENGINE = InnoDB;

-- Dans la table vins, augmente la taille de cover
CREATE TABLE vins (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    cover VARCHAR(255), -- Augmenté ici
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    category VARCHAR(50),
    description TEXT,
    promotion_percentage DECIMAL(5, 2) DEFAULT NULL,
    recommandations BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (id)
) ENGINE = InnoDB;

-- Table panier (La commande globale)
CREATE TABLE panier_utilisateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numUtilisateur INT NOT NULL, -- Renommé pour correspondre à la table parent
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'en_attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_panier_user FOREIGN KEY (numUtilisateur) REFERENCES Utilisateur (numUtilisateur) ON DELETE CASCADE
) ENGINE = InnoDB;

-- Dans panier_items, assure-toi que le nom est explicite
CREATE TABLE panier_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    id_vin INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES panier_utilisateur (id) ON DELETE CASCADE,
    CONSTRAINT fk_items_vin FOREIGN KEY (id_vin) REFERENCES vins (id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- Table pour les commandes
CREATE TABLE commandes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numUtilisateur INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    -- Correction de la syntaxe ENUM ici
    status ENUM(
        'en_attente',
        'en_cours',
        'terminee',
        'annulee'
    ) DEFAULT 'en_attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_commandes_user FOREIGN KEY (numUtilisateur) REFERENCES Utilisateur (numUtilisateur) ON DELETE CASCADE
) ENGINE = InnoDB;

-- Table pour les produit dans les comandes
CREATE TABLE commande_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    commande_id INT NOT NULL,
    id_vin INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL, -- Super important : on garde le prix au moment de l'achat !
    CONSTRAINT fk_commande_items_commande FOREIGN KEY (commande_id) REFERENCES commandes (id) ON DELETE CASCADE,
    CONSTRAINT fk_commande_items_vin FOREIGN KEY (id_vin) REFERENCES vins (id) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE cave (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    adresse VARCHAR(255) NOT NULL,
    quantite INT NOT NULL,
    description TEXT
) ENGINE = InnoDB;

CREATE TABLE prestations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    type ENUM('cave', 'domicile', 'tiers') NOT NULL,
    cover VARCHAR(255),
    description TEXT,
    id_cave INT NULL,
    adresse_fixe VARCHAR(255) NULL, -- Pour un lieu partenaire autre qu'une cave
    prix DECIMAL(10, 2) NOT NULL,
    quantity INT NULL,
    CONSTRAINT fk_prestations_cave FOREIGN KEY (id_cave) REFERENCES cave (id) ON DELETE SET NULL
) ENGINE = InnoDB;

CREATE TABLE panier_prestations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    prestation_id INT NOT NULL,
    quantity INT NOT NULL,
    date_prestation DATE NOT NULL, -- Date de la prestation
    heure_prestation ENUM('matin', 'apres_midi', 'soir') NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_panier_prestations_order FOREIGN KEY (order_id) REFERENCES panier_utilisateur (id) ON DELETE CASCADE,
    CONSTRAINT fk_panier_prestations_prestation FOREIGN KEY (prestation_id) REFERENCES prestations (id) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE commande_prestations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    commande_id INT NOT NULL,
    prestation_id INT NOT NULL,
    quantity INT NOT NULL,
    date_prestation DATE NOT NULL, -- Date de la prestation
    heure_prestation ENUM('matin', 'apres_midi', 'soir') NOT NULL,
    adresse_prestation VARCHAR(255) NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_commande_prestations_commande FOREIGN KEY (commande_id) REFERENCES commandes (id) ON DELETE CASCADE,
    CONSTRAINT fk_commande_prestations_prestation FOREIGN KEY (prestation_id) REFERENCES prestations (id) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE code_promo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_percentage DECIMAL(5, 2) NOT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL
) ENGINE = InnoDB;

CREATE TABLE litiges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    commande_id INT NULL, -- NULL au cas où la commande est archivée/supprimée
    numUtilisateur INT NOT NULL,
    prestation_id INT NULL, -- Optionnel : pour cibler une dégustation précise
    type_motif VARCHAR(255) NOT NULL, -- Ex: "Bouteille cassée", "Prestation non honorée"
    description TEXT NOT NULL,
    statut ENUM(
        'ouvert',
        'en_cours',
        'resolu',
        'rejete'
    ) DEFAULT 'ouvert',
    piece_jointe VARCHAR(255) NULL, -- Pour stocker le nom d'une photo (ex: "prev-litige-12.jpg")
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Pour savoir quand le statut a changé
    
    -- Clés étrangères
    CONSTRAINT fk_litiges_commande FOREIGN KEY (commande_id) REFERENCES commandes (id) ON DELETE SET NULL,
    CONSTRAINT fk_litiges_user FOREIGN KEY (numUtilisateur) REFERENCES Utilisateur (numUtilisateur) ON DELETE CASCADE,
    CONSTRAINT fk_litiges_prestation FOREIGN KEY (prestation_id) REFERENCES prestations (id) ON DELETE SET NULL
) ENGINE = InnoDB;

CREATE TABLE avis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numUtilisateur INT NOT NULL,
    prestation_id INT NULL,
    vin_id INT NULL, -- Renommé pour être cohérent avec la table 'vins'
    note INT NOT NULL,
    commentaire TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reponse_admin TEXT NULL,
    valider BOOLEAN DEFAULT FALSE,
    
    -- Clés étrangères
    CONSTRAINT fk_avis_user FOREIGN KEY (numUtilisateur) REFERENCES Utilisateur (numUtilisateur) ON DELETE CASCADE,
    CONSTRAINT fk_avis_prestation FOREIGN KEY (prestation_id) REFERENCES prestations (id) ON DELETE CASCADE,
    CONSTRAINT fk_avis_vin FOREIGN KEY (vin_id) REFERENCES vins (id) ON DELETE CASCADE,

    -- Sécurités applicatives au niveau SQL
    CONSTRAINT chk_note_1_a_5 CHECK (note >= 1 AND note <= 5),
    CONSTRAINT chk_cible_unique CHECK (
        (prestation_id IS NOT NULL AND vin_id IS NULL) OR 
        (prestation_id IS NULL AND vin_id IS NOT NULL)
    ),

    -- Unicité : Un utilisateur ne peut laisser qu'un seul avis par vin ou par prestation
    UNIQUE KEY uniq_user_vin (numUtilisateur, vin_id),
    UNIQUE KEY uniq_user_prestation (numUtilisateur, prestation_id)
) ENGINE = InnoDB;

CREATE TABLE livre_d_or (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numUtilisateur INT NOT NULL,
    avis_prestation BOOLEAN DEFAULT FALSE,
    avis_vin BOOLEAN DEFAULT FALSE,
    avis_livraison BOOLEAN DEFAULT FALSE,
    avis_SAV BOOLEAN DEFAULT FALSE,
    avis_site BOOLEAN DEFAULT FALSE,
    
    -- Remplacement du boolean par un INT de 1 à 5
    note_generale INT DEFAULT 5 CHECK (note_generale BETWEEN 1 AND 5),
    
    message TEXT NOT NULL,
    reponse_admin TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Clé étrangère
    CONSTRAINT fk_livre_d_or_user FOREIGN KEY (numUtilisateur) REFERENCES Utilisateur (numUtilisateur) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE livre_d_or_tempo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numUtilisateur INT NOT NULL,
    avis_prestation BOOLEAN DEFAULT FALSE,
    avis_vin BOOLEAN DEFAULT FALSE,
    avis_livraison BOOLEAN DEFAULT FALSE,
    avis_SAV BOOLEAN DEFAULT FALSE,
    avis_site BOOLEAN DEFAULT FALSE,
    
    -- Remplacement du boolean par un INT de 1 à 5
    note_generale INT DEFAULT 5 CHECK (note_generale BETWEEN 1 AND 5),
    
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Clé étrangère
    CONSTRAINT fk_livre_d_or_tempo_user FOREIGN KEY (numUtilisateur) REFERENCES Utilisateur (numUtilisateur) ON DELETE CASCADE
) ENGINE = InnoDB;
