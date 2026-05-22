const db = require('../config/db.js'); 

/**
 * Récupérer tous les messages du livre d'or validés avec le login de l'auteur
 */
exports.getAllMessages = async (req, res) => {
    try {
        const query = `
            SELECT 
                l.id, l.numUtilisateur, l.avis_prestation, l.avis_vin, 
                l.note_generale, l.avis_livraison, l.avis_SAV, l.avis_site, 
                l.message, l.created_at, u.login, l.reponse_admin
            FROM livre_d_or l
            JOIN Utilisateur u ON l.numUtilisateur = u.numUtilisateur
            ORDER BY l.created_at DESC
        `;
        const [rows] = await db.execute(query);
        return res.status(200).json(rows);
    } catch (error) {
        console.error('Erreur lors de la récupération du livre d\'or :', error);
        return res.status(500).json({ message: 'Une erreur interne est survenue.' });
    }
};

/**
 * Ajouter un nouveau message dans la table tempo (en attente de modération)
 */
exports.createMessage = async (req, res) => {
    const { 
        message, numUtilisateur, avis_prestation, avis_vin, 
        note_generale, avis_livraison, avis_SAV, avis_site 
    } = req.body;

    if (!message || message.trim() === '') {
        return res.status(400).json({ message: 'Le message ne peut pas être vide.' });
    }
    if (!numUtilisateur) {
        return res.status(400).json({ message: 'L\'identifiant de l\'utilisateur est manquant.' });
    }

    try {
        const query = `
            INSERT INTO livre_d_or_tempo (
                numUtilisateur, avis_prestation, avis_vin, note_generale, 
                avis_livraison, avis_SAV, avis_site, message
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const noteValidee = note_generale ? parseInt(note_generale) : 5;
        const values = [
            numUtilisateur, avis_prestation || 0, avis_vin || 0, noteValidee,
            avis_livraison || 0, avis_SAV || 0, avis_site || 0, message
        ];

        const [result] = await db.execute(query, values);
        return res.status(201).json({ message: 'Message ajouté en attente de modération !' });
    } catch (error) {
        console.error('Erreur lors de la création du message :', error);
        return res.status(500).json({ message: 'Une erreur interne est survenue.' });
    }
};

/**
 * ADMIN : Récupérer tous les messages en attente (table temporaire)
 */
exports.getTempoMessages = async (req, res) => {
    try {
        const query = `
            SELECT t.*, u.login 
            FROM livre_d_or_tempo t
            JOIN Utilisateur u ON t.numUtilisateur = u.numUtilisateur
            ORDER BY t.created_at ASC
        `;
        const [rows] = await db.execute(query);
        return res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erreur lors de la récupération des messages tempo.' });
    }
};

/**
 * ADMIN : Valider un message (Transfert de tempo vers table finale + réponse admin)
 */
exports.validerMessage = async (req, res) => {
    const tempoId = req.params.id;
    const { reponse_admin } = req.body;

    try {
        await db.query("START TRANSACTION");

        // Récupérer le message dans la table tempo
        const [tempoRows] = await db.execute("SELECT * FROM livre_d_or_tempo WHERE id = ?", [tempoId]);
        if (tempoRows.length === 0) {
            await db.query("ROLLBACK");
            return res.status(404).json({ message: "Message introuvable." });
        }

        const msg = tempoRows[0];

        // Insérer dans la table finale livre_d_or
        const insertQuery = `
            INSERT INTO livre_d_or (
                numUtilisateur, avis_prestation, avis_vin, note_generale, 
                avis_livraison, avis_SAV, avis_site, message, reponse_admin, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await db.execute(insertQuery, [
            msg.numUtilisateur, msg.avis_prestation, msg.avis_vin, msg.note_generale,
            msg.avis_livraison, msg.avis_SAV, msg.avis_site, msg.message, reponse_admin || null, msg.created_at
        ]);

        // Supprimer de la table tempo
        await db.execute("DELETE FROM livre_d_or_tempo WHERE id = ?", [tempoId]);

        await db.query("COMMIT");
        return res.status(200).json({ message: "Message validé et publié avec succès !" });
    } catch (err) {
        await db.query("ROLLBACK");
        console.error(err);
        return res.status(500).json({ message: "Erreur lors du transfert du message." });
    }
};

/**
 * ADMIN : Refuser un message (Suppression définitive de la table tempo)
 */
exports.refuserMessage = async (req, res) => {
    try {
        await db.execute("DELETE FROM livre_d_or_tempo WHERE id = ?", [req.params.id]);
        return res.status(200).json({ message: "Message refusé et supprimé." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur lors de la suppression." });
    }
};