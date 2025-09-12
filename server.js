// sever.js
require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./src/routes/auth");
const processingRoutes = require("./src/routes/processing");

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

