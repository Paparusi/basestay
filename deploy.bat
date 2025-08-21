@echo off
REM BaseStay Deployment Script for Windows
echo.
echo 🚀 BaseStay Production Deployment Script
echo ========================================

REM Check if .env.local exists
if not exist ".env.local" (
    echo ❌ .env.local file not found!
    echo 📝 Please copy .env.local.example to .env.local and fill in your values.
    exit /b 1
)

echo ✅ Environment file found!

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Generate Prisma client
echo 🗄️ Generating Prisma client...
call npx prisma generate

REM Build the application
echo 🔨 Building application...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed! Please fix the errors above.
    exit /b 1
)

echo ✅ Build successful!

REM Ask about smart contract deployment
set /p deploy_contracts="🔗 Do you want to deploy smart contracts to Base mainnet? (y/N): "

if /i "%deploy_contracts%"=="y" (
    echo 📋 Deploying smart contracts...
    
    cd contracts
    
    if not exist ".env" (
        echo ❌ contracts\.env file not found!
        echo 📝 Please copy contracts\.env.example to contracts\.env and add your private key.
        cd ..
        exit /b 1
    )
    
    echo 🔨 Building smart contracts...
    call forge build
    
    echo 🚀 Deploying to Base mainnet...
    call forge script script/DeployBaseStay.s.sol --rpc-url %BASE_RPC_URL% --broadcast --verify
    
    cd ..
    
    echo ✅ Smart contracts deployed!
    echo 📝 Don't forget to update your .env.local with the deployed contract addresses!
)

REM Ask about database setup
set /p setup_db="🗄️ Do you want to push database schema? (y/N): "

if /i "%setup_db%"=="y" (
    echo 🗄️ Setting up database schema...
    call npx prisma db push
    echo ✅ Database schema updated!
)

echo.
echo 🎉 BaseStay deployment completed!
echo.
echo 📋 Next Steps:
echo 1. Deploy to your hosting platform (Vercel, Netlify, etc.)
echo 2. Set up your production database (PlanetScale, Railway, etc.)
echo 3. Update environment variables with production values
echo 4. Configure domain and SSL certificates
echo.
echo 🔗 Useful commands:
echo    npm run dev     - Start development server
echo    npm run build   - Build for production  
echo    npm run start   - Start production server
echo.
echo 🌐 Your BaseStay platform is ready for the world!

pause
