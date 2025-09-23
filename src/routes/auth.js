// src/routes/auth.js
const express = require('express');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware'); // ✅ pull out the function

const router = express.Router();

router.post('/login', authController.login);
router.get('/me', requireAuth, authController.me); // ✅ now Express gets a function

module.exports = router;



