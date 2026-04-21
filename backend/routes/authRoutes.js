const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route pour la création de compte
// URL finale : POST /api/register
router.post('/register', authController.register);

// Route pour la connexion
// URL finale : POST /api/login
router.post('/login', authController.login);

module.exports = router;