// src/middlewares/authMiddleware.js
const tokenService = require("../services/tokenService");
const userService = require("../services/userService");

/**
 * Ensures the request has a valid Bearer token.
 * Populates req.user with the authenticated user.
 */
exports.requireAuth = (req, res, next) => {
  const hdr = req.headers.authorization || "";
  const [scheme, token] = hdr.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      error: { code: "UNAUTHENTICATED", message: "missing or invalid Authorization header" }
    });
  }

  try {
    const claims = tokenService.verify(token);

    // ✅ Match what you signed in authController: { userId: user.id }
    const user = userService.findById(claims.userId);
    if (!user) {
      return res.status(401).json({
        error: { code: "UNAUTHENTICATED", message: "user not found" }
      });
    }

    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({
      error: { code: "UNAUTHENTICATED", message: "invalid or expired token" }
    });
  }
};

/**
 * Requires a specific role (e.g., "admin").
 */
exports.requireRole = (role) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: { code: "UNAUTHENTICATED", message: "login required" }
    });
  }
  if (req.user.role !== role) {
    return res.status(403).json({
      error: { code: "FORBIDDEN", message: `requires ${role} role` }
    });
  }
  next();
};

