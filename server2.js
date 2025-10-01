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
  const { username, password, email, usertype = "user" } = req.body;
  try {
    const result = await signup(username, password, email, usertype);
    res.json({ message: '${usertype} signed up successfully', result });
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
    const {IdToken, AcsessToken} = await authenticate(username, password);
    const decode = JSON.parse(Buffer.from(IdToken.split('.')[1], 'base64').toString());
    const groups = decode["cognito:groups"] || [];

    if (groups.includes("admin")) {
      res.json({ message: "Admin login successful", result: { IdToken, AccessToken } });
    } else {  
      res.json({ message: "User login successful", result: { IdToken, AccessToken } });
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

