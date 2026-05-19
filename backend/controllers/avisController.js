const db = require('../config/db');

// =========================================================================
// 1. RÉCUPÉRER LES AVIS D'UN VIN
// =========================================================================
exports.getAvisByVin = async (req, res) => {
    try {
        const { vinId } = req.params;
        if (!vinId) return res.status(400).json({ error: "L'identifiant du vin est requis." });

        const query = `
            SELECT a.id, a.note, a.commentaire, a.reponse_admin, a.created_at, u.nom, u.prenom 
            FROM avis a
            INNER JOIN Utilisateur u ON a.numUtilisateur = u.numUtilisateur
            WHERE a.vin_id = ?
            ORDER BY a.created_at DESC
        `;
        const [rows] = await db.query(query, [vinId]);
        return res.status(200).json(rows || []);
    } catch (err) {
        console.error("❌ Erreur dans getAvisByVin:", err.message);
        return res.status(500).json({ error: "Une erreur interne est survenue." });
    }
};

// =========================================================================
// 2. RÉCUPÉRER LES AVIS D'UNE PRESTATION
// =========================================================================
exports.getAvisByPrestation = async (req, res) => {
    try {
        const { prestationId } = req.params;
        if (! prestationId) return res.status(400).json({ error: "L'identifiant de la prestation est requis." });

        const query = `
            SELECT a.id, a.note, a.commentaire, a.reponse_admin, a.created_at, u.nom, u.prenom 
            FROM avis a
            INNER JOIN Utilisateur u ON a.numUtilisateur = u.numUtilisateur
            WHERE a.prestation_id = ?
            ORDER BY a.created_at DESC
        `;
        const [rows] = await db.query(query, [prestationId]);
        return res.status(200).json(rows || []);
    } catch (err) {
        console.error("❌ Erreur dans getAvisByPrestation:", err.message);
        return res.status(500).json({ error: "Une erreur interne est survenue." });
    }
};

// =========================================================================
// 3. RÉCUPÉRER TOUS LES AVIS (Global pour l'espace d'administration)
// =========================================================================
exports.getAllAvisGlobal = async (req, res) => {
    try {
        const query = `
            SELECT 
                a.id, a.numUtilisateur, a.vin_id, a.prestation_id, a.note, a.commentaire, a.reponse_admin, a.created_at,
                u.nom, u.prenom,
                v.name AS vin_nom,     
                p.nom AS prestation_nom
            FROM avis a
            INNER JOIN Utilisateur u ON a.numUtilisateur = u.numUtilisateur
            LEFT JOIN vins v ON a.vin_id = v.id      
            LEFT JOIN prestations p ON a.prestation_id = p.id
            ORDER BY a.created_at DESC
        `;
        const [rows] = await db.query(query);
        return res.status(200).json(rows || []);
    } catch (err) {
        console.error("❌ Erreur dans getAllAvisGlobal:", err.message);
        return res.status(500).json({ error: "Une erreur interne est survenue sur le serveur." });
    }
};

// =========================================================================
// 4. CRÉER UN AVIS (VIN OU PRESTATION)
// =========================================================================
exports.createAvis = async (req, res) => {
    try {
        const { numUtilisateur, vin_id, prestation_id, note, commentaire } = req.body;

        if (!numUtilisateur || note === undefined || !commentaire?.trim()) {
            return res.status(400).json({ error: "L'utilisateur, la note et le commentaire sont obligatoires." });
        }
        if (!vin_id && !prestation_id) {
            return res.status(400).json({ error: "L'avis doit être lié à un vin ou à une prestation." });
        }
        if (note < 1 || note > 5) {
            return res.status(400).json({ error: "La note doit être comprise entre 1 et 5." });
        }

        const query = `
            INSERT INTO avis (numUtilisateur, vin_id, prestation_id, note, commentaire) 
            VALUES (?, ?, ?, ?, ?)
        `;
        await db.query(query, [numUtilisateur, vin_id || null, prestation_id || null, note, commentaire.trim()]);
        return res.status(201).json({ message: "Votre avis a été ajouté avec succès !" });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "Vous avez déjà laissé un avis sur cet élément !" });
        }
        console.error("❌ Erreur dans createAvis:", err.message);
        return res.status(500).json({ error: "Une erreur interne est survenue lors de l'ajout." });
    }
};

