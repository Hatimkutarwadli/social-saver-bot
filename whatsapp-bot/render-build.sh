#!/usr/bin/env bash
# exit on error
set -o errexit

npm install

# Install Chrome for Puppeteer
# This is a common pattern for running Puppeteer on Render
# Note: Render's environment might already have basic libs or require these
# Depending on the specific Render environment, you might need to use a Dockerfile 
# or a specialized build script like this.

echo "Installing dependencies..."
npm install

echo "Installing Chrome for Puppeteer locally..."
# Install chrome into a local folder that will be part of the build artifact
npx puppeteer browsers install chrome --path ./chrome
