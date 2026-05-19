const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_change_in_production';

// --- INSCRIPTION ---
exports.register = async (req, res) => {
    const { login, motDePasse, nom, prenom, dateDeNaissance, email, telephone } = req.body;

    try {
        // 1. Hachage du mot de passe
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(motDePasse, saltRounds);

        // 2. Insertion via le pool (version promise)
        const sql = `
            INSERT INTO Utilisateur 
            (login, motDePasse, nom, prenom, dateDeNaissance, email, telephone, role) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'client')
        `;

        await db.query(sql, [login, hashedPassword, nom, prenom, dateDeNaissance, email, telephone]);
        
        res.status(201).json({ message: "Utilisateur créé avec succès !" });

    } catch (error) {
        console.error("❌ Erreur Inscription :", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Le login ou l'email existe déjà." });
        }
        res.status(500).json({ message: "Erreur technique lors de l'enregistrement." });
    }
};

// --- CONNEXION ---
exports.login = async (req, res) => {
    const { login, motDePasse } = req.body;

    try {
        // 1. On cherche l'utilisateur
        const sql = "SELECT * FROM Utilisateur WHERE login = ?";
        const [results] = await db.query(sql, [login]);

        if (results.length === 0) {
            return res.status(401).json({ message: "Identifiants incorrects" });
        }

        const user = results[0];

        // 2. Comparaison du mot de passe
        const match = await bcrypt.compare(motDePasse, user.motDePasse);

        if (!match) {
            return res.status(401).json({ message: "Identifiants incorrects" });
        }

        // 3. Génération du token JWT
        const token = jwt.sign(
            { id: user.numUtilisateur, login: user.login, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        // On retire le mot de passe avant d'envoyer l'objet user au front
        const { motDePasse: pass, ...userWithoutPass } = user;

        res.status(200).json({ 
            message: "Connexion réussie", 
            token: token,
            user: userWithoutPass 
        });

    } catch (error) {
        console.error("❌ Erreur Login :", error);
        res.status(500).json({ message: "Erreur lors de la vérification" });
    }
};