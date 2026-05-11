const db = require('../config/db');

// Vérifier la validité d'un code promo
exports.validatePromoCode = (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ message: 'Code promo requis' });
    }

    const query = `
        SELECT id, discount_percentage, valid_from, valid_to 
        FROM code_promo 
        WHERE code = ? AND valid_from <= CURDATE() AND valid_to >= CURDATE()
    `;

    db.query(query, [code.toUpperCase()], (err, results) => {
        if (err) {
            console.error('Erreur DB:', err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }

        if (results.length === 0) {
            return res.status(400).json({ 
                message: 'Code promo invalide ou expiré',
                valid: false 
            });
        }

        const promo = results[0];
        res.status(200).json({
            message: 'Code promo valide',
            valid: true,
            discountPercentage: promo.discount_percentage
        });
    });
};

// Récupérer les détails d'une promo
exports.getPromoDetails = (req, res) => {
    const { code } = req.params;

    const query = `
        SELECT id, code, description, discount_percentage, valid_from, valid_to 
        FROM code_promo 
        WHERE code = ? AND valid_from <= CURDATE() AND valid_to >= CURDATE()
    `;

    db.query(query, [code.toUpperCase()], (err, results) => {
        if (err) {
            console.error('Erreur DB:', err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Code promo non trouvé' });
        }

        res.status(200).json(results[0]);
    });
};
