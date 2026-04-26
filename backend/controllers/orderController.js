const db = require('../config/db');

// --- VALIDER LA COMMANDE FINALE (Après clic sur Payer) ---
// --- VALIDER LA COMMANDE FINALE (Après clic sur Payer) ---
exports.validateFinalOrder = async (req, res) => {
    const { numUtilisateur, total_price, items } = req.body;
    
    // Sécurité : Vérification des données entrantes
    if (!numUtilisateur || !items || items.length === 0) {
        return res.status(400).json({ message: "Données de commande incomplètes" });
    }

    // Fonction de formatage pour MySQL (DD/MM/YYYY -> YYYY-MM-DD)
    const formatDate = (dateStr) => {
        if (!dateStr || !dateStr.includes('/')) return dateStr;
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month}-${day}`;
    };

    const connection = await db.getConnection();

    try {
        // Début de la transaction : si une seule requête échoue, rien n'est enregistré
        await connection.beginTransaction();

        // 1. Insertion dans la table principale 'commandes'
        const [orderResult] = await connection.query(
            'INSERT INTO commandes (numUtilisateur, total_price, status) VALUES (?, ?, ?)',
            [numUtilisateur, total_price, 'en_attente']
        );
        const commandeId = orderResult.insertId;

        // 2. Boucle sur les items pour dispatcher entre Vins et Prestations
        for (const item of items) {
            if (item.isPrestation) {
                // INSERTION DANS commande_prestations
                await connection.query(
                    `INSERT INTO commande_prestations 
                    (commande_id, prestation_id, quantity, date_prestation, adresse_prestation, unit_price) 
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        commandeId, 
                        item.id_prestation, 
                        item.quantity, 
                        formatDate(item.date), 
                        item.address || null, 
                        item.unit_price
                    ]
                );
            } else {
                // INSERTION DANS commande_items (pour les VINS)
                await connection.query(
                    'INSERT INTO commande_items (commande_id, id_vin, quantity, unit_price) VALUES (?, ?, ?, ?)',
                    [commandeId, item.id_vin, item.quantity, item.unit_price]
                );

                // MISE À JOUR DU STOCK DE VINS
                // On retire la quantité achetée du stock actuel
                await connection.query(
                    'UPDATE vins SET quantity = quantity - ? WHERE id = ?',
                    [item.quantity, item.id_vin]
                );
            }
        }

        // 3. Si tout est OK, on valide définitivement en BDD
        await connection.commit();
        
        res.status(201).json({ 
            message: "Commande validée avec succès !", 
            commandeId: commandeId 
        });

    } catch (error) {
        // En cas d'erreur (ex: stock insuffisant, erreur format date), on annule TOUT
        await connection.rollback();
        console.error("❌ ERREUR VALIDATION COMMANDE :", error);
        
        res.status(500).json({ 
            message: "Erreur lors de la validation de la commande", 
            error: error.message 
        });
    } finally {
        // Libération de la connexion vers le pool
        connection.release();
    }
};

