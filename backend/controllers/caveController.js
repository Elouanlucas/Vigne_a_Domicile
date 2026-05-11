const db = require('../config/db');

// --- RÉCUPÉRER TOUTES LES CAVES ---
exports.getCaves = async (req, res) => {
    try {
        const sql = "SELECT * FROM cave ORDER BY id DESC"; // Trié par les plus récentes
        const [rows] = await db.execute(sql);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Erreur SQL getCaves:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des caves" });
    }
};

// --- AJOUTER UNE CAVE ---
exports.addCave = async (req, res) => { 
    const { nom, adresse, quantite, description } = req.body;

    // Validation simple
    if (!nom || !adresse || quantite === undefined) {
        return res.status(400).json({ message: "Le nom, l'adresse et la quantité sont obligatoires." });
    }

    try {
        const sql = "INSERT INTO cave (nom, adresse, quantite, description) VALUES (?, ?, ?, ?)";
        const [result] = await db.execute(sql, [nom, adresse, quantite, description || null]);
        
        res.status(201).json({ 
            message: "Cave ajoutée avec succès", 
            caveId: result.insertId 
        });
    } catch (error) {
        console.error("Erreur SQL addCave:", error);
        res.status(500).json({ message: "Erreur lors de l'ajout de la cave" });
    }
};

// --- SUPPRIMER UNE CAVE ---
exports.deleteCave = async (req, res) => {
    const { id } = req.params;

    try {
        const sql = "DELETE FROM cave WHERE id = ?";
        const [result] = await db.execute(sql, [id]);

        // Vérifier si une ligne a vraiment été supprimée
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Cave non trouvée" });
        }

        res.status(200).json({ message: "Cave supprimée avec succès" });
    } catch (error) {
        console.error("Erreur SQL deleteCave:", error);
        res.status(500).json({ message: "Erreur lors de la suppression" });
    }
};

// --- METTRE À JOUR UNE CAVE ---
exports.updateCave = async (req, res) => {
    const { id } = req.params;
    const { nom, adresse, quantite, description } = req.body;

    // Validation
    if (!nom || !adresse || quantite === undefined) {
        return res.status(400).json({ message: "Champs manquants pour la mise à jour." });
    }

    try {
        const sql = "UPDATE cave SET nom = ?, adresse = ?, quantite = ?, description = ? WHERE id = ?";
        const [result] = await db.execute(sql, [nom, adresse, quantite, description || null, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Cave non trouvée ou aucune modification effectuée" });
        }

        res.status(200).json({ message: "Cave mise à jour avec succès" });
    } catch (error) {
        console.error("Erreur SQL updateCave:", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour" });
    }
};