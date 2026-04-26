const express = require('express');
const router = express.Router();
const prestationController = require('../controllers/prestationController');
const verifyToken = require('../middleware/auth'); // Importe ton middleware

// Récupérer TOUTES les prestations
// URL : GET /api/prestations
router.get('/', prestationController.getPrestations);

// Récupérer UNE prestation précise
// URL : GET /api/prestations/:id
router.get('/:id', prestationController.getPrestationById);

router.get('/user/:userId', verifyToken, prestationController.getPrestationsByUserId);

module.exports = router;