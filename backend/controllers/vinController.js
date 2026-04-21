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
    const { name, cover, price, category, description } = req.body;

    if (!name || !price || !category) {
        return res.status(400).json({ message: "Nom, prix et catégorie requis" });
    }

    try {
        const result = await db.query(
            'INSERT INTO vins (name, cover, price, category, description) VALUES (?, ?, ?, ?, ?)',
            [name, cover || null, price, category, description || null]
        );
        res.status(201).json({ message: "Vin ajouté avec succès!", id: result[0].insertId });
    } catch (err) {
        console.error("Erreur ajout vin:", err);
        res.status(500).json({ message: "Erreur lors de l'ajout du vin" });
    }
};

exports.updateVin = async (req, res) => {
    const { id } = req.params;
    const { name, cover, price, category, description } = req.body;

    try {
        await db.query(
            'UPDATE vins SET name = ?, cover = ?, price = ?, category = ?, description = ? WHERE id = ?',
            [name, cover || null, price, category, description || null, id]
        );
        res.json({ message: "Vin modifié avec succès!" });
    } catch (err) {
        console.error("Erreur modification vin:", err);
        res.status(500).json({ message: "Erreur lors de la modification du vin" });
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