// --- CRÉER UNE COMMANDE (PANIER) ---
exports.createOrderPanier = async (req, res) => {
    const { numUtilisateur, total_price, items } = req.body;

    if (!numUtilisateur || !items || items.length === 0) {
        return res.status(400).json({ message: "Données de commande incomplètes" });
    }

    // Fonction interne pour transformer "DD/MM/YYYY" en "YYYY-MM-DD"
    const formatDate = (dateStr) => {
        if (!dateStr || !dateStr.includes('/')) return dateStr;
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month}-${day}`;
    };

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Création du panier global
        const [orderResult] = await connection.execute(
            'INSERT INTO panier_utilisateur (numUtilisateur, total_price, status) VALUES (?, ?, ?)',
            [numUtilisateur, total_price, 'en_attente']
        );
        const orderId = orderResult.insertId;

        // 2. Dispatch des items
        for (const item of items) {
            if (item.isPrestation) {
                // Correction ici : On utilise formatDate pour éviter l'erreur SQL
                // Et on vérifie que les noms correspondent à ton schéma (prestation_id, order_id)
                await connection.execute(
                    `INSERT INTO panier_prestations 
                    (order_id, prestation_id, quantity, date_prestation, unit_price) 
                    VALUES (?, ?, ?, ?, ?)`,
                    [
                        orderId, 
                        item.id_prestation, 
                        item.quantity, 
                        formatDate(item.date), 
                        item.unit_price
                    ]
                );
            } else {
                await connection.execute(
                    'INSERT INTO panier_items (order_id, id_vin, quantity, unit_price) VALUES (?, ?, ?, ?)',
                    [orderId, item.id_vin, item.quantity, item.unit_price]
                );
            }
        }

        await connection.commit();
        res.status(201).json({ message: "Panier enregistré avec succès", orderId });

    } catch (error) {
        await connection.rollback();
        console.error("❌ ERREUR SQL :", error.message);
        res.status(500).json({ 
            message: "Erreur lors de l'enregistrement", 
            error: error.message 
        });
    } finally {
        connection.release();
    }
};

// --- RÉCUPÉRER LE PANIER EN ATTENTE ---
exports.getPendingCart = async (req, res) => {
    const userId = req.params.userId;
    try {
        const sqlPanier = `
            SELECT id FROM panier_utilisateur 
            WHERE numUtilisateur = ? AND status = 'en_attente'
            ORDER BY created_at DESC LIMIT 1
        `;
        const [panier] = await db.query(sqlPanier, [userId]);
        if (panier.length === 0) return res.status(200).json([]);

        const panierId = panier[0].id;

        // UNION pour récupérer Vins ET Prestations
        const sqlItems = `
            SELECT v.id, v.name, v.price, pi.quantity, 'vin' as type
            FROM panier_items pi
            JOIN vins v ON pi.id_vin = v.id
            WHERE pi.order_id = ?
            UNION ALL
            SELECT p.id, p.nom as name, p.prix as price, pp.quantity, 'prestation' as type
            FROM panier_prestations pp
            JOIN prestations p ON pp.prestation_id = p.id
            WHERE pp.order_id = ?
        `;
        const [itemsResults] = await db.query(sqlItems, [panierId, panierId]);

        res.json(itemsResults.map(item => ({
            ...item,
            price: parseFloat(item.price),
            isPrestation: item.type === 'prestation'
        })));
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
                GROUP_CONCAT(
                    DISTINCT 
                    CONCAT(
                        IFNULL(v.name, p.nom), -- Prend le nom du vin, ou sinon celui de la prestation
                        ' (x', 
                        IFNULL(ci.quantity, cp.quantity), 
                        ')'
                    ) SEPARATOR ', '
                ) as articles
            FROM commandes c
            LEFT JOIN commande_items ci ON c.id = ci.commande_id
            LEFT JOIN vins v ON ci.id_vin = v.id
            LEFT JOIN commande_prestations cp ON c.id = cp.commande_id
            LEFT JOIN prestations p ON cp.prestation_id = p.id
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
                GROUP_CONCAT(
                    DISTINCT 
                    CONCAT(
                        IFNULL(v.name, p.nom), 
                        ' (x', 
                        IFNULL(ci.quantity, cp.quantity), 
                        ')'
                    ) SEPARATOR ', '
                ) as articles
            FROM commandes c
            LEFT JOIN commande_items ci ON c.id = ci.commande_id
            LEFT JOIN vins v ON ci.id_vin = v.id
            LEFT JOIN commande_prestations cp ON c.id = cp.commande_id
            LEFT JOIN prestations p ON cp.prestation_id = p.id
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
                u.nom as user_nom, 
                u.prenom as user_prenom,
                GROUP_CONCAT(
                    DISTINCT 
                    CONCAT(
                        IFNULL(v.name, p.nom), 
                        ' (x', 
                        IFNULL(ci.quantity, cp.quantity), 
                        ')'
                    ) SEPARATOR ', '
                ) as articles
            FROM commandes c
            JOIN Utilisateur u ON c.numUtilisateur = u.numUtilisateur
            LEFT JOIN commande_items ci ON c.id = ci.commande_id
            LEFT JOIN vins v ON ci.id_vin = v.id
            LEFT JOIN commande_prestations cp ON c.id = cp.commande_id
            LEFT JOIN prestations p ON cp.prestation_id = p.id
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `;
        
        const [orders] = await db.query(sql);
        res.json(orders);
    } catch (error) {
        console.error("❌ Erreur SQL Admin :", error.message);
        res.status(500).json({ message: "Erreur récupération admin", error: error.message });
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