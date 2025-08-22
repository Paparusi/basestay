const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

async function verifyBSTToken() {
  console.log('🔍 Verifying BST Token Contract');
  console.log('===============================');

  const contractAddress = '0x8fDc3a7c612bc637B5659526B29Ee233e291F371';
  const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');

  // Simple ABI for verification
  const abi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)", 
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function owner() view returns (address)",
    "function MIN_HOST_STAKE() view returns (uint256)"
  ];

  try {
    const contract = new ethers.Contract(contractAddress, abi, provider);

    console.log('📊 BST Token Information:');
    console.log(`Contract Address: ${contractAddress}`);
    
    const name = await contract.name();
    const symbol = await contract.symbol();
    const decimals = await contract.decimals();
    const totalSupply = await contract.totalSupply();
    const owner = await contract.owner();
    const minHostStake = await contract.MIN_HOST_STAKE();

    console.log(`Name: ${name}`);
    console.log(`Symbol: ${symbol}`);
    console.log(`Decimals: ${decimals}`);
    console.log(`Total Supply: ${ethers.utils.formatEther(totalSupply)} BST`);
    console.log(`Owner: ${owner}`);
    console.log(`Min Host Stake: ${ethers.utils.formatEther(minHostStake)} BST`);

    // Check owner balance
    const ownerBalance = await contract.balanceOf(owner);
    console.log(`Owner Balance: ${ethers.utils.formatEther(ownerBalance)} BST`);

    console.log('');
    console.log('🎯 MetaMask Add Token Info:');
    console.log('===========================');
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Token Symbol: ${symbol}`);
    console.log(`Decimals: ${decimals}`);
    console.log(`Network: Base Mainnet (Chain ID: 8453)`);
    console.log('');
    console.log('🔗 BaseScan: https://basescan.org/address/' + contractAddress);

  } catch (error) {
    console.error('❌ Error verifying contract:', error.message);
  }
}

verifyBSTToken();
