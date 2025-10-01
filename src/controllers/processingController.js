// src/controllers/processingController.js
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const os = require("os");
import { v4 as uuidv4 } from "uuid";


const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const {
  PutItemCommand,
  UpdateItemCommand,
  GetItemCommand,
  QueryCommand,
} = require("@aws-sdk/client-dynamodb");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const { s3, dynamodb } = require("../config/aws.js");

// 🔊 Use your existing FFmpeg helper
const audioService = require("../services/audioService");

const S3_BUCKET = process.env.S3_BUCKET;
const JOBS_TABLE = process.env.JOBS_TABLE;

const nowISO = () => new Date().toISOString();

/**
 * POST /process
 * Buffer → temp file → FFmpeg → upload variants → update Dynamo → respond complete
 */
exports.processFile = async (req, res) => {
 
  try {
    
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    if (!S3_BUCKET) return res.status(500).json({ error: "S3 bucket not configured" });

    const jobId = uuidv4();
    const originalName = (req.file.originalname || "upload").replace(/\s+/g, "_");
    const inputKey = `uploads/${jobId}-${originalName}`;
    const ext = path.extname(originalName) || "";
    const baseName = path.parse(originalName).name;

    // A) Upload the original right away (source of truth)
    await s3.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: inputKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype || "application/octet-stream",
      Metadata: { jobId },
    }));

    // B) Create/seed job record as processing
    const outputKeys = [];
    if (JOBS_TABLE) {
      await dynamodb.send(new PutItemCommand({
        TableName: JOBS_TABLE,
        Item: {
          "qut-username": { S: req.user?.email || "anonymous" },
          "username": { S: jobId },
          status: { S: "processing" },
          inputKey: { S: inputKey || "unknown" },
          outputKeys: { L: (outputKeys || []).map(k => ({ S: k })) },
          createdAt: { S: nowISO() },
          updatedAt: { S: nowISO() },
        },
      }));
    }

    // C) Memory buffer → temp file (FFmpeg needs a path)
    const tmpInputPath = path.join(os.tmpdir(), `${jobId}_input${ext}`);
    const workDir = path.join(os.tmpdir(), `work_${jobId}`);
    await fsp.mkdir(workDir, { recursive: true });
    await fsp.writeFile(tmpInputPath, req.file.buffer);

    // D) Run FFmpeg pipeline (HQ/MQ/LQ mp3s)
    const variants = await audioService.transcodeVariants({
      inputPath: tmpInputPath,
      baseName,
      workDir,
    });

    // E) Upload each variant to S3 and collect keys
    
    for (const v of variants) {
      const outKey = `results/${jobId}/${v.name}`;
      const fileStream = fs.createReadStream(v.filePath);

      await s3.send(new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: outKey,
        Body: fileStream,
        ContentType: "audio/mpeg",
        Metadata: { jobId, source: inputKey },
      }));

      outputKeys.push(outKey);
    }

    // F) Mark job complete in Dynamo with output keys
    if (JOBS_TABLE) {
      await dynamodb.send(new UpdateItemCommand({
        TableName: JOBS_TABLE,
        Key: {
  "qut-username": { S: req.user?.email || "anonymous" }, // HASH key
  "username": { S: jobId }                               // RANGE key
},
        UpdateExpression: "SET #s = :s, outputKeys = :o, updatedAt = :u",
        ExpressionAttributeNames: { "#s": "status" },
        ExpressionAttributeValues: {
          ":s": { S: "complete" },
          ":o": { L: outputKeys.map(k => ({ S: k })) },
          ":u": { S: nowISO() },
        },
      }));
    }

    // G) Respond with details
    return res.status(200).json({
      message: "Job completed",
      jobId,
      status: "complete",
      inputKey,
      outputKeys,
    });
  } catch (err) {
    console.error("[processFile] error:", err);
    // Best-effort mark as failed
    try {
      if (JOBS_TABLE) {
        await dynamodb.send(new UpdateItemCommand({
            TableName: JOBS_TABLE,
            Key: {
              "qut-username": { S: req.user?.email || "anonymous" }, // HASH key
              "username": { S: jobId }                               // RANGE key
            },
            UpdateExpression: "SET #s = :s, outputKeys = :o, updatedAt = :u",
            ExpressionAttributeNames: { "#s": "status" },
            ExpressionAttributeValues: {
              ":s": { S: "complete" },
              ":o": { L: outputKeys.map(k => ({ S: k })) },
              ":u": { S: nowISO() },
            },
          }));
      }
    } catch {}
    return res.status(500).json({ error: "Processing failed" });
  } finally {
    // Clean up temp files
    try {
      // these might not be defined if we failed early—ignore errors
      if (typeof tmpInputPath === "string") await fsp.rm(tmpInputPath, { force: true });
      if (typeof workDir === "string") await fsp.rm(workDir, { recursive: true, force: true });
    } catch {}
  }
};

