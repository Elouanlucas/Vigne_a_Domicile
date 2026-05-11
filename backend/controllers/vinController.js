const db = require('../config/db');

exports.getAllVins = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM vins');
        res.json(rows);
    } catch (err) {
        console.error("Erreur SQL vins:", err);
        res.status(500).json({ message: "Erreur lors de la récupération des produits" });
    }
};

exports.addVin = async (req, res) => {
    // --- CHANGEMENT ICI : promotion_percentage ---
    const { name, price, quantity, category, description, promotion_percentage, recommandations } = req.body;
    const cover = req.file ? req.file.filename : null;

    if (!name || !price || !quantity || !category) {
        return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    try {
        const result = await db.query(
            // --- CHANGEMENT ICI : nom de la colonne ---
            'INSERT INTO vins (name, cover, price, quantity, category, description, promotion_percentage, recommandations) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                name, 
                cover, 
                price, 
                quantity, 
                category, 
                description || null, 
                // Si vide ou non défini, on envoie null
                promotion_percentage === '' ? null : promotion_percentage, 
                recommandations === 'true' || recommandations === true ? 1 : 0
            ]
        );
        res.status(201).json({ message: "Vin ajouté!", id: result[0].insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de l'ajout" });
    }
};

exports.updateVin = async (req, res) => {
    const { id } = req.params;
    // --- CHANGEMENT ICI : promotion_percentage ---
    const { name, price, quantity, category, description, promotion_percentage, recommandations } = req.body;
    
    try {
        const [oldVin] = await db.query('SELECT cover FROM vins WHERE id = ?', [id]);
        if (oldVin.length === 0) return res.status(404).json({ message: "Vin non trouvé" });

        const cover = req.file ? req.file.filename : oldVin[0].cover;

        await db.query(
            // --- CHANGEMENT ICI : promotion_percentage = ? ---
            'UPDATE vins SET name = ?, cover = ?, price = ?, quantity = ?, category = ?, description = ?, promotion_percentage = ?, recommandations = ? WHERE id = ?',
            [
                name, 
                cover, 
                price, 
                quantity, 
                category, 
                description || null, 
                promotion_percentage === '' ? null : promotion_percentage, 
                recommandations === 'true' || recommandations === true ? 1 : 0,
                id
            ]
        );
        res.json({ message: "Vin modifié!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur modification" });
    }
};

exports.deleteVin = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM vins WHERE id = ?', [id]);
        res.json({ message: "Vin supprimé avec succès!" });
    } catch (err) {
        console.error("Erreur suppression vin:", err);
        res.status(500).json({ message: "Erreur lors de la suppression du vin" });
    }
};

exports.updateStock = async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    try {
        await db.query('UPDATE vins SET quantity = ? WHERE id = ?', [quantity, id]);
        res.json({ message: "Stock mis à jour" });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la mise à jour du stock" });
    }
};