const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_change_in_production';

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- MIDDLEWARE DE VÉRIFICATION DU TOKEN ---
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: "Token manquant" });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token invalide ou expiré" });
    }
};

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

// Route pour l'INSCRIPTION
app.post('/api/register', async (req, res) => {
    const { login, motDePasse, nom, prenom, dateDeNaissance, email, telephone } = req.body;

    try {
        // 1. Hachage du mot de passe
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(motDePasse, saltRounds);

        // 2. Insertion via le pool
        const sql = `
            INSERT INTO Utilisateur 
            (login, motDePasse, nom, prenom, dateDeNaissance, email, telephone, role) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'client')
        `;

        pool.query(
            sql, 
            [login, hashedPassword, nom, prenom, dateDeNaissance, email, telephone], 
            (err, result) => {
                if (err) {
                    console.error("❌ Erreur SQL Inscription :", err);
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ message: "Le login ou l'email existe déjà." });
                    }
                    return res.status(500).json({ message: "Erreur lors de l'enregistrement." });
                }
                res.status(201).json({ message: "Utilisateur créé avec succès !" });
            }
        );

    } catch (error) {
        console.error("❌ Erreur Hash :", error);
        res.status(500).json({ message: "Erreur technique serveur." });
    }
});

// Route pour la CONNEXION
app.post('/api/login', (req, res) => {
    const { login, motDePasse } = req.body;

    // 1. On cherche l'utilisateur par son login
    const sql = "SELECT * FROM Utilisateur WHERE login = ?";
    
    pool.query(sql, [login], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Erreur serveur" });
        }

        // 2. Si l'utilisateur n'existe pas
        if (results.length === 0) {
            return res.status(401).json({ message: "Identifiants incorrects" });
        }

        const user = results[0];

        // 3. Comparaison du mot de passe saisi avec le hash en BDD
        try {
            const match = await bcrypt.compare(motDePasse, user.motDePasse);

            if (match) {
                // Succès ! Génération du token JWT
                const token = jwt.sign(
                    { id: user.id_utilisateur, login: user.login, role: user.role },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                );
                
                const { motDePasse, ...userWithoutPass } = user;
                res.status(200).json({ 
                    message: "Connexion réussie", 
                    token: token,
                    user: userWithoutPass 
                });
            } else {
                // Mot de passe incorrect
                res.status(401).json({ message: "Identifiants incorrects" });
            }
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la vérification" });
        }
    });
});

// Route pour récupérer les infos d'un utilisateur (protégée par token)
app.get('/api/user/:login', verifyToken, (req, res) => {
    const login = req.params.login;
    
    // Vérifier que l'utilisateur ne peut accéder qu'à ses propres infos
    if (req.user.login !== login) {
        return res.status(403).json({ message: "Accès non autorisé" });
    }
    
    const sql = "SELECT nom, prenom, login, email, dateDeNaissance, telephone, role FROM Utilisateur WHERE login = ?";

    pool.query(sql, [login], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Erreur lors de la récupération" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.json(results[0]);
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