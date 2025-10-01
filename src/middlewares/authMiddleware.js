// src/middlewares/authMiddleware.js
const { getAccessVerifier } = require("../utils/cognito"); 

exports.requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      error: { code: "UNAUTHENTICATED", message: "missing or invalid Authorization header" }
    });
  }

  try {
    const verifier = await getAccessVerifier(); // uses cognito.js
    const claims = await verifier.verify(token);
    req.user = { id: claims.sub, email: claims.email }; // populate as needed
    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    return res.status(401).json({
      error: { code: "UNAUTHENTICATED", message: "invalid or expired token" }
    });
  }
};
