# BaseStay - Decentralized Booking Platform on Base

## Project Overview
- **Platform**: Web3 booking platform (Airbnb-like) built on Base blockchain mainnet
- **Technology**: Next.js, TypeScript, Solidity, Base Account SDK, OnchainKit
- **Payments**: Real USDC on Base mainnet
- **Database**: PostgreSQL for user profiles and property metadata
- **Authentication**: Sign In With Base

## Development Checklist

- [x] ✅ Verify that the copilot-instructions.md file in the .github directory is created
- [x] ✅ Clarify Project Requirements - PRODUCTION READY BaseStay platform
- [x] ✅ Scaffold the Project - Next.js + Web3 + Smart Contracts structure
- [x] ✅ Customize the Project - Real Base mainnet integration, USDC payments
- [x] ✅ Install Required Extensions - Not needed
- [x] ✅ Compile the Project - Successfully built without errors
- [x] ✅ Create and Run Task - Development server running on http://localhost:3000
- [x] ✅ Launch the Project - Application launched and accessible in browser
- [x] ✅ Ensure Documentation is Complete - README.md created with full project details

## Deployment Instructions

### Smart Contract Deployment
1. Install Foundry: `curl -L https://foundry.paradigm.xyz | bash && foundryup`
2. Configure environment: Copy `contracts/.env.example` to `contracts/.env`
3. Add your private key and Base RPC URL
4. Deploy contracts: `cd contracts && forge script script/DeployBaseStay.s.sol --rpc-url $BASE_RPC_URL --broadcast`
5. Update contract addresses in `.env.local`

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_CDP_API_KEY`: Coinbase Developer Platform API key
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: WalletConnect project ID
- `NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS`: Deployed PropertyRegistry contract address
- `NEXT_PUBLIC_BOOKING_MANAGER_ADDRESS`: Deployed BookingManager contract address
- `NEXT_PUBLIC_REVIEW_SYSTEM_ADDRESS`: Deployed ReviewSystem contract address

## Project Status: READY FOR PRODUCTION DEPLOYMENT

## Key Requirements
- Base mainnet (no testnet)
- Real USDC payments via Base Pay
- Production-ready smart contracts
- PostgreSQL database
- IPFS for property images
- Web3 authentication
- Mobile-responsive UI

## Implementation Status
- ✅ Next.js 14 + TypeScript setup
- ✅ Smart contracts (PropertyRegistry, BookingManager, ReviewSystem)
- ✅ Base Account SDK integration
- ✅ OnchainKit Web3 components
- ✅ Prisma database schema
- ✅ UI components with Tailwind CSS
- ✅ Production-ready homepage
- ✅ Foundry contract development setup
