const express = require('express');
const router = express.Router();
const litigesController = require('../controllers/litigesController'); // Corrigé : c'était caveController avant
const verifyToken = require('../middleware/auth');

// GET /api/litiges -> Récupérer les litiges (Accessible par l'utilisateur connecté ou l'admin)
router.get('/', verifyToken, litigesController.getLitiges);

// POST /api/litiges -> Déclarer un nouveau litige
router.post('/', verifyToken, litigesController.addLitige);

// PUT /api/litiges/:id -> Modifier le statut d'un litige (Utile pour l'admin)
router.put('/:id', verifyToken, litigesController.updateLitige);

// DELETE /api/litiges/:id -> Supprimer un litige
router.delete('/:id', verifyToken, litigesController.deleteLitige);

module.exports = router;