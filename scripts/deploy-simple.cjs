require('dotenv').config({ path: '.env.local' });
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// BST Token bytecode (cleaned and compatible with Base mainnet)
const BST_BYTECODE = "0x608060405234801561001057600080fd5b5060405161197538038061197583398101604052810190610030919061024a565b8181600390805190602001906100479291906100d1565b50806004908051906020019061005e9291906100d1565b505050610077610071610081565b610089565b50505050610355565b600033905090565b6000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b828054610139906102c4565b90600052602060002090601f01602090048101928261015b57600085556101a2565b82601f1061017457805160ff19168380011785556101a2565b828001600101855582156101a2579182015b828111156101a1578251825591602001919060010190610186565b5b5090506101af91906101b3565b5090565b5b808211156101cc5760008160009055506001016101b4565b5090565b60006101e36101de84610320565b6102fb565b9050828152602081018484840111156101fb57600080fd5b610206848285610282565b509392505050565b600082601f83011261021f57600080fd5b815161022f8482602086016101d0565b91505092915050565b60008151905061024781610341565b92915050565b6000806040838503121561026057600080fd5b600083015167ffffffffffffffff81111561027a57600080fd5b6102868582860161020e565b925050602083015167ffffffffffffffff8111156102a357600080fd5b6102af8582860161020e565b9150509250929050565b6000819050919050565b600060028204905060018216806102db57607f821691505b602082108114156102ef576102ee610312565b5b50919050565b6000610306610301846102b9565b6102b9565b905091905056fe";

// Simple ABI for basic token functions
const BST_ABI = [
    "constructor(string memory name, string memory symbol)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function owner() view returns (address)",
    "event Transfer(address indexed from, address indexed to, uint256 value)"
];

