#!/bin/bash

# Production deployment script
set -e

DOCKER_IMAGE="ghcr.io/yourusername/gerald-portfolio-chatbot"
TAG=${1:-latest}

echo "🚀 Deploying Gerald's Portfolio Chatbot to Production"
echo "📦 Image: ${DOCKER_IMAGE}:${TAG}"

# Verify environment
if [ ! -f .env.production ]; then
    echo "❌ Missing .env.production file"
    exit 1
fi

# Pull latest image
echo "📥 Pulling latest image..."
docker pull ${DOCKER_IMAGE}:${TAG}

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down || true

# Start new containers
echo "🚀 Starting new containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for health check
echo "🔍 Waiting for health check..."
sleep 10

# Verify deployment
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/v1/health || echo "000")

if [ "${HEALTH_CHECK}" = "200" ]; then
    echo "✅ Deployment successful! Service is healthy."
    
    # Test API endpoints
    echo "🧪 Running post-deployment tests..."
    curl -s http://localhost:5000/api/v1/health | jq .
    
    echo "🎉 Production deployment complete!"
else
    echo "❌ Deployment failed! Health check returned: ${HEALTH_CHECK}"
    echo "📋 Container logs:"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi