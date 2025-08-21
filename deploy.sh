#!/bin/bash

# BaseStay Deployment Script
# This script helps deploy BaseStay to production

echo "🚀 BaseStay Production Deployment Script"
echo "========================================"

# Check if required tools are installed
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    echo "📝 Please copy .env.local.example to .env.local and fill in your values."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix the errors above."
    exit 1
fi

echo "✅ Build successful!"

# Optional: Deploy smart contracts
read -p "🔗 Do you want to deploy smart contracts to Base mainnet? (y/N): " deploy_contracts

if [[ $deploy_contracts =~ ^[Yy]$ ]]; then
    echo "📋 Deploying smart contracts..."
    
    # Check if Foundry is installed
    if ! command -v forge &> /dev/null; then
        echo "❌ Foundry is not installed. Installing..."
        curl -L https://foundry.paradigm.xyz | bash
        source ~/.bashrc
        foundryup
    fi
    
    cd contracts
    
    if [ ! -f ".env" ]; then
        echo "❌ contracts/.env file not found!"
        echo "📝 Please copy contracts/.env.example to contracts/.env and add your private key."
        cd ..
        exit 1
    fi
    
    echo "🔨 Building smart contracts..."
    forge build
    
    echo "🚀 Deploying to Base mainnet..."
    forge script script/DeployBaseStay.s.sol --rpc-url $BASE_RPC_URL --broadcast --verify
    
    cd ..
    
    echo "✅ Smart contracts deployed!"
    echo "📝 Don't forget to update your .env.local with the deployed contract addresses!"
fi

# Optional: Setup database
read -p "🗄️ Do you want to push database schema? (y/N): " setup_db

if [[ $setup_db =~ ^[Yy]$ ]]; then
    echo "🗄️ Setting up database schema..."
    npx prisma db push
    echo "✅ Database schema updated!"
fi

echo ""
echo "🎉 BaseStay deployment completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Deploy to your hosting platform (Vercel, Netlify, etc.)"
echo "2. Set up your production database (PlanetScale, Railway, etc.)"
echo "3. Update environment variables with production values"
echo "4. Configure domain and SSL certificates"
echo ""
echo "🔗 Useful commands:"
echo "   npm run dev     - Start development server"
echo "   npm run build   - Build for production"
echo "   npm run start   - Start production server"
echo ""
echo "🌐 Your BaseStay platform is ready for the world!"
