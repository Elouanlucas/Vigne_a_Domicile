const db = require('../config/db'); // Configuration de base de données (MySQL / Pool)

const litigesController = {
    // 1. Récupérer les litiges
    // Si l'utilisateur est admin -> Il voit TOUS les litiges AVEC les infos du client associé
    // Si l'utilisateur est client -> Il ne voit que les siens
    getLitiges: async (req, res) => {
        const { id: numUtilisateur, role } = req.user;

        let query = '';
        let queryParams = [];

        if (role === 'admin') {
            // Pour l'admin : On joint la table Utilisateur pour récupérer les détails à la volée
            query = `
                SELECT 
                    l.*, 
                    u.login, u.nom, u.prenom, u.email, u.telephone, u.role, u.adresseDeLivraison
                FROM litiges l
                LEFT JOIN Utilisateur u ON l.numUtilisateur = u.numUtilisateur
                ORDER BY l.created_at DESC
            `;
        } else {
            // Pour le client : On filtre uniquement sur ses litiges (pas besoin des infos de l'utilisateur puisqu'il les connaît)
            query = `
                SELECT * FROM litiges 
                WHERE numUtilisateur = ? 
                ORDER BY created_at DESC
            `;
            queryParams.push(numUtilisateur);
        }

        try {
            const [results] = await db.query(query, queryParams);
            res.status(200).json(results);
        } catch (error) {
            console.error('Erreur lors de la récupération des litiges:', error);
            res.status(500).json({ message: 'Erreur lors de la récupération des litiges.' });
        }
    },

    // 2. Ajouter un litige
    addLitige: async (req, res) => {
        const numUtilisateur = req.user?.id;
        const { commande_id, prestation_id, type_motif, description, piece_jointe } = req.body;

        if (!numUtilisateur) {
            return res.status(401).json({ message: 'Utilisateur non authentifié.' });
        }

        // Validation basique
        if (!type_motif || !description) {
            return res.status(400).json({ message: 'Le motif et la description sont obligatoires.' });
        }

        const query = `
            INSERT INTO litiges (commande_id, numUtilisateur, prestation_id, type_motif, description, piece_jointe) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            commande_id || null, 
            numUtilisateur, 
            prestation_id || null, 
            type_motif, 
            description, 
            piece_jointe || null
        ];

        try {
            const [result] = await db.query(query, values);
            res.status(201).json({ 
                message: 'Litige déclaré avec succès.', 
                litigeId: result.insertId 
            });
        } catch (error) {
            console.error('Erreur lors de la création du litige:', error);
            res.status(500).json({ message: 'Erreur interne du serveur lors de la déclaration.' });
        }
    },

    // 3. Mettre à jour un litige (Changer le statut par exemple)
    updateLitige: async (req, res) => {
        const { id } = req.params;
        const { statut, type_motif, description } = req.body;
        const { role } = req.user;

        try {
            // Étape 1 : Vérifier si le litige existe
            const [litige] = await db.query('SELECT * FROM litiges WHERE id = ?', [id]);
            if (litige.length === 0) {
                return res.status(404).json({ message: 'Litige non trouvé.' });
            }

            // Sécurité : Seul un admin peut changer le statut d'un litige
            if (statut && role !== 'admin') {
                return res.status(403).json({ message: 'Seul un administrateur peut modifier le statut d’un litige.' });
            }

            // Construire dynamiquement la requête de mise à jour selon ce qui est envoyé
            let fieldsToUpdate = [];
            let values = [];

            if (statut) { fieldsToUpdate.push('statut = ?'); values.push(statut); }
            if (type_motif) { fieldsToUpdate.push('type_motif = ?'); values.push(type_motif); }
            if (description) { fieldsToUpdate.push('description = ?'); values.push(description); }

            if (fieldsToUpdate.length === 0) {
                return res.status(400).json({ message: 'Aucun champ à modifier fourni.' });
            }

            values.push(id); // Pour le WHERE id = ?
            const query = `UPDATE litiges SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;

            await db.query(query, values);
            res.status(200).json({ message: 'Litige mis à jour avec succès.' });

        } catch (error) {
            console.error('Erreur lors de la modification du litige:', error);
            res.status(500).json({ message: 'Erreur lors de la modification du litige.' });
        }
    },

    // 4. Supprimer un litige
    deleteLitige: async (req, res) => {
        const { id } = req.params;
        const { id: numUtilisateur, role } = req.user;

        try {
            // Vérifier si le litige existe et appartient à l'utilisateur (sauf si admin)
            const [litige] = await db.query('SELECT * FROM litiges WHERE id = ?', [id]);
            
            if (litige.length === 0) {
                return res.status(404).json({ message: 'Litige introuvable.' });
            }

            if (litige[0].numUtilisateur !== numUtilisateur && role !== 'admin') {
                return res.status(403).json({ message: 'Vous n’avez pas l’autorisation de supprimer ce litige.' });
            }

            await db.query('DELETE FROM litiges WHERE id = ?', [id]);
            res.status(200).json({ message: 'Litige supprimé avec succès.' });

        } catch (error) {
            console.error('Erreur lors de la suppression du litige:', error);
            res.status(500).json({ message: 'Erreur lors de la suppression du litige.' });
        }
    }
};

module.exports = litigesController;