// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/PropertyRegistry.sol";
import "../src/BookingManager.sol";
import "../src/ReviewSystem.sol";

contract DeployBaseStay is Script {
    // Base Mainnet USDC address
    address constant BASE_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("Deploying BaseStay contracts to Base Mainnet...");
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        
        // Deploy PropertyRegistry
        PropertyRegistry propertyRegistry = new PropertyRegistry();
        console.log("PropertyRegistry deployed at:", address(propertyRegistry));
        
        // Deploy BookingManager
        BookingManager bookingManager = new BookingManager(
            address(propertyRegistry),
            BASE_USDC
        );
        console.log("BookingManager deployed at:", address(bookingManager));
        
        // Deploy ReviewSystem
        ReviewSystem reviewSystem = new ReviewSystem(address(bookingManager));
        console.log("ReviewSystem deployed at:", address(reviewSystem));
        
        vm.stopBroadcast();
        
        console.log("\n=== Deployment Summary ===");
        console.log("Network: Base Mainnet (Chain ID: 8453)");
        console.log("PropertyRegistry:", address(propertyRegistry));
        console.log("BookingManager:", address(bookingManager));
        console.log("ReviewSystem:", address(reviewSystem));
        console.log("USDC Token:", BASE_USDC);
        
        console.log("\n=== Next Steps ===");
        console.log("1. Update your .env file with deployed contract addresses");
        console.log("2. Verify contracts on BaseScan");
        console.log("3. Update frontend configuration");
    }
}
