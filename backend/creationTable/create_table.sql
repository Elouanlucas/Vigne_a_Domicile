-- 1. Création de la base avec le bon encodage pour les accents
CREATE DATABASE IF NOT EXISTS vigne_a_domicile 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE vigne_a_domicile;

-- 2. Suppression dans l'ordre pour éviter les erreurs de dépendance
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
    PRIMARY KEY (numUtilisateur)
) ENGINE=InnoDB;

CREATE TABLE vins (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    -- MEDIUMBLOB peut stocker jusqu'à 16 Mo par image, ce qui est suffisant pour des photos
    cover MEDIUMBLOB DEFAULT NULL, 
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    PRIMARY KEY (id)
) ENGINE=InnoDB;
