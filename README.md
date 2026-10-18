# 🍇 Vigne à Domicile

> 🎓 **Projet d'Études** — Réalisé dans un cadre académique pour mettre en pratique le développement d'applications web modernes avec **React**.

**Vigne à Domicile** est une application web front-end permettant de consulter un catalogue de produits viticoles et de gérer un panier d'achats en ligne.

---

## 🚀 Fonctionnalités

- **Catalogue dynamique** : Consultation de la liste des vins et offres disponibles.
- **Gestion du Panier** : Ajout, suppression et suivi des articles sélectionnés.
- **Mode Sombre / Mode Black** : Basculement de thème pour un meilleur confort visuel.
- **Navigation multi-pages** :
  - Accueil / Catalogue
  - Panier
  - À propos
- **Gestion d'état globale** : Utilisation du React Context pour l'état du thème et du panier.

---

## 🛠️ Stack Technique

- **Front-end** : React (Create React App)
- **Langage** : JavaScript (ES6+)
- **Styles** : CSS3 / SCSS
- **Versionning** : Git & GitHub

---

## 📁 Structure du Projet

```text
Vigne_a_Domicile/
├── public/           # Fichiers publics et index.html
└── src/
    ├── assets/       # Images, logos et ressources graphiques
    ├── components/   # Composants React réutilisables
    ├── context/      # Contextes React (Gestion du thème, panier, etc.)
    ├── datas/        # Données de test / Mocks (fichiers JSON/JS)
    ├── pages/        # Composants de pages (Accueil, Panier, À propos)
    ├── styles/       # Styles globaux et modules CSS/SCSS
    └── index.js      # Point d'entrée principal de l'application
```

---

## 💻 Installation et Lancement

### Prérequis
- [Node.js](https://nodejs.org/) (version 16 ou supérieure recommandée)
- `npm` ou `yarn`

### 1. Cloner le projet
```bash
git clone https://github.com/Elouanlucas/Vigne_a_Domicile.git
cd Vigne_a_Domicile
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Démarrer l'application
```bash
npm start
```
L'application s'ouvrira automatiquement sur [http://localhost:3000](http://localhost:3000).

---

## 📦 Scripts Disponibles

Dans le répertoire du projet, vous pouvez exécuter :

- `npm start` : Lance l'application en mode développement.
- `npm test` : Exécute les tests interactifs.
- `npm run build` : Assemble l'application pour la production dans le dossier `build`.
