// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../BST.sol";

contract DeployBST is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy BST token
        BaseStayToken bst = new BaseStayToken();
        
        console.log("BaseStay Token (BST) deployed to:", address(bst));
        console.log("Total Supply:", bst.totalSupply());
        console.log("Deployer Balance:", bst.balanceOf(msg.sender));
        
        vm.stopBroadcast();
    }
}
