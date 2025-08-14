#!/bin/bash

echo "🌞 Mazi Green Energy - Solar Plant Monitoring Platform Setup"
echo "=========================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm -v) detected"
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Create environment files
echo "🔧 Setting up environment configuration..."

# Backend environment
if [ ! -f "server/.env" ]; then
    echo "📝 Creating server/.env file..."
    cp server/env.example server/.env
    echo "   Please update server/.env with your configuration values"
else
    echo "✅ server/.env already exists"
fi

# Frontend environment
if [ ! -f "client/.env" ]; then
    echo "📝 Creating client/.env file..."
    cat > client/.env << EOF
REACT_APP_API_URL=http://localhost:5000
EOF
    echo "   Please update client/.env with your production API URL when deploying"
else
    echo "✅ client/.env already exists"
fi

echo ""
echo "🚀 Setup complete! Next steps:"
echo ""
echo "1. Configure your environment variables:"
echo "   - Update server/.env with your database and API keys"
echo "   - Update client/.env with your backend URL"
echo ""
echo "2. Start the development servers:"
echo "   npm run dev"
echo ""
echo "3. Open your browser to:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "4. For production deployment, see DEPLOYMENT.md"
echo ""
echo "🌞 Happy monitoring! Mazi Green Energy"
