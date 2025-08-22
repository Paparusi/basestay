// Simple script to check BST token status (read-only)
import { ethers } from 'ethers';

const BST_ADDRESS = '0x8fDc3a7c612bc637B5659526B29Ee233e291F371';

const BST_ABI = [
    {
        "inputs": [],
        "name": "paused",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
    }
];

async function checkBSTStatus() {
    console.log('🔍 Checking BST Token Status...\n');
    
    try {
        // Connect to Base mainnet (read-only) - try multiple RPC endpoints
        let provider;
        const rpcUrls = [
            'https://base.drpc.org',
            'https://base-mainnet.public.blastapi.io',
            'https://mainnet.base.org',
            'https://base.meowrpc.com'
        ];
        
        let connected = false;
        for (const rpcUrl of rpcUrls) {
            try {
                console.log(`Trying RPC: ${rpcUrl}`);
                provider = new ethers.providers.JsonRpcProvider(rpcUrl);
                // Test connection
                await provider.getNetwork();
                console.log('✅ Connected successfully\n');
                connected = true;
                break;
            } catch (e) {
                console.log(`❌ Failed: ${e.message.slice(0, 50)}...`);
            }
        }
        
        if (!connected) {
            throw new Error('All RPC endpoints failed');
        }
        const bstContract = new ethers.Contract(BST_ADDRESS, BST_ABI, provider);
        
        console.log('📋 Contract Information:');
        console.log('Address:', BST_ADDRESS);
        console.log('Network: Base Mainnet');
        
        // Get basic token info
        const [name, symbol, totalSupply, owner, isPaused] = await Promise.all([
            bstContract.name(),
            bstContract.symbol(),
            bstContract.totalSupply(),
            bstContract.owner(),
            bstContract.paused()
        ]);
        
        console.log('Name:', name);
        console.log('Symbol:', symbol);
        console.log('Total Supply:', ethers.utils.formatEther(totalSupply), 'BST');
        console.log('Owner:', owner);
        console.log();
        
        console.log('🎯 Token Status:');
        if (isPaused) {
            console.log('❌ CONTRACT IS PAUSED - This is why transfers fail!');
            console.log('');
            console.log('🔧 Solution:');
            console.log('- Contract owner needs to call unpause() function');
            console.log('- Owner address:', owner);
            console.log('- Only the owner can unpause the contract');
        } else {
            console.log('✅ CONTRACT IS ACTIVE - Transfers should work');
            console.log('');
            console.log('If transfers still fail, check:');
            console.log('- Sufficient BST balance');
            console.log('- Correct Base network (Chain ID: 8453)');
            console.log('- Enough ETH for gas fees');
        }
        
        console.log('\n📊 BaseScan Link:');
        console.log(`https://basescan.org/address/${BST_ADDRESS}`);
        
    } catch (error) {
        console.error('❌ Error checking BST status:', error.message);
        console.log('\nPossible issues:');
        console.log('- RPC connection problem');
        console.log('- Contract address incorrect');
        console.log('- Network issues');
    }
}

// Run the check
checkBSTStatus();
