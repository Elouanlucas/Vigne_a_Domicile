const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const verifyToken = require('../middleware/auth');

// --- ROUTES CLIENT ---
router.post('/panier', verifyToken, orderController.createOrderPanier);
router.post('/validate', verifyToken, orderController.validateFinalOrder);
router.get('/active/:userId', verifyToken, orderController.getActiveOrders);
router.get('/history/:userId', verifyToken, orderController.getCompletedOrders);
router.get('/recuperer/:userId', verifyToken, orderController.getPendingCart);


router.get('/admin/all', verifyToken, orderController.getAllOrdersAdmin);
router.put('/admin/status', verifyToken, orderController.updateOrderStatus);

module.exports = router;