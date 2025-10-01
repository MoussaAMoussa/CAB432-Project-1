Assignment 2 - Cloud Services Exercises - Response to Criteria
================================================

Instructions
------------------------------------------------
- Keep this file named A2_response_to_criteria.md, do not change the name
- Upload this file along with your code in the root directory of your project
- Upload this file in the current Markdown format (.md extension)
- Do not delete or rearrange sections.  If you did not attempt a criterion, leave it blank
- Text inside [ ] like [eg. S3 ] are examples and should be removed


Overview
------------------------------------------------

- **Name:** Moss Murphy
- **Student number:** n11988819
- **Partner name (if applicable):** YourPartner NameHere
- **Application name:** CAB432-Project-1
- **Two line description:** An audio file code transcoder, change audio file size 
- **EC2 instance name or ID:** i-0d701d561095880b3 

------------------------------------------------

### Core - First data persistence service

- **AWS service name:**  S3
- **What data is being stored?:** Original file + transcoded audio variants
- **Why is are the other services used not suitable for this data?:** S3 is good for storing large data. S3 provides scalable, durable, and cost-effective storage with easy access via URLs
- **Bucket/instance/table name:** n11988819-a2-db
- **Video timestamp:** 0:00 - 0:09
- **Relevant files:** processingController.js, server2.js, processing.js
    -

### Core - Second data persistence service

- **AWS service name:**  DynamoDB
- **What data is being stored?:** Metadata about the audio processing job
- **Why is this service suited to this data?:** DynamoDB is a fast, fully managed NoSQL database ideal for storing structured metadata
- **Why is are the other services used not suitable for this data?:** S3 can only store objects/files, not easily queryable structured metadata.
- **Bucket/instance/table name:** a2-db-table
- **Video timestamp:** 0:09 - 0:17
- **Relevant files:** processingController.js, server2.js, processing.js
    -

### Third data service

- **AWS service name:**  [eg. RDS]
- **What data is being stored?:** [eg video metadata]
- **Why is this service suited to this data?:** [eg. ]
- **Why is are the other services used not suitable for this data?:**
- **Bucket/instance/table name:**
- **Video timestamp:**
- **Relevant files:**
    -

### S3 Pre-signed URLs

- **S3 Bucket names:** n11988819-a2-db
- **Video timestamp:** 1:07 - 1:29
- **Relevant files:** processingController.js
    -

### In-memory cache

- **ElastiCache instance name:**
- **What data is being cached?:** [eg. Thumbnails from YouTube videos obatined from external API]
- **Why is this data likely to be accessed frequently?:** [ eg. Thumbnails from popular YouTube videos are likely to be shown to multiple users ]
- **Video timestamp:**
- **Relevant files:**
    -

### Core - Statelessness 

- **What data is stored within your application that is not stored in cloud data services?:** Temporary in-memory job entries are stored in the jobStore.js Map while a request is being processed. These entries include the job ID, current status (e.g., “processing”), and a reference to the file being worked on. No user files or long-term data are kept locally.
- **Why is this data not considered persistent state?:** This in-memory data is only needed during live request handling. If the application stops, all job state can be fully reconstructed from S3 (which stores the raw and processed audio files) and DynamoDB (which stores job metadata). Since the same results can be recreated and no unique information is lost, this data is not persistent state.
- **How does your application ensure data consistency if the app suddenly stops?:** Consistency is maintained because the sources of truth — audio files in S3 and job records in DynamoDB — are both durable and independent of the application runtime. If the app stops mid-process, incomplete jobs remain marked as “processing” in DynamoDB and can be retried or safely ignored. This means that once the service is restarted, the cloud data services hold the latest consistent state.
- **Relevant files:**
    src/services/jobStore.js 
    src/services/audioService.js 
    src/controllers/processingController.js 

### Graceful handling of persistent connections

- **Type of persistent connection and use:** [eg. server-side-events for progress reporting]
- **Method for handling lost connections:** [eg. client responds to lost connection by reconnecting and indicating loss of connection to user until connection is re-established ]
- **Relevant files:**
    -


### Core - Authentication with Cognito

- **User pool name:** 
n11988819
- **How are authentication tokens handled by the client?:** The client receives authentication tokens (ID, Access, Refresh) after logging in and stores them securely, often in HttpOnly cookies or secure storage. It then includes the Access Token in the Authorization header (Bearer <token>) for all API requests.
- **Video timestamp:** 0:18 - 0:38
- **Relevant files:** cognito.js, authMiddleware.js, server2.js
    -

### Cognito multi-factor authentication

- **What factors are used for authentication:** [eg. password, SMS code]
- **Video timestamp:**
- **Relevant files:**
    -

### Cognito federated identities

- **Identity providers used:**
- **Video timestamp:**
- **Relevant files:**
    -

### Cognito groups

- **How are groups used to set permissions?:** admin users can be verified 
- **Video timestamp:** 1:08 - 1:15
- **Relevant files:** server2.js, cognito.js
    -

### Core - DNS with Route53

- **Subdomain**:  plswork.cab432.com:3000
- **Video timestamp:** 0:37 - 0:45

### Parameter store

- **Parameter names:** [eg. n1234567/base_url]
- **Video timestamp:**
- **Relevant files:**
    -

### Secrets manager

- **Secrets names:** n11988819-a2
- **Video timestamp:** 0:45 - 1:00
- **Relevant files:** cognito.js
    -

### Infrastructure as code

- **Technology used:**
- **Services deployed:**
- **Video timestamp:**
- **Relevant files:**
    -

### Other (with prior approval only)

- **Description:**
- **Video timestamp:**
- **Relevant files:**
    -

### Other (with prior permission only)

- **Description:**
- **Video timestamp:**
- **Relevant files:**
    -
