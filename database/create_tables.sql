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
    promotion_price DECIMAL(10, 2) DEFAULT NULL,
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