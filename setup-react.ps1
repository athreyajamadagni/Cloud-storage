# -------------------------------
# React App Setup Script
# Author: Athreya Jamadagni
# -------------------------------

Write-Host "🚀 Setting up execution policy for this session..." -ForegroundColor Cyan
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

# Check Node.js
Write-Host "`n🔍 Checking Node.js installation..."
if (Get-Command node -ErrorAction SilentlyContinue) {
    node -v
} else {
    Write-Host "❌ Node.js not found! Please install from https://nodejs.org/" -ForegroundColor Red
    exit
}

# Check npm
Write-Host "`n🔍 Checking npm installation..."
if (Get-Command npm -ErrorAction SilentlyContinue) {
    npm -v
} else {
    Write-Host "❌ npm not found! Check your Node.js setup." -ForegroundColor Red
    exit
}

# Check npx
Write-Host "`n🔍 Checking npx installation..."
if (Get-Command npx -ErrorAction SilentlyContinue) {
    npx -v
} else {
    Write-Host "❌ npx not found! Check your Node.js setup." -ForegroundColor Red
    exit
}

# Project Setup
Write-Host "`n📂 Creating React app 'mycloud'..." -ForegroundColor Yellow
cd "D:\Athreya\Projects\Cloud-storage"
if (Test-Path "mycloud") {
    Write-Host "⚠️ 'mycloud' folder already exists. Skipping create-react-app." -ForegroundColor Yellow
} else {
    npx create-react-app mycloud
}

cd mycloud

# Install dependencies
Write-Host "`n📦 Installing dependencies (lucide-react, react-router-dom)..." -ForegroundColor Yellow
npm install lucide-react react-router-dom

# Start development server
Write-Host "`n▶️ Starting development server..." -ForegroundColor Green
npm start
