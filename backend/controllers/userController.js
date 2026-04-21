const db = require('../config/db');
const fs = require('fs');

// --- RÉCUPÉRER LES INFOS DU PROFIL ---
exports.getUserInfos = async (req, res) => {
    const login = req.params.login;
    
    // Sécurité : un utilisateur ne peut voir que son propre profil
    if (req.user.login !== login) {
        return res.status(403).json({ message: "Accès non autorisé" });
    }
    
    try {
        const sql = `
            SELECT nom, prenom, login, email, dateDeNaissance, 
                   telephone, role, adresseDeLivraison, photo 
            FROM Utilisateur 
            WHERE login = ?
        `;
        const [results] = await db.query(sql, [login]);

        if (results.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json(results[0]);
    } catch (error) {
        console.error("❌ Erreur récupération profil :", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération" });
    }
};

// --- METTRE À JOUR LA PHOTO (BLOB) ---
exports.updatePhoto = async (req, res) => {
    const { login } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ message: "Aucun fichier reçu par le serveur" });
    }

    const filePath = req.file.path;

    try {
        // Lecture du fichier image temporaire en binaire
        const imageBinaire = fs.readFileSync(filePath);
        
        const sql = "UPDATE Utilisateur SET photo = ? WHERE login = ?";
        await db.query(sql, [imageBinaire, login]);

        // Nettoyage : on supprime le fichier du dossier /uploads après l'avoir mis en BDD
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); 
        }
        
        res.json({ message: "Photo enregistrée avec succès !" });
    } catch (error) {
        console.error("❌ Erreur SQL Photo:", error);
        // On nettoie quand même le fichier en cas d'erreur
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).json({ error: "Erreur BDD lors de l'enregistrement de l'image" });
    }
};

// --- METTRE À JOUR L'ADRESSE ---
exports.updateAddress = async (req, res) => {
    const { login, adresse } = req.body;

    if (req.user.login !== login) {
        return res.status(403).json({ message: "Action non autorisée" });
    }

    try {
        const sql = "UPDATE Utilisateur SET adresseDeLivraison = ? WHERE login = ?";
        await db.query(sql, [adresse, login]);
        res.json({ message: "Adresse mise à jour avec succès" });
    } catch (error) {
        console.error("❌ Erreur MAJ adresse:", error);
        res.status(500).json({ message: "Erreur serveur lors de la mise à jour" });
    }
};

// Mettre à jour le nom, prénom, email et téléphone
exports.updateProfile = async (req, res) => {
    const { login, nom, prenom, email, telephone } = req.body;

    // Vérification de sécurité : l'utilisateur modifie son propre profil
    if (req.user.login !== login) {
        return res.status(403).json({ message: "Action non autorisée" });
    }

    try {
        const sql = `
            UPDATE Utilisateur 
            SET nom = ?, prenom = ?, email = ?, telephone = ? 
            WHERE login = ?
        `;
        await db.query(sql, [nom, prenom, email, telephone, login]);
        res.json({ message: "Profil mis à jour avec succès !" });
    } catch (error) {
        console.error("Erreur MAJ profil:", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour" });
    }
};

// --- SUPPRIMER L'UTILISATEUR ---
exports.deleteUser = async (req, res) => {
    const login = req.params.login;

    // Sécurité : Un utilisateur ne peut supprimer que son propre compte
    // (Sauf s'il est admin, mais ici on reste sur la logique de profil personnel)
    if (req.user.login !== login) {
        return res.status(403).json({ message: "Action non autorisée" });
    }

    try {
        const sql = "DELETE FROM Utilisateur WHERE login = ?";
        const [result] = await db.query(sql, [login]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json({ message: "Compte supprimé avec succès" });
    } catch (error) {
        console.error("❌ Erreur suppression compte :", error);
        res.status(500).json({ message: "Erreur serveur lors de la suppression" });
    }
};

// --- [ADMIN] RÉCUPÉRER TOUS LES UTILISATEURS ---
exports.getAllUsers = async (req, res) => {
    try {
        // On récupère tout le monde pour le tableau admin
        const sql = "SELECT nom, prenom, login, email, role, telephone FROM Utilisateur";
        const [results] = await db.query(sql);
        res.json(results);
    } catch (error) {
        console.error("❌ Erreur récupération liste utilisateurs :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" });
    }
};

// --- [ADMIN] SUPPRIMER UN UTILISATEUR (PAR ADMIN) ---
exports.adminDeleteUser = async (req, res) => {
    const loginToDelete = req.params.login;

    // Ici, on ne vérifie pas si c'est son propre compte car c'est l'ADMIN qui agit
    // La sécurité "isAdmin" sera gérée dans le fichier de routes
    try {
        const sql = "DELETE FROM Utilisateur WHERE login = ?";
        const [result] = await db.query(sql, [loginToDelete]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json({ message: "Utilisateur supprimé par l'administrateur" });
    } catch (error) {
        console.error("❌ Erreur suppression admin :", error);
        res.status(500).json({ message: "Erreur serveur lors de la suppression" });
    }
};