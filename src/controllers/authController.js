// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const { findByUsername, verifyPassword } = require('../services/userService');

/**
 * POST /login
 * Validates the user’s credentials and returns a token when valid.
 */
exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      error: { code: 'INVALID_INPUT', message: 'Both username and password are required' }
    });
  }

  const user = findByUsername(username);
  const ok = await verifyPassword(user, password); // bcrypt.compare under the hood
  if (!ok) {
    return res.status(401).json({
      error: { code: 'UNAUTHENTICATED', message: 'invalid credentials' }
    });
  }

  // Sign token with userId (matches middleware Option B)
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return res.json({ token });
};

/**
 * GET /me
 * Returns details about the current authenticated user.
 */
exports.me = (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    role: req.user.role
  });
};

