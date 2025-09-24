// src/routes/processing.js

const express = require("express");
const router = express.Router();

const upload = require("../middlewares/uploadMiddleware");
const processingController = require("../controllers/processingcontroller");

// POST /api/v1/process

router.post("/process", upload.single("file"), processingcontroller.processFile);

module.exports = router;
