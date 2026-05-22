const express = require('express');
const router = express.Router();
const livredORController = require('../controllers/livredORController.js'); 
const verifyToken = require('../middleware/auth'); // À utiliser si tu veux sécuriser la partie admin

/* ==========================================================================
   ROUTES CLIENTS / PUBLIQUES
   ========================================================================== */

// Récupérer tous les messages validés
router.get('/', livredORController.getAllMessages);

// Soumettre un nouveau message (atterrit dans la table tempo)
router.post('/', livredORController.createMessage);

/* ==========================================================================
   ROUTES ADMINISTRATEUR (MODÉRATION)
   ========================================================================== */

// Récupérer les messages en attente de modération (table tempo)
router.get('/tempo', livredORController.getTempoMessages);

// Valider un message (Transfert de tempo -> table finale + réponse admin)
router.post('/valider/:id', livredORController.validerMessage);

// Refuser un message (Suppression définitive de la table tempo)
router.delete('/tempo/:id', livredORController.refuserMessage);

module.exports = router;