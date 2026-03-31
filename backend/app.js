const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// --- 1. CONFIGURATION DU POOL (Gère les connexions automatiquement) ---
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'e4a_user',
    password: process.env.DB_PASSWORD || 'e4a_password',
    database: process.env.DB_NAME || 'e4a_db',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10, 
    queueLimit: 0
});

// Test de connexion au démarrage pour les logs
pool.getConnection((err, conn) => {
    if (err) {
        console.error('❌ Erreur initiale MariaDB :', err.message);
    } else {
        console.log('✅ Pool MariaDB prêt et connecté !');
        conn.release();
    }
});

// Middleware de log
app.use((req, res, next) => {
    console.log(`📡 Requête reçue : ${req.method} ${req.url}`);
    next(); 
});

// --- 2. LA ROUTE UNIQUE ---
app.get('/', (req, res) => {
    // Avec le pool, on utilise directement pool.query
    pool.query('SELECT * FROM vins', (error, results) => {
        if (error) {
            console.error("❌ Erreur SQL :", error);
            return res.status(500).json([]); 
        }
        res.status(200).json(results || []);
    });
});

// --- 3. GESTION 404 ---
app.use((req, res) => {
    res.status(404).json([]);
});

// --- 4. DÉMARRAGE ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
});

module.exports = app;