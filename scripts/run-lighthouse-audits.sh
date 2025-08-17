#!/bin/bash

# Lighthouse Performance Audit Runner
# Usage: ./scripts/run-lighthouse-audits.sh

set -e

echo "🚀 Starting Lighthouse Performance Audits"
echo "=========================================="

# Check if lighthouse is installed
if ! command -v lighthouse &> /dev/null; then
    echo "❌ Lighthouse not found. Installing..."
    npm install -g lighthouse
fi

# Check if chrome-launcher is available
if ! npm list chrome-launcher &> /dev/null; then
    echo "❌ chrome-launcher not found. Installing..."
    npm install chrome-launcher
fi

# Ensure docs/perf directory exists
mkdir -p docs/perf

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Server not running on localhost:3000"
    echo "Please start the server with: npm run build && npm run preview"
    exit 1
fi

echo "✅ Server is running"
echo "📊 Running audits (this may take a few minutes)..."

# Define routes to test
routes=(
    "/:home"
    "/services:services" 
    "/portfolio:portfolio"
    "/blog:blog"
    "/pricing:pricing"
    "/contact:contact"
)

# Run audits for each route
for route_info in "${routes[@]}"; do
    IFS=":" read -r path name <<< "$route_info"
    url="http://localhost:3000$path"
    
    echo "Testing $name ($path)..."
    
    # Mobile audit
    echo "  📱 Mobile..."
    lighthouse "$url" \
        --quiet \
        --chrome-flags='--headless=new' \
        --preset=mobile \
        --output=json \
        --output-path="./docs/perf/${name}-mobile.json" \
        --only-categories=performance
    
    # Desktop audit  
    echo "  🖥️  Desktop..."
    lighthouse "$url" \
        --quiet \
        --chrome-flags='--headless=new' \
        --preset=desktop \
        --output=json \
        --output-path="./docs/perf/${name}-desktop.json" \
        --only-categories=performance
    
    echo "  ✅ $name complete"
done

echo ""
echo "🎉 All audits complete!"
echo "📄 Results saved to docs/perf/"
echo "🔍 Run 'node scripts/lighthouse-runner.js' for detailed summary"