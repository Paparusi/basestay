const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

async function checkContractOwnership() {
    console.log('🔍 Checking Contract Ownership');
    console.log('===============================');

    const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
    
    // Contract addresses from .env.production
    const contracts = {
        'BST Token': '0x8fDc3a7c612bc637B5659526B29Ee233e291F371',
        'PropertyRegistry': '0x1CBE968d60aeaabfe3E11C2c3C3fBAe74193d708', 
        'BookingManager': '0x07314d16678595162fC55e02Df28e36839a81b74',
        'ReviewSystem': '0x529B251FE5B4d38a9F31199F201F57b0002bA965'
    };

    // Your deployed wallet address
    const deployerAddress = process.env.DEPLOYER_ADDRESS || 'YOUR_WALLET_ADDRESS';

    const ownerABI = [
        "function owner() view returns (address)"
    ];

    console.log(`🏠 Checking ownership for deployer: ${deployerAddress}\n`);

    for (const [name, address] of Object.entries(contracts)) {
        try {
            const contract = new ethers.Contract(address, ownerABI, provider);
            const owner = await contract.owner();
            
            const isOwner = owner.toLowerCase() === deployerAddress.toLowerCase();
            
            console.log(`📋 ${name}:`);
            console.log(`   Address: ${address}`);
            console.log(`   Owner: ${owner}`);
            console.log(`   You are owner: ${isOwner ? '✅ YES' : '❌ NO'}`);
            console.log('');
        } catch (error) {
            console.log(`📋 ${name}:`);
            console.log(`   Address: ${address}`);
            console.log(`   Status: ❌ Cannot check (contract may not have owner function)`);
            console.log('');
        }
    }

    // Check BST balance in PropertyRegistry
    const bstABI = [
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)"
    ];

    try {
        const bstContract = new ethers.Contract(contracts['BST Token'], bstABI, provider);
        const balance = await bstContract.balanceOf(contracts['PropertyRegistry']);
        const decimals = await bstContract.decimals();
        
        console.log('💰 BST Staked in PropertyRegistry:');
        console.log(`   Amount: ${ethers.utils.formatUnits(balance, decimals)} BST`);
        console.log(`   Raw: ${balance.toString()}`);
    } catch (error) {
        console.log('❌ Could not check BST balance in PropertyRegistry');
    }
}

checkContractOwnership().catch(console.error);
