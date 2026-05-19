const express = require('express');
const router = express.Router();
const avisController = require('../controllers/avisController');

// --- ROUTES DE RÉCUPÉRATION (GET) ---
router.get('/vin/:vinId', avisController.getAvisByVin);
router.get('/prestation/:prestationId', avisController.getAvisByPrestation);
router.get('/', avisController.getAllAvisGlobal);

//Récupérer tous les avis d'un utilisateur spécifique
router.get('/utilisateur/:numUtilisateur', avisController.getAvisByUtilisateur);

// --- ROUTE DE CRÉATION (POST) ---
router.post('/', avisController.createAvis);

// --- NOUVELLES ROUTES DE GESTION (PUT / DELETE) ---
router.put('/:id', avisController.updateAvis);
router.put('/:id/reponse', avisController.respondAsAdmin);
router.delete('/:id', avisController.deleteAvis);

module.exports = router;