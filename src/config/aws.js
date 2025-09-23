// src/config/aws.js

 const { S3Client } = require("@aws-sdk/client-s3");
 const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

 const region = process.env.AWS_REGION || "ap-southeast-2";

 const s3 = new S3Client({ region });
 const dynamodb = new DynamoDBClient({ region });

 module.exports = { s3, dynamodb };
