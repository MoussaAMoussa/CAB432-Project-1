const express = require("express");
const { requireAuth } = require("../middlewares/authMiddleware");

const router = express.Router();

// returns info about the currently authenticated user
router.get("/me", requireAuth, (req, res) => {
   res.json({
	id: req.iser.id,
	username: req.user.username,
	role: req.user.role,
	});
      });

module.exports = router;
