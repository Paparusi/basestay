const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function deployPropertyRegistry() {
  try {
    console.log('🏠 Deploying PropertyRegistry Contract');
    console.log('=====================================');

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

    // BST Token Address (already deployed)
    const bstTokenAddress = process.env.NEXT_PUBLIC_BST_TOKEN_ADDRESS;
    console.log(`🪙 BST Token Address: ${bstTokenAddress}`);

    // Simple PropertyRegistry contract source
    const contractSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract SimplePropertyRegistry {
    address public owner;
    address public bstToken;
    uint256 public constant MIN_BST_STAKE = 1000 * 10**18; // 1000 BST
    uint256 public nextPropertyId = 1;
    
    struct Property {
        uint256 id;
        address host;
        string metadataURI;
        uint256 pricePerNight;
        uint256 bstStaked;
        bool isActive;
    }
    
    mapping(uint256 => Property) public properties;
    mapping(address => uint256[]) public hostProperties;
    mapping(address => uint256) public totalStakedBST;
    
    event PropertyListed(uint256 indexed id, address indexed host, uint256 bstStaked);
    event PropertyDeactivated(uint256 indexed id);
    
    constructor(address _bstToken) {
        owner = msg.sender;
        bstToken = _bstToken;
    }
    
    function listProperty(
        string memory metadataURI,
        uint256 pricePerNight,
        uint256 bstStakeAmount
    ) external {
        require(bstStakeAmount >= MIN_BST_STAKE, "Insufficient BST stake");
        require(IERC20(bstToken).balanceOf(msg.sender) >= bstStakeAmount, "Insufficient BST balance");
        
        // Transfer BST stake
        require(
            IERC20(bstToken).transferFrom(msg.sender, address(this), bstStakeAmount),
            "BST transfer failed"
        );
        
        uint256 propertyId = nextPropertyId++;
        
        properties[propertyId] = Property({
            id: propertyId,
            host: msg.sender,
            metadataURI: metadataURI,
            pricePerNight: pricePerNight,
            bstStaked: bstStakeAmount,
            isActive: true
        });
        
        hostProperties[msg.sender].push(propertyId);
        totalStakedBST[msg.sender] += bstStakeAmount;
        
        emit PropertyListed(propertyId, msg.sender, bstStakeAmount);
    }
    
    function deactivateProperty(uint256 propertyId) external {
        require(properties[propertyId].host == msg.sender, "Not property owner");
        require(properties[propertyId].isActive, "Property already inactive");
        
        Property storage property = properties[propertyId];
        property.isActive = false;
        
        // Return BST stake
        uint256 stakeAmount = property.bstStaked;
        totalStakedBST[msg.sender] -= stakeAmount;
        property.bstStaked = 0;
        
        require(
            IERC20(bstToken).transfer(msg.sender, stakeAmount),
            "BST return failed"
        );
        
        emit PropertyDeactivated(propertyId);
    }
    
    function getProperty(uint256 propertyId) external view returns (Property memory) {
        return properties[propertyId];
    }
    
    function getHostProperties(address host) external view returns (uint256[] memory) {
        return hostProperties[host];
    }
}
`;

    console.log('📝 Compiling PropertyRegistry contract...');
    
    // Compile contract using solc
    const solc = require('solc');
    
    const input = {
      language: 'Solidity',
      sources: {
        'PropertyRegistry.sol': {
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

    const contract = output.contracts['PropertyRegistry.sol']['SimplePropertyRegistry'];
    const abi = contract.abi;
    const bytecode = contract.evm.bytecode.object;

    console.log('✅ Contract compiled successfully');
    console.log(`📦 Bytecode size: ${bytecode.length / 2} bytes`);

    // Estimate gas
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const deployTx = await factory.getDeployTransaction(bstTokenAddress);
    const gasEstimate = await wallet.estimateGas(deployTx);
    
    console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);

    // Deploy contract
    console.log('🚀 Deploying PropertyRegistry...');
    const propertyRegistry = await factory.deploy(bstTokenAddress);
    
    console.log(`📍 Transaction hash: ${propertyRegistry.deployTransaction.hash}`);
    console.log('⏳ Waiting for confirmation...');
    
    await propertyRegistry.deployed();
    const contractAddress = propertyRegistry.address;
    
    console.log('🎉 PropertyRegistry deployed successfully!');
    console.log('=========================================');
    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(`🔍 BaseScan: https://basescan.org/address/${contractAddress}`);
    console.log(`📦 Transaction: https://basescan.org/tx/${propertyRegistry.deployTransaction.hash}`);

    // Test contract functions
    console.log('');
    console.log('🧪 Testing deployed contract...');
    
    try {
      const owner = await propertyRegistry.owner();
      const bstTokenAddr = await propertyRegistry.bstToken();
      const minStake = await propertyRegistry.MIN_BST_STAKE();
      const nextId = await propertyRegistry.nextPropertyId();
      
      console.log(`👑 Owner: ${owner}`);
      console.log(`🪙 BST Token: ${bstTokenAddr}`);
      console.log(`💎 Min Stake: ${ethers.utils.formatEther(minStake)} BST`);
      console.log(`🔢 Next Property ID: ${nextId.toString()}`);
      
    } catch (error) {
      console.log('⚠️  Some contract functions might need network confirmation');
    }

    // Update .env.local file
    console.log('');
    console.log('📝 Updating environment variables...');
    
    const envPath = path.join(__dirname, '../.env.local');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS=')) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS=.*/g,
        `NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS=${contractAddress}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Environment variables updated');

    // Save deployment info
    const deploymentInfo = {
      contractAddress,
      transactionHash: propertyRegistry.deployTransaction.hash,
      network: 'Base Mainnet',
      chainId: 8453,
      deployer: wallet.address,
      bstTokenAddress,
      gasUsed: gasEstimate.toString(),
      timestamp: new Date().toISOString(),
      contractDetails: {
        name: 'SimplePropertyRegistry',
        minBSTStake: ethers.utils.formatEther(minStake || MIN_BST_STAKE.toString()),
        owner: wallet.address
      }
    };

    fs.writeFileSync(
      path.join(__dirname, '../property-registry-deployment.json'),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log('');
    console.log('🎯 DEPLOYMENT COMPLETED SUCCESSFULLY!');
    console.log('=====================================');
    console.log('🎉 PropertyRegistry is now live on Base mainnet!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`BST Token Integration: ✅`);
    console.log(`Min Host Stake: 1,000 BST`);
    console.log(`Network: Base Mainnet`);
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('1. Test property listing with BST staking');
    console.log('2. Deploy BookingManager contract');
    console.log('3. Deploy ReviewSystem contract');
    console.log('4. Update frontend with new contract addresses');
    console.log('5. Production deployment to Vercel');

  } catch (error) {
    console.error('💥 Deployment failed:', error);
    if (error.reason) console.error('Reason:', error.reason);
  }
}

deployPropertyRegistry();
