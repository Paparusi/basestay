const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function deployBookingManager() {
  try {
    console.log('📅 Deploying BookingManager Contract');
    console.log('====================================');

    // Setup provider and wallet
    const provider = new ethers.providers.JsonRpcProvider(process.env.BASE_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log(`💼 Deployer: ${wallet.address}`);
    
    // Check balance
    const balance = await wallet.getBalance();
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

    // BookingManager contract source
    const contractSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IPropertyRegistry {
    struct Property {
        uint256 id;
        address host;
        string metadataURI;
        uint256 pricePerNight;
        uint256 bstStaked;
        bool isActive;
    }
    
    function getProperty(uint256 propertyId) external view returns (Property memory);
}

contract SimpleBookingManager {
    address public owner;
    address public bstToken;
    address public propertyRegistry;
    address public usdcToken; // Base USDC: 0x833589fcd6edb6e08f4c7c32d4f71b54bda02913
    
    uint256 public platformFeeRate = 250; // 2.5% in basis points
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
        BookingStatus status;
        uint256 createdAt;
    }
    
    enum BookingStatus {
        Pending,
        Confirmed,
        CheckedIn,
        CheckedOut,
        Cancelled,
        Disputed
    }
    
    mapping(uint256 => Booking) public bookings;
    mapping(address => uint256[]) public guestBookings;
    mapping(address => uint256[]) public hostBookings;
    mapping(uint256 => mapping(uint256 => bool)) public propertyAvailability; // propertyId => date => isBooked
    
    event BookingCreated(uint256 indexed bookingId, uint256 indexed propertyId, address indexed guest);
    event BookingConfirmed(uint256 indexed bookingId);
    event BookingCancelled(uint256 indexed bookingId);
    event PaymentProcessed(uint256 indexed bookingId, uint256 amount);
    
    constructor(address _bstToken, address _propertyRegistry, address _usdcToken) {
        owner = msg.sender;
        bstToken = _bstToken;
        propertyRegistry = _propertyRegistry;
        usdcToken = _usdcToken;
    }
    
    function createBooking(
        uint256 propertyId,
        uint256 checkIn,
        uint256 checkOut
    ) external {
        require(checkIn > block.timestamp, "Check-in date must be in future");
        require(checkOut > checkIn, "Check-out must be after check-in");
        
        // Get property details
        IPropertyRegistry.Property memory property = IPropertyRegistry(propertyRegistry).getProperty(propertyId);
        require(property.isActive, "Property not active");
        require(property.host != msg.sender, "Cannot book your own property");
        
        // Check availability
        uint256 nights = (checkOut - checkIn) / 86400; // seconds per day
        for (uint256 i = 0; i < nights; i++) {
            uint256 date = checkIn + (i * 86400);
            require(!propertyAvailability[propertyId][date], "Property not available for selected dates");
        }
        
        // Calculate pricing
        uint256 totalPrice = property.pricePerNight * nights;
        uint256 platformFee = (totalPrice * platformFeeRate) / 10000;
        
        // Apply BST discount
        uint256 bstBalance = IERC20(bstToken).balanceOf(msg.sender);
        if (bstBalance >= 100000 * 10**18) { // 100k+ BST = 2% discount
            platformFee = (platformFee * 98) / 100;
        } else if (bstBalance >= 10000 * 10**18) { // 10k+ BST = 1% discount
            platformFee = (platformFee * 99) / 100;
        } else if (bstBalance >= 1000 * 10**18) { // 1k+ BST = 0.5% discount
            platformFee = (platformFee * 995) / 1000;
        }
        
        uint256 bookingId = nextBookingId++;
        
        bookings[bookingId] = Booking({
            id: bookingId,
            propertyId: propertyId,
            guest: msg.sender,
            host: property.host,
            checkIn: checkIn,
            checkOut: checkOut,
            totalPrice: totalPrice,
            platformFee: platformFee,
            status: BookingStatus.Pending,
            createdAt: block.timestamp
        });
        
        guestBookings[msg.sender].push(bookingId);
        hostBookings[property.host].push(bookingId);
        
        // Mark dates as booked
        for (uint256 i = 0; i < nights; i++) {
            uint256 date = checkIn + (i * 86400);
            propertyAvailability[propertyId][date] = true;
        }
        
        emit BookingCreated(bookingId, propertyId, msg.sender);
    }
    
    function confirmBooking(uint256 bookingId) external {
        Booking storage booking = bookings[bookingId];
        require(booking.host == msg.sender, "Only host can confirm");
        require(booking.status == BookingStatus.Pending, "Booking not pending");
        
        // Process payment
        uint256 totalAmount = booking.totalPrice + booking.platformFee;
        require(
            IERC20(usdcToken).transferFrom(booking.guest, address(this), totalAmount),
            "Payment failed"
        );
        
        // Pay host (total price - platform fee gets paid to host)
        require(
            IERC20(usdcToken).transfer(booking.host, booking.totalPrice),
            "Host payment failed"
        );
        
        booking.status = BookingStatus.Confirmed;
        
        emit BookingConfirmed(bookingId);
        emit PaymentProcessed(bookingId, totalAmount);
    }
    
    function cancelBooking(uint256 bookingId) external {
        Booking storage booking = bookings[bookingId];
        require(
            booking.guest == msg.sender || booking.host == msg.sender,
            "Not authorized"
        );
        require(
            booking.status == BookingStatus.Pending || booking.status == BookingStatus.Confirmed,
            "Cannot cancel"
        );
        
        // Free up dates
        uint256 nights = (booking.checkOut - booking.checkIn) / 86400;
        for (uint256 i = 0; i < nights; i++) {
            uint256 date = booking.checkIn + (i * 86400);
            propertyAvailability[booking.propertyId][date] = false;
        }
        
        booking.status = BookingStatus.Cancelled;
        
        emit BookingCancelled(bookingId);
    }
    
    function checkIn(uint256 bookingId) external {
        Booking storage booking = bookings[bookingId];
        require(booking.guest == msg.sender, "Only guest can check in");
        require(booking.status == BookingStatus.Confirmed, "Booking not confirmed");
        require(block.timestamp >= booking.checkIn, "Check-in time not reached");
        
        booking.status = BookingStatus.CheckedIn;
    }
    
    function checkOut(uint256 bookingId) external {
        Booking storage booking = bookings[bookingId];
        require(booking.guest == msg.sender, "Only guest can check out");
        require(booking.status == BookingStatus.CheckedIn, "Not checked in");
        
        booking.status = BookingStatus.CheckedOut;
        
        // Reward guest with BST tokens (0.1% of booking value)
        // This would need to be called by an authorized contract in production
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
    
    function isPropertyAvailable(
        uint256 propertyId,
        uint256 checkIn,
        uint256 checkOut
    ) external view returns (bool) {
        uint256 nights = (checkOut - checkIn) / 86400;
        for (uint256 i = 0; i < nights; i++) {
            uint256 date = checkIn + (i * 86400);
            if (propertyAvailability[propertyId][date]) {
                return false;
            }
        }
        return true;
    }
    
    // Admin functions
    function setPlatformFeeRate(uint256 newRate) external {
        require(msg.sender == owner, "Only owner");
        require(newRate <= 1000, "Fee cannot exceed 10%");
        platformFeeRate = newRate;
    }
    
    function withdrawPlatformFees() external {
        require(msg.sender == owner, "Only owner");
        uint256 balance = IERC20(usdcToken).balanceOf(address(this));
        require(IERC20(usdcToken).transfer(owner, balance), "Withdrawal failed");
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

    // Estimate gas
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const usdcAddress = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'; // Base USDC
    const deployTx = await factory.getDeployTransaction(bstTokenAddress, propertyRegistryAddress, usdcAddress);
    const gasEstimate = await wallet.estimateGas(deployTx);
    
    console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);

    // Deploy contract
    console.log('🚀 Deploying BookingManager...');
    const bookingManager = await factory.deploy(bstTokenAddress, propertyRegistryAddress, usdcAddress);
    
    console.log(`📍 Transaction hash: ${bookingManager.deployTransaction.hash}`);
    console.log('⏳ Waiting for confirmation...');
    
    await bookingManager.deployed();
    const contractAddress = bookingManager.address;
    
    console.log('🎉 BookingManager deployed successfully!');
    console.log('======================================');
    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(`🔍 BaseScan: https://basescan.org/address/${contractAddress}`);
    console.log(`📦 Transaction: https://basescan.org/tx/${bookingManager.deployTransaction.hash}`);

    // Test contract functions
    console.log('');
    console.log('🧪 Testing deployed contract...');
    
    try {
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
      
    } catch (error) {
      console.log('⚠️  Some contract functions might need network confirmation');
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
      usdcAddress,
      gasUsed: gasEstimate.toString(),
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
    console.log('📋 Summary:');
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`BST Integration: ✅ (Fee discounts)`);
    console.log(`USDC Payments: ✅ (Base mainnet)`);
    console.log(`Platform Fee: 2.5%`);
    console.log(`Network: Base Mainnet`);
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('1. Deploy ReviewSystem contract');
    console.log('2. Test complete booking flow');
    console.log('3. Update frontend with booking functionality');
    console.log('4. Production deployment');

  } catch (error) {
    console.error('💥 Deployment failed:', error);
    if (error.reason) console.error('Reason:', error.reason);
  }
}

deployBookingManager();
