// processingController.js
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("../config/aws.js");
const { v4: uuidv4 } = require("uuid");
const { PutItemCommand, QueryCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { dynamodb } = require("../config/aws.js");

// NOTE: keep these commented until you implement them, or remove to avoid lints
// const audioService = require("../services/audioService");
// const { streamZipOfFiles } = require("../utils/zipHelper");
// const jobStore = require("../services/jobStoreFile");

const S3_BUCKET = process.env.S3_BUCKET;
const JOBS_TABLE = process.env.JOBS_TABLE;


function nowISO() { return new Date().toISOString(); }

// Create job (upload & queue)
exports.processFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    if (!S3_BUCKET) return res.status(500).json({ error: "S3 bucket not configured" });

    const jobId = uuidv4();
    const originalName = (req.file.originalname || "upload").replace(/\s+/g, "_");
    const inputKey = `uploads/${jobId}-${originalName}`;

    // Upload original to S3 (no local disk)
    await s3.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: inputKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype || "application/octet-stream",
      Metadata: { jobId }
    }));

    // Write job metadata (DynamoDB example)
    if (JOBS_TABLE) {
      await dynamodb.send(new PutItemCommand({
        TableName: JOBS_TABLE,
        Item: {
          jobId:      { S: jobId },
          userId:     { S: (req.user?.sub || "anonymous") },
          status:     { S: "queued" },
          inputKey:   { S: inputKey },
          outputKeys: { L: [] },
          createdAt:  { S: nowISO() },
          updatedAt:  { S: nowISO() }
        }
      }));
    }

    return res.status(202).json({ message: "Job submitted", jobId, status: "queued" });
  } catch (err) {
    console.error("[processFile] error:", err);
    return res.status(500).json({ error: "Upload failed" });
  }
};

// Paginated history (skeleton; adjust to DB)
exports.history = async (req, res) => {
  try {
    // TODO: implement with a GSI on userId or a scan with filters
    return res.status(501).json({ error: "History not implemented yet" });
  } catch (err) {
    console.error("[history] error:", err);
    return res.status(500).json({ error: "Failed to fetch history" });
  }
};

// Get results (skeleton)
exports.getResult = async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: GetItemCommand on JOBS_TABLE with jobId=id, return keys/status
    return res.status(501).json({ error: "Get result not implemented yet" });
  } catch (err) {
    console.error("[getResult] error:", err);
    return res.status(500).json({ error: "Failed to fetch result" });
  }
};

exports.downloadResult = async (req, res) => {
  try {
    // TODO: generate a pre-signed URL for an output key and redirect
    return res.status(501).json({ error: "Download not implemented yet" });
  } catch (err) {
    console.error("[downloadResult] error:", err);
    return res.status(500).json({ error: "Failed to download" });
  }
};

exports.downloadAllResults = async (req, res) => {
  try {
    // TODO: create ZIP in S3 or stream ZIP on-the-fly from S3 objects
    return res.status(501).json({ error: "Download-all not implemented yet" });
  } catch (err) {
    console.error("[downloadAllResults] error:", err);
    return res.status(500).json({ error: "Failed to download all" });
  }
};




const {bucket_push, bucket_pull, dynamo_pull, dynamo_push} = require("../../database.js");

async function processFile(req, res) {
    try {
        const fileContent = req.file.buffer.toString();
        const fileName = req.file.originalname;
        const username = req.user.username;
        const bucketName = process.env.S3_BUCKET_NAME;
        const tableName = process.env.DYNAMO_TABLE_NAME;
        const sortKey = "fileKey";

        // File is stored in S3 bucket
        await bucket_push(fileName, fileContent, bucketName);

        // Metadata is stored in DynamoDB
        await dynamo_push (tableName, sortKey, username, fileName);

        res.status(200).send("File processed successfully, stored in S3 and metadata in DynamoDB.");
    } catch (error) {
        console.error("Error processing file:", error);
        res.status(500).send("Error processing file."); 

    }

}

module.exports = { processFile };