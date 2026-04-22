const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const verifyToken = require('../middleware/auth');

// Garde ton ancienne route pour le panier
router.post('/panier', verifyToken, orderController.createOrderPanier);

// AJOUTE CETTE ROUTE pour la commande finale
// URL : POST /api/orders/validate
router.post('/validate', verifyToken, orderController.validateFinalOrder);

router.get('/active/:userId', verifyToken, orderController.getActiveOrders);

router.get('/history/:userId', verifyToken, orderController.getCompletedOrders);

// Route pour récupérer le panier en attente d'un utilisateur spécifique
// URL : GET /api/orders/recuperer/:userId
router.get('/recuperer/:userId', verifyToken, orderController.getPendingCart);

module.exports = router;