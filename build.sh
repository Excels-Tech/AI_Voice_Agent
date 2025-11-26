#!/bin/bash
# Build script for Render deployment

set -e  # Exit on error

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install --no-cache-dir -r requirements.txt

echo "Verifying gunicorn installation..."
which gunicorn || echo "WARNING: gunicorn not found in PATH"
python -c "import gunicorn; print(f'Gunicorn version: {gunicorn.__version__}')" || echo "ERROR: Cannot import gunicorn"

echo "Installing Node.js dependencies..."
npm ci || npm install

echo "Building frontend..."
npm run build

echo "Copying frontend build to backend static folder..."
rm -rf backend/static/frontend || true
mkdir -p backend/static/frontend
cp -r dist/* backend/static/frontend/

echo "Build completed successfully!"
