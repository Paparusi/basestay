const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Retry helper function
async function retryWithDelay(fn, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.log(`⚠️  Attempt ${i + 1} failed: ${error.message}`);
      if (i === retries - 1) throw error;
      console.log(`⏳ Retrying in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}

async function deployBookingManager() {
  try {
    console.log('📅 Deploying BookingManager Contract (with retry)');
    console.log('=================================================');

    // Try multiple RPC endpoints
    const rpcUrls = [
      'https://mainnet.base.org',
      'https://base-mainnet.public.blastapi.io',
      'https://base.blockpi.network/v1/rpc/public'
    ];

    let provider;
    let wallet;

    // Find working RPC
    for (const rpcUrl of rpcUrls) {
      try {
        console.log(`🔗 Trying RPC: ${rpcUrl}`);
        provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        // Test connection
        await retryWithDelay(async () => {
          const network = await provider.getNetwork();
          if (network.chainId !== 8453) {
            throw new Error(`Wrong network: ${network.chainId}`);
          }
          console.log(`✅ Connected to Base mainnet via ${rpcUrl}`);
          return network;
        });
        
        break;
      } catch (error) {
        console.log(`❌ Failed to connect to ${rpcUrl}`);
        continue;
      }
    }

    if (!provider || !wallet) {
      throw new Error('Could not connect to any Base RPC endpoint');
    }

    console.log(`💼 Deployer: ${wallet.address}`);
    
    // Check balance with retry
    const balance = await retryWithDelay(async () => {
      return await wallet.getBalance();
    });
    console.log(`💰 Balance: ${ethers.utils.formatEther(balance)} ETH`);
    
    if (balance.lt(ethers.utils.parseEther('0.005'))) {
      console.error('❌ Insufficient balance for deployment');
      return;
    }

    // Get deployed contract addresses
    const bstTokenAddress = process.env.NEXT_PUBLIC_BST_TOKEN_ADDRESS;
    const propertyRegistryAddress = process.env.NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS;
    
    console.log(`🪙 BST Token: ${bstTokenAddress}`);
    console.log(`🏠 PropertyRegistry: ${propertyRegistryAddress}`);

    // Simplified BookingManager contract
    const contractSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleBookingManager {
    address public owner;
    address public bstToken;
    address public propertyRegistry;
    address public usdcToken;
    
    uint256 public platformFeeRate = 250; // 2.5%
    uint256 public nextBookingId = 1;
    
    struct Booking {
        uint256 id;
        uint256 propertyId;
        address guest;
        address host;
        uint256 checkIn;
        uint256 checkOut;
        uint256 totalPrice;
        uint256 platformFee;
        uint8 status; // 0=Pending, 1=Confirmed, 2=CheckedIn, 3=CheckedOut, 4=Cancelled
        uint256 createdAt;
    }
    
    mapping(uint256 => Booking) public bookings;
    mapping(address => uint256[]) public guestBookings;
    mapping(address => uint256[]) public hostBookings;
    
    event BookingCreated(uint256 indexed bookingId, uint256 indexed propertyId, address indexed guest);
    event BookingConfirmed(uint256 indexed bookingId);
    event BookingCancelled(uint256 indexed bookingId);
    
    constructor(address _bstToken, address _propertyRegistry) {
        owner = msg.sender;
        bstToken = _bstToken;
        propertyRegistry = _propertyRegistry;
        usdcToken = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913; // Base USDC
    }
    
    function createBooking(
        uint256 propertyId,
        address host,
        uint256 checkIn,
        uint256 checkOut,
        uint256 pricePerNight
    ) external {
        require(checkIn > block.timestamp, "Check-in must be future");
        require(checkOut > checkIn, "Invalid dates");
        require(host != msg.sender, "Cannot book own property");
        
        uint256 nights = (checkOut - checkIn) / 86400;
        uint256 totalPrice = pricePerNight * nights;
        uint256 platformFee = (totalPrice * platformFeeRate) / 10000;
        
        uint256 bookingId = nextBookingId++;
        
        bookings[bookingId] = Booking({
            id: bookingId,
            propertyId: propertyId,
            guest: msg.sender,
            host: host,
            checkIn: checkIn,
            checkOut: checkOut,
            totalPrice: totalPrice,
            platformFee: platformFee,
            status: 0, // Pending
            createdAt: block.timestamp
        });
        
        guestBookings[msg.sender].push(bookingId);
        hostBookings[host].push(bookingId);
        
        emit BookingCreated(bookingId, propertyId, msg.sender);
    }
    
    function confirmBooking(uint256 bookingId) external {
        Booking storage booking = bookings[bookingId];
        require(booking.host == msg.sender, "Only host can confirm");
        require(booking.status == 0, "Not pending");
        
        booking.status = 1; // Confirmed
        
        emit BookingConfirmed(bookingId);
    }
    
    function cancelBooking(uint256 bookingId) external {
        Booking storage booking = bookings[bookingId];
        require(
            booking.guest == msg.sender || booking.host == msg.sender,
            "Not authorized"
        );
        require(booking.status <= 1, "Cannot cancel");
        
        booking.status = 4; // Cancelled
        
        emit BookingCancelled(bookingId);
    }
    
    function getBooking(uint256 bookingId) external view returns (Booking memory) {
        return bookings[bookingId];
    }
    
    function getGuestBookings(address guest) external view returns (uint256[] memory) {
        return guestBookings[guest];
    }
    
    function getHostBookings(address host) external view returns (uint256[] memory) {
        return hostBookings[host];
    }
    
    // Admin functions
    function setPlatformFeeRate(uint256 newRate) external {
        require(msg.sender == owner, "Only owner");
        require(newRate <= 1000, "Max 10%");
        platformFeeRate = newRate;
    }
}
`;

    console.log('📝 Compiling BookingManager contract...');
    
    // Compile contract using solc
    const solc = require('solc');
    
    const input = {
      language: 'Solidity',
      sources: {
        'BookingManager.sol': {
          content: contractSource
        }
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['abi', 'evm.bytecode']
          }
        },
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    
    if (output.errors) {
      const hasErrors = output.errors.some(error => error.severity === 'error');
      if (hasErrors) {
        console.error('❌ Compilation errors:');
        output.errors.forEach(error => console.error(error.formattedMessage));
        return;
      }
    }

    const contract = output.contracts['BookingManager.sol']['SimpleBookingManager'];
    const abi = contract.abi;
    const bytecode = contract.evm.bytecode.object;

    console.log('✅ Contract compiled successfully');
    console.log(`📦 Bytecode size: ${bytecode.length / 2} bytes`);

    // Deploy with retry
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    
    console.log('🚀 Deploying BookingManager...');
    
    const bookingManager = await retryWithDelay(async () => {
      const gasEstimate = await wallet.estimateGas(
        await factory.getDeployTransaction(bstTokenAddress, propertyRegistryAddress)
      );
      console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
      
      return await factory.deploy(bstTokenAddress, propertyRegistryAddress);
    });
    
    console.log(`📍 Transaction hash: ${bookingManager.deployTransaction.hash}`);
    console.log('⏳ Waiting for confirmation...');
    
    await retryWithDelay(async () => {
      return await bookingManager.deployed();
    });
    
    const contractAddress = bookingManager.address;
    
    console.log('🎉 BookingManager deployed successfully!');
    console.log('======================================');
    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(`🔍 BaseScan: https://basescan.org/address/${contractAddress}`);
    console.log(`📦 Transaction: https://basescan.org/tx/${bookingManager.deployTransaction.hash}`);

    // Test contract functions with retry
    console.log('');
    console.log('🧪 Testing deployed contract...');
    
    try {
      await retryWithDelay(async () => {
        const owner = await bookingManager.owner();
        const bstToken = await bookingManager.bstToken();
        const propertyRegistry = await bookingManager.propertyRegistry();
        const usdcToken = await bookingManager.usdcToken();
        const platformFeeRate = await bookingManager.platformFeeRate();
        const nextBookingId = await bookingManager.nextBookingId();
        
        console.log(`👑 Owner: ${owner}`);
        console.log(`🪙 BST Token: ${bstToken}`);
        console.log(`🏠 PropertyRegistry: ${propertyRegistry}`);
        console.log(`💵 USDC Token: ${usdcToken}`);
        console.log(`📊 Platform Fee: ${platformFeeRate / 100}%`);
        console.log(`🔢 Next Booking ID: ${nextBookingId.toString()}`);
      });
      
    } catch (error) {
      console.log('⚠️  Contract functions will be available after network confirmation');
    }

    // Update .env.local file
    console.log('');
    console.log('📝 Updating environment variables...');
    
    const envPath = path.join(__dirname, '../.env.local');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('NEXT_PUBLIC_BOOKING_MANAGER_ADDRESS=')) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_BOOKING_MANAGER_ADDRESS=.*/g,
        `NEXT_PUBLIC_BOOKING_MANAGER_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_BOOKING_MANAGER_ADDRESS=${contractAddress}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Environment variables updated');

    // Save deployment info
    const deploymentInfo = {
      contractAddress,
      transactionHash: bookingManager.deployTransaction.hash,
      network: 'Base Mainnet',
      chainId: 8453,
      deployer: wallet.address,
      bstTokenAddress,
      propertyRegistryAddress,
      gasUsed: 'TBD',
      timestamp: new Date().toISOString(),
      contractDetails: {
        name: 'SimpleBookingManager',
        platformFeeRate: '2.5%',
        owner: wallet.address
      }
    };

    fs.writeFileSync(
      path.join(__dirname, '../booking-manager-deployment.json'),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log('');
    console.log('🎯 DEPLOYMENT COMPLETED SUCCESSFULLY!');
    console.log('=====================================');
    console.log('🎉 BookingManager is now live on Base mainnet!');
    console.log('');
    console.log('📋 Deployed Contracts Summary:');
    console.log(`• BST Token: ${bstTokenAddress}`);
    console.log(`• PropertyRegistry: ${propertyRegistryAddress}`);
    console.log(`• BookingManager: ${contractAddress}`);
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('1. Deploy ReviewSystem contract (final contract)');
    console.log('2. Create booking interface on frontend');
    console.log('3. Test complete platform functionality');
    console.log('4. Production deployment to Vercel');

  } catch (error) {
    console.error('💥 Deployment failed:', error);
    if (error.reason) console.error('Reason:', error.reason);
  }
}

deployBookingManager();
