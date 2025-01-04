const express = require('express');
const UserController = require('../controllers/userController');
const { authenticateUser } = require('../middlewares/auth');
const router = express.Router();

router.post('/signup', UserController.signup);
router.post('/login', UserController.login);
router.put('/profile', authenticateUser, UserController.updateProfile);

module.exports = router;