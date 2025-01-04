const express = require('express');
const router = express.Router();
const analyzeController = require('../controllers/analyzeController');
const { authenticateUser } = require('../middlewares/auth');

router.post('/job', authenticateUser, analyzeController.analyzeJob);

module.exports = router;