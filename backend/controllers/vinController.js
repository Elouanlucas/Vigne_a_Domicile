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
    // Les textes sont dans req.body, le fichier est dans req.file
    const { name, price, category, description } = req.body;
    const cover = req.file ? req.file.filename : null; // On récupère le nom généré par Multer

    if (!name || !price || !category) {
        return res.status(400).json({ message: "Nom, prix et catégorie requis" });
    }

    try {
        const result = await db.query(
            'INSERT INTO vins (name, cover, price, category, description) VALUES (?, ?, ?, ?, ?)',
            [name, cover, price, category, description || null]
        );
        res.status(201).json({ message: "Vin ajouté!", id: result[0].insertId });
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de l'ajout" });
    }
};

exports.updateVin = async (req, res) => {
    const { id } = req.params;
    const { name, price, category, description } = req.body;
    
    try {
        // On récupère l'ancienne image pour ne pas l'écraser si on n'en télécharge pas de nouvelle
        const [oldVin] = await db.query('SELECT cover FROM vins WHERE id = ?', [id]);
        const cover = req.file ? req.file.filename : oldVin[0].cover;

        await db.query(
            'UPDATE vins SET name = ?, cover = ?, price = ?, category = ?, description = ? WHERE id = ?',
            [name, cover, price, category, description || null, id]
        );
        res.json({ message: "Vin modifié!" });
    } catch (err) {
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