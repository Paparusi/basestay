const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

async function main() {
  console.log('🚀 BaseStay Token (BST) Deployment Guide');
  console.log('=====================================');
  
  // Setup provider and wallet
  const provider = new ethers.providers.JsonRpcProvider(process.env.BASE_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log('💼 Deployer Address:', wallet.address);
  
  // Check balance
  const balance = await wallet.getBalance();
  console.log('💰 Balance:', ethers.utils.formatEther(balance), 'ETH');
  console.log('🌐 Network: Base Mainnet (Chain ID: 8453)');
  
  if (balance.lt(ethers.utils.parseEther('0.001'))) {
    console.log('⚠️  Low balance warning: Consider adding more ETH for gas fees');
  } else {
    console.log('✅ Sufficient balance for deployment');
  }
  
  // Network verification
  const network = await provider.getNetwork();
  console.log('🔗 Connected Network:', network.name, '- Chain ID:', network.chainId);
  
  if (network.chainId !== 8453) {
    console.log('❌ Wrong network! Please connect to Base Mainnet (Chain ID: 8453)');
    return;
  }
  
  console.log('\n🎯 DEPLOYMENT INSTRUCTIONS:');
  console.log('============================');
  console.log('Option 1: Remix IDE (Recommended)');
  console.log('1. 🌐 Open https://remix.ethereum.org');
  console.log('2. 📁 Create new file: BST.sol');
  console.log('3. 📋 Copy contract from: d:\\BaseStay\\contracts\\BST.sol');
  console.log('4. ⚙️  Set compiler to Solidity 0.8.19');
  console.log('5. 🔌 Connect to "Injected Provider - MetaMask"');
  console.log('6. 🦊 Add Base network to MetaMask:');
  console.log('   - Network Name: Base');
  console.log('   - RPC URL: https://mainnet.base.org');
  console.log('   - Chain ID: 8453');
  console.log('   - Currency: ETH');
  console.log('   - Explorer: https://basescan.org');
  console.log('7. 🔐 Import wallet to MetaMask using private key');
  console.log('8. 🚀 Deploy BaseStayToken contract');
  console.log('9. 📋 Copy deployed address');
  
  console.log('\n📊 TOKEN SPECIFICATIONS:');
  console.log('========================');
  console.log('Name: BaseStay Token');
  console.log('Symbol: BST'); 
  console.log('Total Supply: 10,000,000,000 BST');
  console.log('Decimals: 18');
  console.log('Min Host Stake: 1,000 BST');
  
  console.log('\n🔐 WALLET INFORMATION:');
  console.log('======================');
  console.log('Address:', wallet.address);
  console.log('Balance:', ethers.utils.formatEther(balance), 'ETH');
  console.log('Private Key: [CONFIGURED IN .env.local]');
  
  console.log('\n📝 POST-DEPLOYMENT:');
  console.log('==================');
  console.log('1. Update NEXT_PUBLIC_BST_TOKEN_ADDRESS in .env.local');
  console.log('2. Deploy PropertyRegistry contract (link to BST token)');
  console.log('3. Update frontend environment variables');
  console.log('4. Deploy to Vercel production');
  console.log('5. Test BST functionality on live site');
  
  console.log('\n✅ Ready for deployment!');
  console.log('Use the instructions above to deploy BST token.');
}

main()
  .then(() => {
    console.log('\n🎉 Deployment guide completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
