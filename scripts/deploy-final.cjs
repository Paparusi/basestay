require('dotenv').config({ path: '.env.local' });
const { ethers } = require('ethers');
const solc = require('solc');
const fs = require('fs');
const path = require('path');

function findImports(importPath) {
    try {
        if (importPath.startsWith('@openzeppelin/')) {
            const contractPath = path.join(__dirname, '../node_modules', importPath);
            const source = fs.readFileSync(contractPath, 'utf8');
            return { contents: source };
        }
        return { error: 'File not found' };
    } catch (error) {
        return { error: 'File not found' };
    }
}

async function compileAndDeploy() {
    try {
        console.log('🚀 BaseStay Token (BST) Deployment - SIMPLE VERSION');
        console.log('====================================================');
        
        // Read simple contract
        const contractPath = path.join(__dirname, '../contracts/SimpleBaseStayToken.sol');
        const source = fs.readFileSync(contractPath, 'utf8');
        
        console.log('🔧 Compiling SimpleBaseStayToken...');
        
        // Create solc input
        const input = {
            language: 'Solidity',
            sources: {
                'SimpleBaseStayToken.sol': {
                    content: source
                }
            },
            settings: {
                outputSelection: {
                    '*': {
                        '*': ['*']
                    }
                },
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        };
        
        const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
        
        if (output.errors) {
            const hasErrors = output.errors.some(error => error.severity === 'error');
            if (hasErrors) {
                console.log('❌ Compilation errors:');
                output.errors.forEach(error => {
                    if (error.severity === 'error') {
                        console.log('  -', error.message);
                    }
                });
                return;
            }
        }
        
        const contract = output.contracts['SimpleBaseStayToken.sol']['BaseStayToken'];
        if (!contract) {
            console.log('❌ Contract not found in compilation output');
            return;
        }
        
        console.log('✅ Contract compiled successfully');
        console.log(`📏 Bytecode size: ${contract.evm.bytecode.object.length / 2} bytes`);
        
        // Initialize provider and wallet
        const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        console.log(`💼 Deployer: ${wallet.address}`);
        
        // Check balance
        const balance = await provider.getBalance(wallet.address);
        console.log(`💰 Balance: ${ethers.utils.formatEther(balance)} ETH`);
        
        if (balance.lt(ethers.utils.parseEther('0.002'))) {
            console.error('❌ Insufficient balance for deployment');
            return;
        }
        
        // Get network info
        const network = await provider.getNetwork();
        console.log(`🌐 Network: Base Mainnet (Chain ID: ${network.chainId})`);
        
        if (network.chainId !== 8453) {
            console.error('❌ Wrong network! Expected Base mainnet (8453)');
            return;
        }
        
        console.log('');
        console.log('📄 BST Token Details:');
        console.log('Name: BaseStay Token');
        console.log('Symbol: BST');
        console.log('Total Supply: 10,000,000,000 BST');
        console.log('Decimals: 18');
        console.log('Min Host Stake: 1,000 BST');
        
        // Create contract factory
        const contractFactory = new ethers.ContractFactory(
            contract.abi,
            contract.evm.bytecode.object,
            wallet
        );
        
        console.log('');
        console.log('⛽ Estimating gas...');
        
        // Estimate gas
        const deployTx = contractFactory.getDeployTransaction();
        const gasEstimate = await provider.estimateGas(deployTx);
        console.log(`Gas estimate: ${gasEstimate.toString()}`);
        
        // Get gas price
        const gasPrice = await provider.getGasPrice();
        const estimatedCost = gasPrice.mul(gasEstimate);
        console.log(`💸 Estimated cost: ${ethers.utils.formatEther(estimatedCost)} ETH`);
        
        if (balance.lt(estimatedCost.mul(120).div(100))) {
            console.error('❌ Insufficient balance for deployment with gas fees');
            return;
        }
        
        console.log('');
        console.log('🚀 Deploying BST Token...');
        console.log('⏳ Please wait...');
        
        // Deploy contract
        const deployedContract = await contractFactory.deploy({
            gasLimit: gasEstimate.mul(110).div(100),
            gasPrice: gasPrice.mul(110).div(100)
        });
        
        console.log(`📦 Transaction sent: ${deployedContract.deployTransaction.hash}`);
        console.log('⏳ Waiting for confirmation...');
        
        // Wait for deployment
        await deployedContract.deployTransaction.wait();
        
        console.log('');
        console.log('🎉 BST TOKEN DEPLOYED SUCCESSFULLY!');
        console.log('===================================');
        console.log(`📍 Contract Address: ${deployedContract.address}`);
        console.log(`🔍 BaseScan: https://basescan.org/address/${deployedContract.address}`);
        console.log(`📦 Transaction: https://basescan.org/tx/${deployedContract.deployTransaction.hash}`);
        
        // Test contract functions
        console.log('');
        console.log('🧪 Testing deployed contract...');
        
        const name = await deployedContract.name();
        const symbol = await deployedContract.symbol();
        const totalSupply = await deployedContract.totalSupply();
        const decimals = await deployedContract.decimals();
        const owner = await deployedContract.owner();
        const minHostStake = await deployedContract.MIN_HOST_STAKE();
        const ownerBalance = await deployedContract.balanceOf(wallet.address);
        
        console.log(`📊 Name: ${name}`);
        console.log(`🏷️  Symbol: ${symbol}`);
        console.log(`🔢 Decimals: ${decimals}`);
        console.log(`💎 Total Supply: ${ethers.utils.formatEther(totalSupply)} BST`);
        console.log(`👑 Owner: ${owner}`);
        console.log(`⭐ Min Host Stake: ${ethers.utils.formatEther(minHostStake)} BST`);
        console.log(`💰 Owner Balance: ${ethers.utils.formatEther(ownerBalance)} BST`);
        
        // Update .env.local
        console.log('');
        console.log('📝 Updating environment variables...');
        
        const envPath = path.join(__dirname, '../.env.local');
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        if (envContent.includes('NEXT_PUBLIC_BST_TOKEN_ADDRESS=')) {
            envContent = envContent.replace(
                /NEXT_PUBLIC_BST_TOKEN_ADDRESS=.*/g,
                `NEXT_PUBLIC_BST_TOKEN_ADDRESS=${deployedContract.address}`
            );
        } else {
            envContent += `\nNEXT_PUBLIC_BST_TOKEN_ADDRESS=${deployedContract.address}`;
        }
        
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Environment variables updated');
        
        // Save deployment info
        const deploymentInfo = {
            contractAddress: deployedContract.address,
            transactionHash: deployedContract.deployTransaction.hash,
            network: 'Base Mainnet',
            chainId: network.chainId,
            deployer: wallet.address,
            blockNumber: deployedContract.deployTransaction.blockNumber,
            gasUsed: gasEstimate.toString(),
            timestamp: new Date().toISOString(),
            tokenDetails: {
                name: name,
                symbol: symbol,
                totalSupply: totalSupply.toString(),
                decimals: decimals,
                minHostStake: minHostStake.toString()
            }
        };
        
        fs.writeFileSync(
            path.join(__dirname, '../deployment-info.json'),
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log('');
        console.log('🎯 DEPLOYMENT COMPLETED SUCCESSFULLY!');
        console.log('=====================================');
        console.log('🎉 BaseStay Token is now live on Base mainnet!');
        console.log('');
        console.log('📋 Summary:');
        console.log(`✅ Contract Address: ${deployedContract.address}`);
        console.log(`✅ Network: Base Mainnet (${network.chainId})`);
        console.log(`✅ Total Supply: 10,000,000,000 BST`);
        console.log(`✅ Owner: ${wallet.address}`);
        console.log(`✅ Transaction: ${deployedContract.deployTransaction.hash}`);
        console.log('');
        console.log('🚀 Next Steps:');
        console.log('1. ✅ BST Token deployed successfully');
        console.log('2. 🔄 Restart development server: npm run dev');
        console.log('3. 🧪 Test BST functionality on website');
        console.log('4. 📋 Verify contract on BaseScan');
        console.log('5. 🌐 Update production deployment');
        console.log('6. 🎊 Announce BST token launch!');
        
        return deployedContract.address;
        
    } catch (error) {
        console.error('');
        console.error('❌ DEPLOYMENT FAILED!');
        console.error('====================');
        console.error('Error:', error.message);
        
        if (error.transaction) {
            console.error('Transaction Hash:', error.transaction.hash);
        }
        
        throw error;
    }
}

// Run deployment
compileAndDeploy()
    .then((address) => {
        console.log(`\n🎊 SUCCESS! BST Token deployed at: ${address}`);
        console.log('🚀 BaseStay Token ecosystem is now live!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Deployment failed:', error.message);
        process.exit(1);
    });
