// tokenService.js

	const jwt = require("jsonwebtoken");

	const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
	const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

	exports.issue = (user) => {
	// minimal claims; add more if you need
	const payload = { sub: user.id, username: user.username,  role: user.role };
	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
	};

	exports.verify = (token) => jwt.verify(token, JWT_SECRET);
