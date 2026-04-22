const express = require('express');
const router = express.Router();
const vinController = require('../controllers/vinController');
const verifyToken = require('../middleware/auth');
const upload = require('../middleware/upload'); // Ton fichier multer

router.get('/', vinController.getAllVins);
router.get('/all', verifyToken, vinController.getAllVins);
router.post('/add', verifyToken, upload.single('cover'), vinController.addVin);
router.put('/update/:id', verifyToken, upload.single('cover'), vinController.updateVin);
router.delete('/delete/:id', verifyToken, vinController.deleteVin);

module.exports = router;