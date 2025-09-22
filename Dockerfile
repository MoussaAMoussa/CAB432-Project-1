# ---- Base (Node 18, Debian slim) ----
FROM node:18-slim

# Install ffmpeg for your audioService
RUN apt-get update \
 && apt-get install -y --no-install-recommends ffmpeg \
 && rm -rf /var/lib/apt/lists/*

# App setup
WORKDIR /app

# Install deps (use lockfile if present)
COPY package*.json ./
RUN npm ci --omit=dev || npm install --only=production

# Copy source
COPY . .

# Create storage dirs used by multer/transcoding
RUN mkdir -p storage/uploads storage/tmp \
 && chown -R node:node storage

# Environment & port
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Simple healthcheck hits your "/" route
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD \
  node -e "require('http').get('http://localhost:3000/', r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# Least-privilege user
USER node

# Start the app (uses your package.json "start": "node server.js")
CMD ["npm", "start"]

