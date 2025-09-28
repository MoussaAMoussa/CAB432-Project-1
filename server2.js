// sever.js
require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./src/routes/auth");
const processingRoutes = require("./src/routes/processing");

const {signup, confirm, authenticate} = require("./src/utils/cognito");
 

const app = express();
const PORT = process.env.PORT || 3000;

// Global middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Mount routes
// All auth endpoints live under /api/v1/auth
app.use("/api/v1/auth", authRoutes);

// Processing endpoints live under /api/v1 (e.g., /api/v1/process, /api/v1/results)
app.use("/api/v1", processingRoutes);

// Signup endpoint
app.post("/api/v1/signup", async (req, res, next) => { 
  const { username, password, email } = req.body;
  try {
    const result = await signup(username, password, email, "user");
    res.json({ message: "User signed up successfully", result });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });

  }
});

// Confirm endpoint
app.post("/api/v1/confirm", async (req, res, next) => { 
  const { username, confirmationCode } = req.body;  
  try {
    const result = await confirm(username, confirmationCode);
    res.json({ message: "User confirmed successfully", result });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Authentication endpoint
app.post("/api/v1/login", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const result = await authenticate(username, password);
    if (usertype === "admin") {
      res.json({ message: "Admin user authenticated successfully", result });
    } else {
      res.json({ message: "User authenticated successfully", result });
    }
    } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}); 


// Admin functionality: Delete user from cognito
app.delete("/api/v1/admin/delete-user", async (req, res, next) => {
});

// Health check or catch-all
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// Error handler to avoid uncaught errors
app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res.status(500).json({
    error: { code: "INTERNAL", message: err.message || "An internal error occurred" },
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

