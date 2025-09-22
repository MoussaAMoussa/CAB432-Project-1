const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const processingController = require("../controllers/processingController");

// Create job (upload & process)
router.post("/process", requireAuth, upload.single("file"), processingController.processFile);

// Structured history (paginated + date filters)
router.get("/history", requireAuth, processingController.history);

// Job detail + download
router.get("/results/:id", requireAuth, processingController.getResult);
router.get("/results/:id/download", requireAuth, processingController.downloadResult);
router.get("/results/:id/download-all", requireAuth, processingController.downloadAllResults);


module.exports = router;


