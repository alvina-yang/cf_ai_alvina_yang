#!/bin/bash

# AgentFlow Setup Script
# This script automates the initial setup process

set -e

echo "🚀 AgentFlow Setup Script"
echo "========================="
echo ""

# Check Node.js version
echo "✓ Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi
echo "  Node.js version: $(node -v) ✓"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "⚠️  Wrangler CLI not found. Installing globally..."
    npm install -g wrangler
fi

# Login to Cloudflare (if not already logged in)
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "Please log in to Cloudflare:"
    wrangler login
fi
echo ""

# Create KV namespace
echo "🗄️  Creating Cloudflare KV namespace..."
KV_OUTPUT=$(npx wrangler kv:namespace create WORKFLOWS_KV 2>&1)
echo "$KV_OUTPUT"

# Extract KV ID from output
KV_ID=$(echo "$KV_OUTPUT" | grep -o 'id = "[^"]*"' | cut -d'"' -f2)

if [ -z "$KV_ID" ]; then
    echo "⚠️  Could not automatically extract KV namespace ID."
    echo "   Please manually update wrangler.toml with your KV namespace ID."
else
    echo "  KV Namespace ID: $KV_ID"
    
    # Update wrangler.toml
    echo "📝 Updating wrangler.toml..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/id = \"your-kv-namespace-id\"/id = \"$KV_ID\"/" wrangler.toml
    else
        # Linux
        sed -i "s/id = \"your-kv-namespace-id\"/id = \"$KV_ID\"/" wrangler.toml
    fi
    echo "  Updated wrangler.toml ✓"
fi
echo ""

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📋 Creating .env.local..."
    cat > .env.local << EOF
WORKER_URL=http://localhost:8787
NEXT_PUBLIC_WORKER_URL=http://localhost:8787
EOF
    echo "  Created .env.local ✓"
else
    echo "  .env.local already exists ✓"
fi
echo ""

echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "  1. Start the worker:    npm run dev:worker"
echo "  2. Start the frontend:  npm run dev"
echo "  3. Open browser:        http://localhost:3000"
echo ""
echo "📖 Read the Quick Start guide: ./QUICKSTART.md"
echo "🎉 Happy building with AgentFlow!"
