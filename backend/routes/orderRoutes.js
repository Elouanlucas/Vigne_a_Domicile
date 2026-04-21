const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const verifyToken = require('../middleware/auth');

// Route pour enregistrer une nouvelle commande (ou un panier)
// URL : POST /api/orders
router.post('/', verifyToken, orderController.createOrder);

// Route pour récupérer le panier en attente d'un utilisateur spécifique
// URL : GET /api/orders/recuperer/:userId
router.get('/recuperer/:userId', verifyToken, orderController.getPendingCart);

module.exports = router;