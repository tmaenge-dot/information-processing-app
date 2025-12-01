#!/bin/bash

# GitHub Pages Deployment Script
# This script deploys the dist folder to GitHub Pages

echo "🚀 Starting GitHub Pages Deployment..."
echo ""

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist folder not found. Please run 'npm run build' first."
    exit 1
fi

echo "📦 Dist folder found. Proceeding with deployment..."
echo ""

# Check if gh-pages package is available
if command -v gh-pages &> /dev/null; then
    echo "✅ Using gh-pages package for deployment..."
    npx gh-pages -d dist
else
    echo "⚠️  gh-pages package not found. Using git subtree method..."
    
    # Commit current changes
    echo "📝 Committing current changes..."
    git add .
    git commit -m "Build: Deploy to GitHub Pages - Fix payment 404 error" || echo "No changes to commit"
    
    # Push to main
    echo "⬆️  Pushing to main branch..."
    git push origin main
    
    # Deploy dist folder to gh-pages branch
    echo "🌐 Deploying to gh-pages branch..."
    git subtree push --prefix dist origin gh-pages
fi

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your app should be live at: https://tmaenge-dot.github.io/typing-practice/"
echo ""
echo "⏱️  Note: GitHub Pages may take a few minutes to update."
echo "💡 Visit your repository settings to check the deployment status."
