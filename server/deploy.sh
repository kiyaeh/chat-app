#!/bin/bash

echo "🚀 Starting Chat App Production Deployment..."

# Check prerequisites
echo "📋 Checking prerequisites..."
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed."; exit 1; }

# Environment setup
echo "🔧 Setting up environment..."
if [ ! -f .env.prod ]; then
    echo "Creating production environment file..."
    cat > .env.prod << EOF
NODE_ENV=production
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/chatapp
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
CORS_ORIGIN=https://your-domain.com
PORT=3000
EOF
fi

# Build and start services
echo "🏗️ Building and starting services..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.prod.yml exec api-gateway npx prisma migrate deploy

# Health check
echo "🔍 Running health checks..."
for i in {1..10}; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ Services are healthy!"
        break
    fi
    echo "⏳ Waiting for services... ($i/10)"
    sleep 10
done

# Display status
echo "📊 Deployment Status:"
docker-compose -f docker-compose.prod.yml ps

echo "🎉 Production deployment complete!"
echo "📍 API Gateway: http://localhost:3000"
echo "📍 Health Check: http://localhost:3000/health"
echo "📍 WebSocket: http://localhost:3007"

echo "🔧 To monitor logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "🛑 To stop: docker-compose -f docker-compose.prod.yml down"