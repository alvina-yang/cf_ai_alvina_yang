#!/bin/bash

# AgentFlow Deployment Script
# Deploys both worker and frontend to Cloudflare

set -e

echo "🚀 AgentFlow Deployment Script"
echo "==============================="
echo ""

# Check if logged in
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not logged in to Cloudflare. Please run: wrangler login"
    exit 1
fi
echo "  Authenticated ✓"
echo ""

# Deploy Worker
echo "☁️  Deploying Cloudflare Worker..."
npm run deploy:worker
echo ""

# Get worker URL
WORKER_URL=$(wrangler deployments list 2>/dev/null | grep "https://" | head -n1 | awk '{print $1}')

if [ -z "$WORKER_URL" ]; then
    echo "⚠️  Could not detect worker URL. Please check wrangler output above."
    read -p "Enter your worker URL (e.g., https://agentflow.your-name.workers.dev): " WORKER_URL
fi

echo "  Worker deployed at: $WORKER_URL ✓"
echo ""

# Build frontend
echo "🏗️  Building Next.js frontend..."
npm run build
echo ""

# Deploy to Pages
echo "📄 Deploying to Cloudflare Pages..."
echo "  Setting environment variable: NEXT_PUBLIC_WORKER_URL=$WORKER_URL"

# Deploy with environment variable
wrangler pages deploy .next --project-name agentflow \
    --env NEXT_PUBLIC_WORKER_URL="$WORKER_URL"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your AgentFlow is now live!"
echo "   Worker:   $WORKER_URL"
echo "   Frontend: Check the Pages deployment URL above"
echo ""
echo "💡 Next steps:"
echo "  1. Test your production deployment"
echo "  2. Set up custom domain (optional)"
echo "  3. Configure rate limiting for production"
echo ""
