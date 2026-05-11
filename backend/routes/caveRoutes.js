const express = require('express');
const router = express.Router();
const caveController = require('../controllers/caveController'); // Vérifie bien le nom ici
const verifyToken = require('../middleware/auth');

// GET /api/caves -> Voir tout
router.get('/', caveController.getCaves);

// POST /api/caves -> Ajouter (On utilise POST, pas GET)
router.post('/', verifyToken, caveController.addCave); 

// DELETE /api/caves/:id -> Supprimer (On utilise DELETE)
router.delete('/:id', verifyToken, caveController.deleteCave);

// PUT /api/caves/:id -> Modifier (On utilise PUT)
router.put('/:id', verifyToken, caveController.updateCave);

module.exports = router;