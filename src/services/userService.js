//userService.js
const bcrypt = require("bcryptjs");


// We hash the demo password "password123" on startup.
const PASSWORD = "password123";
const HASH = bcrypt.hashSync(PASSWORD, 10);

const users = [
  {
    id: "u1",
    username: "alice",
    role: "user",
    passwordHash: HASH,
  },
  {
    id: "u2",
    username: "admin",
    role: "admin",
    passwordHash: HASH,
  },
];

// --- Query helpers ---
exports.findByUsername = (username) => users.find((u) => u.username === username);
exports.findById = (id) => users.find((u) => u.id === id);

// --- Auth helper ---
exports.verifyPassword = async (user, password) => {
  if (!user) return false;
  return bcrypt.compare(password, user.passwordHash);
};

