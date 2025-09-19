import {bucket_push, bucket_pull, dynamo_pull, dynamo_push} from "./database.js";

export async function processFile(req, res) {
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