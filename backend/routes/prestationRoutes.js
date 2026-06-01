const express = require('express');
const router = express.Router();
const prestationController = require('../controllers/prestationController');
const verifyToken = require('../middleware/auth');
const upload = require('../middleware/upload'); // Ton fichier multer

// --- ROUTES PUBLIQUES (ou accessibles sans action spécifique) ---

// Récupérer TOUTES les prestations
// GET /api/prestations
router.get('/', prestationController.getPrestations);
router.get('/details-complets', verifyToken, prestationController.getAgendaDetails);

// Récupérer les prestations d'un utilisateur spécifique
// GET /api/prestations/user/:userId
router.get('/user/:userId', verifyToken, prestationController.getPrestationsByUserId);

// Récupérer UNE prestation précise par son ID
// GET /api/prestations/:id
// Note : On la place APRÈS /user/:userId pour éviter que "user" ne soit confondu avec un ID
router.get('/:id', prestationController.getPrestationById);




// --- ROUTES PROTÉGÉES (Admin ou Utilisateur authentifié) ---

// Créer une nouvelle prestation
// POST /api/prestations
router.post('/', verifyToken, upload.single('cover'), prestationController.addPrestation);

// Mettre à jour une prestation
// PUT /api/prestations/:id
router.put('/:id', verifyToken, upload.single('cover'), prestationController.updatePrestation);

// Supprimer une prestation
// DELETE /api/prestations/:id
router.delete('/:id', verifyToken, prestationController.deletePrestation);

router.delete('/:prestationId/participants/:userEmail', verifyToken, prestationController.deleteParticipantFromPrestation);

module.exports = router;