#!/bin/bash
# Toomey Estimator — One-Click Deploy
# Double-click this file to deploy to GitHub Pages

cd ~/Documents/ToomeyEstimator

echo ""
echo "🚀 Deploying Toomey Estimator to GitHub Pages..."
echo ""

git add index.html manifest.json sw.js
git commit -m "Update app — $(date '+%Y-%m-%d %H:%M')"
git push origin main

echo ""
echo "✅ Done! Live at https://colins4220.github.io/Toomey-estimates/"
echo "   (GitHub Pages may take 1-2 minutes to update)"
echo ""
echo "Press any key to close..."
read -n 1
