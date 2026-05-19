require('dotenv').config(); // Charge les variables d'environnement du fichier .env
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import des routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const vinRoutes = require('./routes/vinRoutes');
const prestationRoutes = require('./routes/prestationRoutes');
const caveRoutes = require('./routes/caveRoutes');
const promoRoutes = require('./routes/promoRoutes');
const litigesRoutes = require('./routes/litigesRoutes');

const app = express();

// --- MIDDLEWARES GLOBAUX ---
app.use(cors()); // Autorise les requêtes provenant du Front (React)
app.use(express.json()); // Permet de lire le corps des requêtes en JSON
app.use(express.urlencoded({ extended: true })); // Permet de lire les données des formulaires (pour Multer)

// --- FICHIERS STATIQUES ---
// Rend le dossier 'uploads' accessible via une URL (ex: http://localhost:3001/uploads/image.jpg)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- BRANCHEMENT DES ROUTES ---
// On préfixe toutes les routes par /api pour la cohérence
app.use('/api/auth', authRoutes);   // Gère /api/auth/login et /api/auth/register
app.use('/api/user', userRoutes);   // Gère /api/user/:login, /api/user/update-photo, etc.
app.use('/api/orders', orderRoutes); // Gère /api/orders/ et /api/orders/recuperer/:userId
app.use('/api/vins', vinRoutes);     // Gère /api/vins/ et /api/vins/:id
app.use('/api/prestations', prestationRoutes); // Gère /api/prestations/
app.use('/api/caves', caveRoutes); // Gère /api/caves/ et /api/caves/:id
app.use('/api/promo', promoRoutes); // Gère /api/promo/validate et /api/promo/details/:code
app.use('/api/litiges', litigesRoutes); // Gère /api/litiges/ et /api/litiges/:id


// --- GESTION DES ERREURS 404 ---
app.use((req, res) => {
    res.status(404).json({ message: "Route non trouvée sur le serveur" });
});

// --- DÉMARRAGE DU SERVEUR ---
const PORT = process.env.PORT || 3001;
// On écoute sur 0.0.0.0 pour que ce soit accessible depuis Docker ou le réseau local
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur Backend démarré sur : http://localhost:${PORT}`);
    console.log(`📡 Routes actives : /api/auth, /api/user, /api/orders, /api/litiges, `);
});

module.exports = app;