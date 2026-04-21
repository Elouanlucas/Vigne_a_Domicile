const express = require('express');
const router = express.Router();
const vinController = require('../controllers/vinController');
const verifyToken = require('../middleware/auth');

router.get('/', vinController.getAllVins);
router.get('/all', verifyToken, vinController.getAllVins);
router.post('/add', verifyToken, vinController.addVin);
router.put('/update/:id', verifyToken, vinController.updateVin);
router.delete('/delete/:id', verifyToken, vinController.deleteVin);

module.exports = router;