// =========================================================================
// 5. RÉCUPÉRER TOUS LES AVIS D'UN UTILISATEUR (Pour son espace client)
// =========================================================================
exports.getAvisByUtilisateur = async (req, res) => {
    try {
        const { numUtilisateur } = req.params;
        if (!numUtilisateur) return res.status(400).json({ error: "L'identifiant utilisateur est requis." });

        const query = `
            SELECT 
                a.id, a.vin_id, a.prestation_id, a.note, a.commentaire, a.reponse_admin, a.created_at,
                v.name AS vin_nom,     
                p.nom AS prestation_nom
            FROM avis a
            LEFT JOIN vins v ON a.vin_id = v.id      
            LEFT JOIN prestations p ON a.prestation_id = p.id
            WHERE a.numUtilisateur = ?
            ORDER BY a.created_at DESC
        `;

        const [rows] = await db.query(query, [numUtilisateur]);
        return res.status(200).json(rows || []);
    } catch (err) {
        console.error("❌ Erreur dans getAvisByUtilisateur:", err.message);
        return res.status(500).json({ error: "Erreur lors de la récupération de vos avis." });
    }
};

// =========================================================================
// 6. MODIFIER UN AVIS EXISTANT (Par le client)
// =========================================================================
exports.updateAvis = async (req, res) => {
    try {
        const { id } = req.params;
        const { note, commentaire } = req.body;

        if (note === undefined || !commentaire?.trim()) {
            return res.status(400).json({ error: "La note et le commentaire ne peuvent pas être vides." });
        }
        if (note < 1 || note > 5) {
            return res.status(400).json({ error: "La note doit être comprise entre 1 et 5." });
        }

        const query = `UPDATE avis SET note = ?, commentaire = ? WHERE id = ?`;
        const [result] = await db.query(query, [note, commentaire.trim(), id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Avis introuvable ou aucune modification effectuée." });
        }

        return res.status(200).json({ message: "Avis mis à jour avec succès !" });
    } catch (err) {
        console.error("❌ Erreur dans updateAvis:", err.message);
        return res.status(500).json({ error: "Erreur interne lors de la modification de l'avis." });
    }
};

// =========================================================================
// 7. SUPPRIMER UN AVIS (Modération admin ou suppression client)
// =========================================================================
exports.deleteAvis = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `DELETE FROM avis WHERE id = ?`;
        const [result] = await db.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Avis introuvable." });
        }

        return res.status(200).json({ message: "Avis supprimé avec succès." });
    } catch (err) {
        console.error("❌ Erreur dans deleteAvis:", err.message);
        return res.status(500).json({ error: "Erreur interne lors de la suppression." });
    }
};

// =========================================================================
// 8. AJOUTER / MODIFIER UNE RÉPONSE ADMINISTRATEUR
// =========================================================================
exports.respondAsAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { reponse_admin } = req.body;

        const texteReponse = reponse_admin?.trim() ? reponse_admin.trim() : null;

        const query = `UPDATE avis SET reponse_admin = ? WHERE id = ?`;
        const [result] = await db.query(query, [texteReponse, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Avis introuvable." });
        }

        return res.status(200).json({ 
            message: texteReponse ? "Réponse enregistrée avec succès !" : "Réponse supprimée avec succès." 
        });
    } catch (err) {
        console.error("❌ Erreur dans respondAsAdmin:", err.message);
        return res.status(500).json({ error: "Erreur interne lors de l'enregistrement de la réponse admin." });
    }
};