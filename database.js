const { 
    S3Client, 
    CreateBucketCommand, 
    PutBucketTaggingCommand, 
    GetObjectCommand, 
    PutObjectCommand 
} = require("@aws-sdk/client-s3");

// Pre-signed URLS
const S3Presigner = require("@aws-sdk/s3-request-presigner");
// Can change bucket name to whatever
const bucketName = 'n11988819-a2-db';
// Tagging - can change to whatever
const qutUsername = 'n11988819@qut.edu.au'
const purpose = 'a2 db storage'
// Adding to the bucker - change to whatever
const objectKey = 'username'
const objectValue = 'data'
// To be used in EC2 instance
// npm init -y
// npm i @aws-sdk/client-s3
// npm i dotenv

async function s3_db(){

    // Create bucket
    s3Client = new S3.S3Client({ region: 'ap-southeast-2' });

    command = new S3.CreateBucketCommand({
        Bucket: bucketName
    });

    try {
        const response = await s3Client.send(command);
        console.log(response.Location)
    } catch (err) {
        console.log(err);
    }
    // Tag bucket
    command = new S3.PutBucketTaggingCommand({
    Bucket: bucketName,
    Tagging: {
        TagSet: [
            {
                Key: 'qut-username',
                Value: qutUsername,
            },
            {
                Key: 'purpose',
                Value: purpose
            }
        ]
        }
        });

    try {
            const response = await s3Client.send(command);
            console.log(response)
        } catch (err) {
            console.log(err);
        }



}



// This would be for in the EC2 instance
// npm init -y
// npm i @aws-sdk/client-dynamodb
// npm i @aws-sdk/lib-dynamodb
// npm i dotenv

require('dotenv').config();
const Dynamodb = require('@aws-sdk/client-dynamodb');
const DynamoDBLib = require('@aws-sdk/lib-dynamodb');

const tableName = 'a2-db-table';
// Change to whatever you want to sort by
const sortKey = 'username';

async function dynamodb_db(){
    const client = new Dynamodb.DynamoDBClient({ region: 'ap-southeast-2' });
    const docClient = DynamoDBLib.DynamoDBDocumentClient.from(client);

    command = new Dynamodb.CreateTableCommand({
        TableName: tableName,
        AttributeDefinitions: [
            { AttributeName: "qut-username", AttributeType: 'S' },
            { AttributeName: sortKey, AttributeType: 'S' }
        ],
        KeySchema: [
            { AttributeName: "qut-username", KeyType: 'HASH' },
            { AttributeName: sortKey, KeyType: 'RANGE' }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
        },
    });
    try {
        const repsone = await client.send(command);
        console.loge("Create Table comand reponse: ", repsone);
    } catch (err) {
        console.log("Error", err);
    }


}