/**
 * GET /history (simple scan-based fallback)
 * NOTE: For production, add a GSI (userId + createdAt) and use Query.
 */
exports.history = async (req, res) => {
  if (!JOBS_TABLE) return res.status(500).json({ error: "JOBS_TABLE not configured" });

  // Minimal scan with filter expression for the assignment demo
  try {
    // Using QueryCommand requires a GSI; scan fallback is omitted here to keep it concise.
    // If you want, I can drop in a scan-based implementation next.
    return res.status(501).json({ error: "History not implemented (add GSI or ask me for scan fallback)" });
  } catch (err) {
    console.error("[history] error:", err);
    return res.status(500).json({ error: "Failed to fetch history" });
  }
};

/**
 * GET /results/:id — Return job metadata (status, keys)
 */
exports.getResult = async (req, res) => {
  if (!JOBS_TABLE) {
    return res.status(500).json({ error: "JOBS_TABLE not configured" });
  }

  const { id } = req.params;

  try {
    // Use authenticated user's email (or fallback)
    const userKey = req.user?.email || "anonymous";

    const out = await dynamodb.send(new GetItemCommand({
      TableName: JOBS_TABLE,
      Key: {
        "qut-username": { S: userKey }, // HASH key
        "username": { S: id },          // RANGE key
      },
    }));

    if (!out.Item) {
      return res.status(404).json({ error: "Job not found" });
    }

    const item = out.Item;
    const status = item.status?.S || "unknown";
    const inputKey = item.inputKey?.S || null;
    const outputKeys = (item.outputKeys?.L || []).map(x => x.S);

    return res.json({
      jobId: id,
      status,
      inputKey,
      outputKeys,
    });
  } catch (err) {
    console.error("[getResult] error:", err);
    return res.status(500).json({ error: "Failed to fetch result" });
  }
};


/**
 * GET /results/:id/download — Presigned URLs for all outputs
 */
exports.downloadResult = async (req, res) => {
  if (!S3_BUCKET) return res.status(500).json({ error: "S3 bucket not configured" });
  if (!JOBS_TABLE) return res.status(500).json({ error: "JOBS_TABLE not configured" });

  const { id } = req.params;

  try {
    const out = await dynamodb.send(new GetItemCommand({
      TableName: JOBS_TABLE,
      Key: {
  "qut-username": { S: out.Item["qut-username"].S }, // or req.user.email if auth is applied
  "username": { S: id }
},
    }));
    if (!out.Item) return res.status(404).json({ error: "Job not found" });

    const outputKeys = (out.Item.outputKeys?.L || []).map(x => x.S);
    if (outputKeys.length === 0) {
      return res.status(409).json({ error: "No outputs available for this job yet" });
    }

    const urls = await Promise.all(
      outputKeys.map(async (Key) => {
        const cmd = new GetObjectCommand({ Bucket: S3_BUCKET, Key });
        const url = await getSignedUrl(s3, cmd, { expiresIn: 3600 });
        return { key: Key, url, expiresInSeconds: 3600 };
      })
    );

    return res.json({ jobId: id, urls });
  } catch (err) {
    console.error("[downloadResult] error:", err);
    return res.status(500).json({ error: "Failed to generate download URLs" });
  }
};


exports.downloadAllResults = async (_req, res) => {
  return res.status(501).json({ error: "Download-all not implemented yet" });
};

