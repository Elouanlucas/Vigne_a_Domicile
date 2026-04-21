-- 1. On supprime d'abord les tables ENFANTS (celles qui pointent vers les autres)
DROP TABLE IF EXISTS panier_items;

DROP TABLE IF EXISTS panier_utilisateur;

-- 2. On supprime ensuite les tables PARENTS
DROP TABLE IF EXISTS vins;

DROP TABLE IF EXISTS Utilisateur;

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
    role ENUM('client', 'admin') DEFAULT 'client',
    PRIMARY KEY (numUtilisateur)
) ENGINE = InnoDB;

-- 4. Table des vins
CREATE TABLE vins (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    cover VARCHAR(50),
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    description TEXT,
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

-- Table items (Le contenu du panier)
CREATE TABLE panier_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    id_vin INT NOT NULL, -- On peut aussi renommer product_id en id_vin pour coller à la table 'vins'
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES panier_utilisateur (id) ON DELETE CASCADE,
    FOREIGN KEY (id_vin) REFERENCES vins (id) ON DELETE CASCADE
) ENGINE = InnoDB;