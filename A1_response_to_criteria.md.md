Assignment 1 - REST API Project - Response to Criteria
================================================

Overview
------------------------------------------------

- **Name:** Ahmed Moussa
- **Student number:** n11585820
- **Application name:** Audio Transcoding API
- **Two line description:** This REST API authenticates users with JWT and processes uploaded audio into multiple quality variants (HQ/MQ/LQ) using FFmpeg. Jobs are stored with metadata; users can fetch history, details, and download single files or a ZIP of all results.

Core criteria
------------------------------------------------

### Containerise the app

- **ECR Repository name:** n11585820audioapi
- **Video timestamp:**
- **Relevant files:**
    - Dockerfile
    - .dockerignore



### Deploy the container

- **EC2 instance ID:** i-071bf9baab8aec217
- **Video timestamp:**

### User login

- **One line description:** WT login via POST /api/v1/auth/login (e.g., alice/password123), then GET /api/v1/auth/me with Authorization: Bearer (token), use NPM start to start the server
- **Video timestamp:** 
- **Relevant files:**
    - src/controllers/authController.js
    - src/middlewares/authMiddleware.js
    - src/services/userService.js
    - src/services/tokenService.js
    

### REST API

- **One line description:** Express API for processing uploads, listing job history (with pagination & date filters), viewing job details, and downloading outputs (single variant or ZIP of all).
- **Video timestamp:**
- **Relevant files:** 
    - server.js
    - src/routes/auth.js
    - src/routes/processing.js
    - src/controllers/processingController.js
    - src/middlewares/uploadMiddleware.js
    - src/utils/zipHelper.js

### Data types

- **One line description:** The system manages structured JSON job metadata and binary audio files produced by transcoding.
- **Video timestamp:** 
- **Relevant files:**
    - src/services/jobStoreFile.js
    - src/controllers/processingController.js
    - src/services/audioService.js

#### First kind

- **One line description:** Persisted job metadata for each processing run.
- **Type:** JSON
- **Rationale:** Records job id, owner, original filename, output files, timestamps, and status for retrieval/history.
- **Video timestamp:**
- **Relevant files:**
    - src/services/jobStoreFile.js
    - src/controllers/processingController.js

#### Second kind

- **One line description:** Generated audio outputs in multiple qualities (HQ/MQ/LQ) available for download.
- **Type:** Binary files (audio)
- **Rationale:** Demonstrates handling of non-textual data and serving downloadable artifacts.
- **Video timestamp:** 
- **Relevant files:**
  - src/services/audioService.js
  - src/controllers/processingController.js
  - src/utils/zipHelper.js

### CPU intensive task

 **One line description:** FFmpeg transcoding of uploaded audio into multiple quality variants (HQ/MQ/LQ).
- **Video timestamp:** 
- **Relevant files:**
    - src/services/audioService.js
    - Dockerfile (installs ffmpeg)

### CPU load testing

 **One line description:** Concurrent POST /api/v1/process uploads to drive sustained CPU >80% (e.g., via seq | xargs -P), evidenced with top/htop or CloudWatch graphs.
- **Video timestamp:** 
- **Relevant files:**
    - README.md
    - 

Additional criteria
------------------------------------------------

### Extensive REST API features

- **One line description:** History pagination & date filters; per-variant downloads (?variant=HQ|MQ|LQ); download-all ZIP endpoint.
- **Video timestamp:**
- **Relevant files:**
    - src/controllers/processingController.js
    - src/routes/processing.js
    

### External API(s)

- **One line description:** Not attempted
- **Video timestamp:**
- **Relevant files:**
    - 

### Additional types of data

- **One line description:** Not attempted
- **Video timestamp:**
- **Relevant files:**
    - 

### Custom processing

- **One line description:** Covered by CPU task: multi-variant audio transcode
- **Video timestamp:**
- **Relevant files:**
    - 

### Infrastructure as code

- **One line description:** Not attempted
- **Video timestamp:**
- **Relevant files:**
    - 

### Web client

- **One line description:** Simple website that allows you to upload then returns a zip file with http://localhost:3000
- **Video timestamp:**
- **Relevant files:**
    -  public/index.html
    - server.js

### Upon request

- **One line description:** Not attempted
- **Video timestamp:**
- **Relevant files:**
    - 