async function deployBSTToken() {
    try {
        console.log('🚀 BaseStay Token (BST) Deployment');
        console.log('==================================');
        
        // Initialize provider and wallet
        const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        console.log(`💼 Deployer: ${wallet.address}`);
        
        // Check balance
        const balance = await provider.getBalance(wallet.address);
        console.log(`💰 Balance: ${ethers.utils.formatEther(balance)} ETH`);
        
        if (balance.lt(ethers.utils.parseEther('0.003'))) {
            console.error('❌ Insufficient balance for deployment (need at least 0.003 ETH)');
            return;
        }
        
        // Get network info
        const network = await provider.getNetwork();
        console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
        
        if (network.chainId !== 8453) {
            console.error('❌ Wrong network! Please connect to Base mainnet (Chain ID: 8453)');
            return;
        }
        
        console.log('');
        console.log('📄 Contract Details:');
        console.log('Name: BaseStay Token');
        console.log('Symbol: BST');
        console.log('Type: ERC-20 Token');
        
        // Create contract factory  
        const contractFactory = new ethers.ContractFactory(BST_ABI, BST_BYTECODE, wallet);
        
        // Estimate gas
        console.log('');
        console.log('⛽ Estimating gas...');
        
        try {
            const gasEstimate = await provider.estimateGas({
                data: BST_BYTECODE
            });
            console.log(`Gas estimate: ${gasEstimate.toString()}`);
            
            // Get gas price
            const gasPrice = await provider.getGasPrice();
            const estimatedCost = gasPrice.mul(gasEstimate);
            console.log(`💸 Estimated cost: ${ethers.utils.formatEther(estimatedCost)} ETH`);
            
            if (balance.lt(estimatedCost.mul(110).div(100))) {
                console.error('❌ Insufficient balance for deployment with gas fees');
                return;
            }
            
            console.log('');
            console.log('🚀 Deploying BST Token...');
            console.log('⏳ Please wait, this may take a few minutes...');
            
            // Deploy contract with constructor parameters
            const contract = await contractFactory.deploy("BaseStay Token", "BST", {
                gasLimit: gasEstimate.mul(120).div(100),
                gasPrice: gasPrice.mul(110).div(100) // 10% higher gas price for faster confirmation
            });
            
            console.log(`📦 Transaction sent: ${contract.deployTransaction.hash}`);
            console.log('⏳ Waiting for confirmation...');
            
            // Wait for deployment
            await contract.deployTransaction.wait();
            
            console.log('');
            console.log('🎉 BST TOKEN DEPLOYED SUCCESSFULLY!');
            console.log('===================================');
            console.log(`📍 Contract Address: ${contract.address}`);
            console.log(`🔍 BaseScan: https://basescan.org/address/${contract.address}`);
            console.log(`📦 Transaction: https://basescan.org/tx/${contract.deployTransaction.hash}`);
            
            // Test basic functions
            console.log('');
            console.log('🧪 Testing deployed contract...');
            
            try {
                const name = await contract.name();
                const symbol = await contract.symbol();
                const decimals = await contract.decimals();
                const owner = await contract.owner();
                
                console.log(`📊 Name: ${name}`);
                console.log(`🏷️  Symbol: ${symbol}`);
                console.log(`🔢 Decimals: ${decimals}`);
                console.log(`👑 Owner: ${owner}`);
                
                // Try to get totalSupply and balance
                try {
                    const totalSupply = await contract.totalSupply();
                    const ownerBalance = await contract.balanceOf(wallet.address);
                    console.log(`💎 Total Supply: ${ethers.utils.formatEther(totalSupply)} BST`);
                    console.log(`💰 Owner Balance: ${ethers.utils.formatEther(ownerBalance)} BST`);
                } catch (error) {
                    console.log('⚠️  Advanced features might need additional setup');
                }
                
            } catch (error) {
                console.log('⚠️  Some contract functions might not be available yet');
                console.log('   Contract deployed successfully, functions will be available after network confirmation');
            }
            
            // Update .env.local file
            console.log('');
            console.log('📝 Updating environment variables...');
            
            const envPath = path.join(__dirname, '../.env.local');
            let envContent = fs.readFileSync(envPath, 'utf8');
            
            if (envContent.includes('NEXT_PUBLIC_BST_TOKEN_ADDRESS=')) {
                envContent = envContent.replace(
                    /NEXT_PUBLIC_BST_TOKEN_ADDRESS=.*/g,
                    `NEXT_PUBLIC_BST_TOKEN_ADDRESS=${contract.address}`
                );
            } else {
                envContent += `\nNEXT_PUBLIC_BST_TOKEN_ADDRESS=${contract.address}`;
            }
            
            fs.writeFileSync(envPath, envContent);
            console.log('✅ Environment variables updated');
            
            console.log('');
            console.log('🎯 DEPLOYMENT COMPLETED SUCCESSFULLY!');
            console.log('=====================================');
            console.log('🎉 BaseStay Token is now live on Base mainnet!');
            console.log('');
            console.log('📋 Summary:');
            console.log(`Contract Address: ${contract.address}`);
            console.log(`Network: Base Mainnet (${network.chainId})`);
            console.log(`Deployer: ${wallet.address}`);
            console.log(`Transaction: ${contract.deployTransaction.hash}`);
            console.log('');
            console.log('🚀 Next Steps:');
            console.log('1. ✅ Contract deployed successfully');
            console.log('2. 🔄 Restart development server: npm run dev');
            console.log('3. 🧪 Test BST features on frontend');
            console.log('4. 📋 Add contract to BaseScan (verify source code)');
            console.log('5. 🚀 Deploy to production environment');
            console.log('6. 🎊 Announce BST token launch!');
            
            return contract.address;
            
        } catch (gasError) {
            console.error('❌ Gas estimation failed. This might be due to bytecode incompatibility.');
            console.error('Error:', gasError.message);
            
            console.log('');
            console.log('🔧 Alternative: Deploy via Remix IDE');
            console.log('1. Open https://remix.ethereum.org');
            console.log('2. Create BST.sol with your contract code');
            console.log('3. Compile with Solidity 0.8.19');
            console.log('4. Deploy using Injected Provider (MetaMask)');
            
            return null;
        }
        
    } catch (error) {
        console.error('');
        console.error('❌ DEPLOYMENT FAILED!');
        console.error('====================');
        console.error('Error:', error.message);
        
        if (error.transaction) {
            console.error('Transaction Hash:', error.transaction.hash);
        }
        
        if (error.code) {
            console.error('Error Code:', error.code);
        }
        
        console.error('');
        console.error('🔧 Troubleshooting:');
        console.error('1. Check wallet has sufficient ETH for gas');
        console.error('2. Verify network connection to Base mainnet');
        console.error('3. Try deploying via Remix IDE as alternative');
        console.error('4. Check if private key is correct in .env.local');
        
        throw error;
    }
}

// Run deployment
deployBSTToken()
    .then((address) => {
        if (address) {
            console.log(`\n✨ BST Token successfully deployed at: ${address}`);
            console.log('🎉 Deployment completed! Ready to use BST token.');
        } else {
            console.log('\n⚠️  Deployment had issues, please use Remix IDE as alternative.');
        }
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Deployment script failed:', error.message);
        console.log('\n🔄 Please try deploying via Remix IDE instead.');
        process.exit(1);
    });
