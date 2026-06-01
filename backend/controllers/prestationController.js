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

// --- AJOUTER UNE PRESTATION ---
exports.addPrestation = async (req, res) => {
    const { nom, type, description, id_cave, adresse_fixe, prix, quantity } = req.body;
    const cover = req.file ? req.file.filename : null; // Récupère le nom du fichier uploadé

    try {
        const sql = `
            INSERT INTO prestations 
            (nom, type, cover, description, id_cave, adresse_fixe, prix, quantity) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(sql, [
            nom, 
            type, 
            cover, 
            description || null, 
            id_cave === "" ? null : id_cave, 
            adresse_fixe || null, 
            prix, 
            quantity || null
        ]);

        res.status(201).json({ message: "Succès", prestationId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la création" });
    }
};

// --- SUPPRIMER UNE PRESTATION ---
exports.deletePrestation = async (req, res) => {
    const { id } = req.params;

    try {
        const sql = "DELETE FROM prestations WHERE id = ?";
        const [result] = await db.execute(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Prestation non trouvée" });
        }

        res.status(200).json({ message: "Prestation supprimée avec succès" });
    } catch (error) {
        console.error("Erreur SQL deletePrestation:", error);
        res.status(500).json({ message: "Erreur lors de la suppression" });
    }
};

// --- MODIFIER UNE PRESTATION ---
exports.updatePrestation = async (req, res) => {
    const { id } = req.params;
    
    // Avec FormData, les données sont dans req.body
    const { nom, type, description, id_cave, adresse_fixe, prix, quantity } = req.body;

    try {
        // 1. On cherche l'ancienne prestation pour garder l'ancienne image si pas de nouvelle
        const [oldRows] = await db.execute("SELECT cover FROM prestations WHERE id = ?", [id]);
        if (oldRows.length === 0) return res.status(404).json({ message: "Prestation non trouvée" });

        // 2. On détermine le nom de l'image (nouveau fichier ou ancien nom)
        const cover = req.file ? req.file.filename : oldRows[0].cover;

        const sql = `
            UPDATE prestations 
            SET nom = ?, type = ?, cover = ?, description = ?, 
                id_cave = ?, adresse_fixe = ?, prix = ?, quantity = ? 
            WHERE id = ?
        `;
        
        await db.execute(sql, [
            nom, 
            type, 
            cover, 
            description || null, 
            id_cave === "" ? null : id_cave, 
            adresse_fixe || null, 
            prix, 
            quantity || null, 
            id
        ]);

        res.status(200).json({ message: "Prestation mise à jour avec succès" });
    } catch (error) {
        console.error("Erreur SQL updatePrestation:", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour" });
    }
};

// récupérer toutes les activités et les personne dessus 
exports.getAgendaDetails = async (req, res) => {
    // Vérification du rôle
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Accès refusé" });

    const sql = `
        SELECT 
            p.id, 
            p.nom, 
            p.type, 
            p.cover, 
            p.description, 
            p.prix, 
            p.quantity AS capacite_totale,
            cp.date_prestation,
            cp.heure_prestation,
            cp.adresse_prestation,
            u.nom AS user_nom,
            u.prenom AS user_prenom,
            u.email AS user_email,
            c.created_at AS date_achat,
            cp.quantity AS places_achetees
        FROM prestations p
        LEFT JOIN commande_prestations cp ON p.id = cp.prestation_id
        LEFT JOIN commandes c ON cp.commande_id = c.id
        LEFT JOIN Utilisateur u ON c.numUtilisateur = u.numUtilisateur
        ORDER BY cp.date_prestation ASC;
    `;

    try {
        // Utilisation de db.execute() avec await pour être raccord avec ton code
        const [results] = await db.execute(sql);

        // --- Transformation des données ---
        const agenda = results.reduce((acc, row) => {
            // Si pas de date de prestation (presta jamais réservée), on utilise une clé 'no-date'
            const dateStr = row.date_prestation ? row.date_prestation : 'sans-date';
            const sessionKey = `${row.id}-${dateStr}`;

            if (!acc[sessionKey]) {
                acc[sessionKey] = {
                    id: row.id,
                    nom: row.nom,
                    type: row.type,
                    cover: row.cover,
                    description: row.description,
                    prix: row.prix,
                    quantity: row.capacite_totale,
                    date_prestation: row.date_prestation,
                    heure_prestation: row.heure_prestation,
                    adresse_prestation: row.adresse_prestation,
                    participants: []
                };
            }

            if (row.user_email) {
                acc[sessionKey].participants.push({
                    nom_complet: `${row.user_prenom} ${row.user_nom}`,
                    email: row.user_email,
                    date_achat: row.date_achat,
                    places: row.places_achetees
                });
            }
            return acc;
        }, {});

        res.status(200).json(Object.values(agenda));
    } catch (error) {
        console.error("Erreur SQL getAgendaDetails:", error);
        res.status(500).json({ message: "Erreur lors de la récupération de l'agenda" });
    }
};

// --- DÉSINSCRIRE / SUPPRIMER UN PARTICIPANT D'UNE PRESTATION ---
exports.deleteParticipantFromPrestation = async (req, res) => {
    // Seul l'admin peut retirer quelqu'un d'un événement
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Accès refusé" });
    }

    const { prestationId, userEmail } = req.params;

    try {
        // 1. On récupère la ligne de commande_prestations liée à l'email de l'utilisateur
        const sqlDelete = `
            DELETE cp FROM commande_prestations cp
            JOIN commandes c ON cp.commande_id = c.id
            JOIN Utilisateur u ON c.numUtilisateur = u.numUtilisateur
            WHERE cp.prestation_id = ? AND u.email = ?
        `;

        const [result] = await db.execute(sqlDelete, [prestationId, userEmail]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Réservation ou utilisateur non trouvé pour cette prestation." });
        }

        res.status(200).json({ message: "Le participant a été retiré avec succès de cette prestation." });
    } catch (error) {
        console.error("Erreur SQL deleteParticipantFromPrestation:", error);
        res.status(500).json({ message: "Erreur lors de la suppression du participant" });
    }
};