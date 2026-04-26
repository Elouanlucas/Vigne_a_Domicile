const db = require('../config/db');

exports.getPrestations = async (req, res) => {
    try {
        // Requête avec jointure pour avoir les détails de la cave si id_cave n'est pas nul
        const query = `
            SELECT p.*, c.nom AS cave_nom, c.adresse AS cave_adresse 
            FROM prestations p
            LEFT JOIN cave c ON p.id_cave = c.id
        `;
        
        const [rows] = await db.execute(query);
        
        res.status(200).json(rows);
    } catch (error) {
        console.error("Erreur lors de la récupération des prestations :", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des prestations" });
    }
};

// Optionnel : Récupérer une seule prestation par son ID
exports.getPrestationById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT p.*, c.nom AS cave_nom, c.adresse AS cave_adresse 
            FROM prestations p
            LEFT JOIN cave c ON p.id_cave = c.id
            WHERE p.id = ?
        `;
        const [rows] = await db.execute(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Prestation non trouvée" });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Récupérer les prestations d'un utilisateur spécifique
exports.getPrestationsByUserId = async (req, res) => {
    const userId = req.params.userId;
    try {
        const sql = `
            SELECT 
                cp.id, 
                p.nom AS titre, 
                p.description,
                p.cover,
                p.type,
                cp.date_prestation, 
                cp.heure_prestation,
                cp.adresse_prestation,
                cp.unit_price,
                c.status
            FROM commande_prestations cp
            JOIN prestations p ON cp.prestation_id = p.id
            JOIN commandes c ON cp.commande_id = c.id
            WHERE c.numUtilisateur = ?
        `;
        const [rows] = await db.execute(sql, [userId]);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Erreur SQL:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};