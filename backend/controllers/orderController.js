const db = require('../config/db');

// --- VALIDER LA COMMANDE FINALE (Après clic sur Payer) ---
exports.validateFinalOrder = async (req, res) => {
    const { numUtilisateur, total_price, items } = req.body;

    // On commence une TRANSACTION pour s'assurer que tout se passe bien
    // ou que rien ne change en cas d'erreur
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Créer la commande
        const [orderResult] = await connection.query(
            'INSERT INTO commandes (numUtilisateur, total_price, status) VALUES (?, ?, ?)',
            [numUtilisateur, total_price, 'en_attente']
        );
        const commandeId = orderResult.insertId;

        // 2. Parcourir les articles pour les insérer ET mettre à jour le stock
        for (const item of items) {
            // Insertion dans commande_items
            await connection.query(
                'INSERT INTO commande_items (commande_id, id_vin, quantity, unit_price) VALUES (?, ?, ?, ?)',
                [commandeId, item.id_vin, item.quantity, item.unit_price]
            );

            // --- MISE À JOUR DU STOCK ---
            // On retire la quantité achetée de la colonne 'quantity' de la table 'vins'
            await connection.query(
                'UPDATE vins SET quantity = quantity - ? WHERE id = ?',
                [item.quantity, item.id_vin]
            );
        }

        // Si tout est OK, on valide les changements
        await connection.commit();
        res.status(201).json({ message: "Commande validée et stock mis à jour !" });

    } catch (error) {
        // En cas d'erreur, on annule tout (le stock n'est pas déduit)
        await connection.rollback();
        console.error("Erreur commande:", error);
        res.status(500).json({ message: "Erreur lors de la validation", error: error.message });
    } finally {
        connection.release();
    }
};

// --- CRÉER UNE COMMANDE (PANIER) ---
exports.createOrderPanier = async (req, res) => {
    const { numUtilisateur, total_price, items } = req.body;

    if (!numUtilisateur || !items || items.length === 0) {
        return res.status(400).json({ message: "Données de commande incomplètes" });
    }

    // On récupère une connexion spécifique pour gérer la TRANSACTION
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Insertion dans panier_utilisateur
        const [orderResult] = await connection.execute(
            'INSERT INTO panier_utilisateur (numUtilisateur, total_price, status) VALUES (?, ?, ?)',
            [numUtilisateur, total_price, 'en_attente']
        );
        
        const orderId = orderResult.insertId;

        // 2. Insertion des items en parallèle
        const itemPromises = items.map(item => {
            return connection.execute(
                'INSERT INTO panier_items (order_id, id_vin, quantity, unit_price) VALUES (?, ?, ?, ?)',
                [orderId, item.id_vin, item.quantity, item.unit_price]
            );
        });

        await Promise.all(itemPromises);

        // Si tout est OK, on valide
        await connection.commit();
        
        res.status(201).json({ message: "Commande créée avec succès", orderId });

    } catch (error) {
        // En cas d'erreur, on annule tout ce qui a été fait au-dessus
        await connection.rollback();
        console.error("❌ Erreur Transaction Commande :", error);
        res.status(500).json({ message: "Erreur lors de l'enregistrement", details: error.message });
    } finally {
        connection.release(); // Très important : on libère la connexion pour les autres
    }
};

// --- RÉCUPÉRER LE PANIER EN ATTENTE ---
exports.getPendingCart = async (req, res) => {
    const userId = req.params.userId;

    try {
        // 1. Trouver le dernier panier 'en_attente'
        const sqlPanier = `
            SELECT id FROM panier_utilisateur 
            WHERE numUtilisateur = ? AND status = 'en_attente'
            ORDER BY created_at DESC LIMIT 1
        `;
        const [panier] = await db.query(sqlPanier, [userId]);

        if (panier.length === 0) return res.status(200).json([]);

        const panierId = panier[0].id;

        // 2. Récupérer les articles avec les détails des vins
        const sqlItems = `
            SELECT v.id, v.name, v.price, v.category, pi.quantity
            FROM panier_items pi
            JOIN vins v ON pi.id_vin = v.id
            WHERE pi.order_id = ?
        `;
        const [itemsResults] = await db.query(sqlItems, [panierId]);

        const formattedItems = itemsResults.map(item => ({
            id: item.id,
            name: item.name,
            price: parseFloat(item.price),
            category: item.category,
            quantity: item.quantity
        }));

        res.json(formattedItems);

    } catch (error) {
        console.error("❌ Erreur récupération panier :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// --- RÉCUPÉRER LES COMMANDES ACTIVES (SUIVI) ---
// --- DANS orderController.js ---
exports.getActiveOrders = async (req, res) => {
    const userId = req.params.userId;

    try {
        const sql = `
            SELECT 
                c.id, 
                c.total_price, 
                c.status, 
                c.created_at,
                GROUP_CONCAT(CONCAT(v.name, ' (x', ci.quantity, ')') SEPARATOR ', ') as articles
            FROM commandes c
            JOIN commande_items ci ON c.id = ci.commande_id
            JOIN vins v ON ci.id_vin = v.id
            WHERE c.numUtilisateur = ? AND c.status IN ('en_attente', 'en_cours')
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `;
        const [orders] = await db.query(sql, [userId]);
        res.json(orders);
    } catch (error) {
        console.error("❌ Erreur récupération suivi détaillé :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};


// --- RÉCUPÉRER L'HISTORIQUE (Commandes terminées) ---
exports.getCompletedOrders = async (req, res) => {
    const userId = req.params.userId;

    try {
        const sql = `
            SELECT 
                c.id, 
                c.total_price, 
                c.status, 
                c.created_at,
                GROUP_CONCAT(CONCAT(v.name, ' (x', ci.quantity, ')') SEPARATOR ', ') as articles
            FROM commandes c
            JOIN commande_items ci ON c.id = ci.commande_id
            JOIN vins v ON ci.id_vin = v.id
            WHERE c.numUtilisateur = ? AND c.status = 'terminee'
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `;
        const [orders] = await db.query(sql, [userId]);
        res.json(orders);
    } catch (error) {
        console.error("❌ Erreur historique détaillé :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// --- ADMIN : RÉCUPÉRER TOUTES LES COMMANDES ---
exports.getAllOrdersAdmin = async (req, res) => {
    try {
        const sql = `
            SELECT 
                c.id, 
                c.total_price, 
                c.status, 
                c.created_at, 
                u.nom, 
                u.prenom,
                GROUP_CONCAT(CONCAT(v.name, ' (x', ci.quantity, ')') SEPARATOR ', ') as articles
            FROM commandes c
            -- Correction : Nom de table 'Utilisateur' et clé 'numUtilisateur'
            JOIN Utilisateur u ON c.numUtilisateur = u.numUtilisateur
            -- Jointures pour les articles
            JOIN commande_items ci ON c.id = ci.commande_id
            JOIN vins v ON ci.id_vin = v.id
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `;
        
        const [orders] = await db.query(sql);
        res.json(orders);
    } catch (error) {
        console.error("❌ Erreur SQL détaillée :", error.message);
        res.status(500).json({ 
            message: "Erreur lors de la récupération des commandes", 
            error: error.message 
        });
    }
};

// --- ADMIN : MODIFIER LE STATUT ---
exports.updateOrderStatus = async (req, res) => {
    const { orderId, newStatus } = req.body;
    try {
        await db.query('UPDATE commandes SET status = ? WHERE id = ?', [newStatus, orderId]);
        res.json({ message: "Statut mis à jour" });
    } catch (error) {
        res.status(500).json({ message: "Erreur mise à jour" });
    }
};