const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/auth'); 
const upload = require('../middleware/upload'); 

// ==========================================
//    SECTION PROFIL PERSONNEL (UTILISATEUR)
// ==========================================
router.get('/profile/:login', verifyToken, userController.getUserInfos);
router.post('/update-photo', verifyToken, upload.single('photo'), userController.updatePhoto);
router.put('/update-address', verifyToken, userController.updateAddress);
router.put('/update-profile', verifyToken, userController.updateProfile);
router.delete('/delete/:login', verifyToken, userController.deleteUser);

// ==========================================
//    SECTION GESTION ADMIN (NOUVEAU)
// ==========================================

router.get('/all', verifyToken, userController.getAllUsers);

router.delete('/delete-admin/:login', verifyToken, userController.adminDeleteUser);

module.exports = router;