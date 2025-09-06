#!/bin/bash

# Performance Validation Script - Phase 6
# Runs comprehensive Lighthouse audits for all critical routes

set -e

echo "🚀 Starting Phase 6: Final Performance Validation"

# Ensure required dependencies are installed
if ! command -v lighthouse &> /dev/null; then
    echo "Installing Lighthouse..."
    npm install -g lighthouse
fi

if ! command -v chrome-launcher &> /dev/null; then
    echo "Installing chrome-launcher..."
    npm install chrome-launcher
fi

# Create performance reports directory
mkdir -p docs/perf

# Check if server is running
if ! curl -f http://localhost:3000 &> /dev/null; then
    echo "❌ Server not running on localhost:3000"
    echo "Please start the development server with 'npm run dev'"
    exit 1
fi

echo "✅ Server is running, proceeding with audits..."

# Define routes to audit
declare -a routes=(
    "/:Home"
    "/services:Services"
    "/portfolio:Portfolio" 
    "/blog:Blog"
    "/pricing:Pricing"
    "/contact:Contact"
    "/about:About"
)

BASE_URL="http://localhost:3000"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "📊 Running Lighthouse audits for ${#routes[@]} routes..."

# Run audits for each route
for route in "${routes[@]}"; do
    IFS=':' read -r path name <<< "$route"
    
    echo "🔍 Auditing ${name} (${path})..."
    
    # Mobile audit
    lighthouse "${BASE_URL}${path}" \
        --preset=mobile \
        --only-categories=performance \
        --output=json \
        --output-path="docs/perf/${name}_mobile_${TIMESTAMP}.json" \
        --quiet \
        --chrome-flags="--headless --no-sandbox"
    
    # Desktop audit  
    lighthouse "${BASE_URL}${path}" \
        --preset=desktop \
        --only-categories=performance \
        --output=json \
        --output-path="docs/perf/${name}_desktop_${TIMESTAMP}.json" \
        --quiet \
        --chrome-flags="--headless --no-sandbox"
        
    echo "✅ ${name} audit complete"
done

echo "🎯 Performance audits complete! Reports saved to docs/perf/"
echo "📈 Running performance analysis..."

# Generate summary report
node scripts/lighthouse-runner.js

echo "🏆 Phase 6 validation complete!"