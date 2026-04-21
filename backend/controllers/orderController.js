const db = require('../config/db');

// --- CRÉER UNE COMMANDE (PANIER) ---
exports.createOrder = async (req, res) => {
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