// src/middlewares/uploadMiddleware.js
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadsDir = path.join(process.cwd(), "storage", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true }); // ✅ make sure it exists

// Explicit allowlist (tweak as needed)
const ALLOWED_MIME = new Set([
  "audio/wav", "audio/x-wav", "audio/wave",
  "audio/mpeg", "audio/mp3",
  "audio/mp4", "audio/x-m4a",
  "audio/flac", "audio/ogg", "audio/webm",
]);

const MIME_EXT = {
  "audio/wav": ".wav",
  "audio/x-wav": ".wav",
  "audio/wave": ".wav",
  "audio/mpeg": ".mp3",
  "audio/mp3": ".mp3",
  "audio/mp4": ".m4a",
  "audio/x-m4a": ".m4a",
  "audio/flac": ".flac",
  "audio/ogg": ".ogg",
  "audio/webm": ".webm",
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const base = (file.originalname || "upload")
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");
    const extFromMime = MIME_EXT[file.mimetype];
    const extOriginal = path.extname(base);
    const ext = (extFromMime || extOriginal || "").toLowerCase();
    const name = path.parse(base).name; // strip ext for rebuild
    cb(null, `${Date.now()}_${name}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const { mimetype = "" } = file;

  // Accept known good audio types
  if (ALLOWED_MIME.has(mimetype)) return cb(null, true);

  // Some clients send octet-stream; allow only if extension looks safe
  if (mimetype === "application/octet-stream") {
    const ext = (path.extname(file.originalname || "") || "").toLowerCase();
    if ([".wav", ".mp3", ".m4a", ".flac", ".ogg", ".webm"].includes(ext)) {
      return cb(null, true);
    }
  }

  const err = new Error(`Unsupported file type: ${mimetype}`);
  err.status = 415; // Unsupported Media Type
  return cb(err, false);
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { filseSize: 100 * 1024 * 1024 },
 });

module.exports = upload;
