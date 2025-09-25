# Deployment Configurations

## Environment Variables Required

### Production

```bash
export NODE_ENV=production
export PORT=5000
export PORTFOLIO_OWNER="Gerald"
export AI_PROVIDER=gemini
export GEMINI_API_KEY="your-gemini-api-key"
export API_KEY="your-secure-api-key"  # Optional but recommended
export ALLOWED_ORIGINS="https://yourportfolio.com,https://www.yourportfolio.com"
export RATE_LIMIT_PER_MINUTE=60
```

### Staging

```bash
export NODE_ENV=staging
export PORT=5000
export PORTFOLIO_OWNER="Gerald"
export AI_PROVIDER=fallback  # Use fallback for testing
export ALLOWED_ORIGINS="https://staging.yourportfolio.com"
export RATE_LIMIT_PER_MINUTE=30
```

## Docker Compose for Different Environments

### Production (docker-compose.prod.yml)

```yaml
version: "3.8"

services:
  portfolio-chatbot:
    image: ghcr.io/yourusername/gerald-portfolio-chatbot:latest
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Staging (docker-compose.staging.yml)

```yaml
version: "3.8"

services:
  portfolio-chatbot:
    image: ghcr.io/yourusername/gerald-portfolio-chatbot:develop
    ports:
      - "5001:5000"
    environment:
      - NODE_ENV=staging
      - PORT=5000
      - AI_PROVIDER=fallback
    env_file:
      - .env.staging
    restart: unless-stopped
```

## Kubernetes Deployment (k8s/)

### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: portfolio-chatbot
  labels:
    app: portfolio-chatbot
spec:
  replicas: 2
  selector:
    matchLabels:
      app: portfolio-chatbot
  template:
    metadata:
      labels:
        app: portfolio-chatbot
    spec:
      containers:
        - name: chatbot
          image: ghcr.io/yourusername/gerald-portfolio-chatbot:latest
          ports:
            - containerPort: 5000
          env:
            - name: NODE_ENV
              value: "production"
            - name: PORT
              value: "5000"
          envFrom:
            - secretRef:
                name: chatbot-secrets
          livenessProbe:
            httpGet:
              path: /api/v1/health
              port: 5000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/v1/health
              port: 5000
            initialDelaySeconds: 5
            periodSeconds: 5
```

## Cloud Platform Deployments

### Vercel (vercel.json)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "microservice-server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/microservice-server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "AI_PROVIDER": "gemini"
  }
}
```

### Railway (railway.toml)

```toml
[build]
builder = "nixpacks"

[deploy]
healthcheckPath = "/api/v1/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"

[[deploy.environmentVariables]]
name = "NODE_ENV"
value = "production"

[[deploy.environmentVariables]]
name = "PORT"
value = "${{ PORT }}"
```

### Render (render.yaml)

```yaml
services:
  - type: web
    name: gerald-portfolio-chatbot
    env: node
    plan: starter
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /api/v1/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: AI_PROVIDER
        value: gemini
```

## Manual Deployment Scripts

### deploy.sh

```bash
#!/bin/bash

# Build and deploy script
set -e

echo "🚀 Deploying Gerald's Portfolio Chatbot..."

# Build Docker image
docker build -t gerald-portfolio-chatbot:latest .

# Tag for registry
docker tag gerald-portfolio-chatbot:latest ghcr.io/yourusername/gerald-portfolio-chatbot:latest

# Push to registry
docker push ghcr.io/yourusername/gerald-portfolio-chatbot:latest

# Deploy with docker-compose
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Deployment complete!"
```
