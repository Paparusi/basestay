import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying BaseStay Token (BST) to Base Mainnet...");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.001")) {
    console.error("❌ Insufficient balance for deployment!");
    return;
  }
  
  // Deploy BST Token
  console.log("\n📄 Deploying BaseStay Token contract...");
  const BST = await ethers.getContractFactory("BaseStayToken");
  const bst = await BST.deploy();
  await bst.waitForDeployment();
  
  const bstAddress = await bst.getAddress();
  console.log("✅ BaseStay Token deployed to:", bstAddress);
  
  // Verify deployment
  const totalSupply = await bst.totalSupply();
  const ownerBalance = await bst.balanceOf(deployer.address);
  const symbol = await bst.symbol();
  const name = await bst.name();
  
  console.log("\n📊 Token Details:");
  console.log("Name:", name);
  console.log("Symbol:", symbol);
  console.log("Total Supply:", ethers.formatEther(totalSupply), "BST");
  console.log("Owner Balance:", ethers.formatEther(ownerBalance), "BST");
  console.log("Min Host Stake:", ethers.formatEther(await bst.MIN_HOST_STAKE()), "BST");
  
  // Deploy PropertyRegistry
  console.log("\n🏠 Deploying PropertyRegistry contract...");
  const PropertyRegistry = await ethers.getContractFactory("PropertyRegistry");
  const propertyRegistry = await PropertyRegistry.deploy(bstAddress);
  await propertyRegistry.waitForDeployment();
  
  const registryAddress = await propertyRegistry.getAddress();
  console.log("✅ PropertyRegistry deployed to:", registryAddress);
  
  // Authorize PropertyRegistry to use BST token
  console.log("\n🔗 Authorizing PropertyRegistry contract...");
  const authTx = await bst.authorizeContract(registryAddress);
  await authTx.wait();
  console.log("✅ PropertyRegistry authorized to use BST token");
  
  // Save deployment info
  const deploymentInfo = {
    network: "base-mainnet",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      BST_TOKEN: bstAddress,
      PROPERTY_REGISTRY: registryAddress
    },
    tokenDetails: {
      name: name,
      symbol: symbol,
      totalSupply: totalSupply.toString(),
      decimals: 18,
      minHostStake: (await bst.MIN_HOST_STAKE()).toString()
    }
  };
  
  console.log("\n🎯 DEPLOYMENT COMPLETED SUCCESSFULLY!");
  console.log("====================================");
  console.log("BST Token:", bstAddress);
  console.log("PropertyRegistry:", registryAddress);
  console.log("Deployer:", deployer.address);
  console.log("Network: Base Mainnet");
  console.log("====================================");
  
  console.log("\n📝 Environment Variables to Update:");
  console.log(`NEXT_PUBLIC_BST_TOKEN_ADDRESS=${bstAddress}`);
  console.log(`NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS=${registryAddress}`);
  
  console.log("\n✨ BaseStay Token ecosystem is now live on Base!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
