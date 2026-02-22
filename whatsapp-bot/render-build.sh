#!/usr/bin/env bash
# exit on error
set -o errexit

npm install

# Install Chrome for Puppeteer
# This is a common pattern for running Puppeteer on Render
# Note: Render's environment might already have basic libs or require these
# Depending on the specific Render environment, you might need to use a Dockerfile 
# or a specialized build script like this.

echo "Installing Chrome dependencies..."
# This part is illustrative - Render's "Web Service" (Node) might need a Dockerfile
# for full Puppeteer support, but we can try the direct approach first.

# If we were on Ubuntu/Debian:
# apt-get update && apt-get install -y libnss3 libatk-bridge2.0-0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libasound2 libpangocairo-1.0-0 libcups2
