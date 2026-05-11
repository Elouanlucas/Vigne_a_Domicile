const express = require('express');
const router = express.Router();
const promoController = require('../controllers/promoController');

// Valider un code promo
router.post('/validate', promoController.validatePromoCode);

// Récupérer les détails d'une promo
router.get('/details/:code', promoController.getPromoDetails);

module.exports = router;
