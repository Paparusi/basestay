require('dotenv').config({ path: '.env.local' });
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const solc = require('solc');

async function compileContract() {
    console.log('🔧 Compiling BST Contract...');
    
    const contractPath = path.join(__dirname, '../contracts/BST.sol');
    const source = fs.readFileSync(contractPath, 'utf8');
    
    // Tạo input cho solc compiler
    const input = {
        language: 'Solidity',
        sources: {
            'BST.sol': {
                content: source
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };
    
    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    
    if (output.errors) {
        output.errors.forEach(error => {
            console.log('⚠️  Compilation warning/error:', error.message);
        });
    }
    
    const contract = output.contracts['BST.sol']['BaseStayToken'];
    return {
        abi: contract.abi,
        bytecode: contract.evm.bytecode.object
    };
}

async function deployBSTToken() {
    try {
        console.log('🚀 Starting BST Token Deployment...');
        console.log('=====================================');
        
        // Khởi tạo provider và wallet
        const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        console.log(`💼 Deployer Address: ${wallet.address}`);
        
        // Kiểm tra balance
        const balance = await wallet.getBalance();
        console.log(`💰 Balance: ${ethers.utils.formatEther(balance)} ETH`);
        
        if (balance.lt(ethers.utils.parseEther('0.01'))) {
            console.log('❌ Insufficient balance for deployment');
            return;
        }
        
        // Compile contract
        const { abi, bytecode } = await compileContract();
        console.log('✅ Contract compiled successfully');
        
        // Tạo contract factory
        const ContractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
        
        console.log('� Deploying BST Token...');
        console.log('⏳ Please wait, this may take a few minutes...');
        
        // Deploy contract
        const contract = await ContractFactory.deploy();
        await contract.deployTransaction.wait();
        
        console.log('🎉 BST Token deployed successfully!');
        console.log(`📍 Contract Address: ${contract.address}`);
        console.log(`🔍 View on BaseScan: https://basescan.org/address/${contract.address}`);
        
        // Lưu contract address vào file
        const envPath = path.join(__dirname, '../.env.local');
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        if (envContent.includes('NEXT_PUBLIC_BST_TOKEN_ADDRESS=')) {
            envContent = envContent.replace(/NEXT_PUBLIC_BST_TOKEN_ADDRESS=.*/g, `NEXT_PUBLIC_BST_TOKEN_ADDRESS=${contract.address}`);
        } else {
            envContent += `\nNEXT_PUBLIC_BST_TOKEN_ADDRESS=${contract.address}`;
        }
        
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Contract address saved to .env.local');
        
        // Kiểm tra contract deployment
        const totalSupply = await contract.totalSupply();
        console.log(`📊 Total Supply: ${ethers.utils.formatEther(totalSupply)} BST`);
        
        const name = await contract.name();
        const symbol = await contract.symbol();
        console.log(`🏷️  Token: ${name} (${symbol})`);
        
        console.log('');
        console.log('🎯 NEXT STEPS:');
        console.log('1. Deploy PropertyRegistry contract');
        console.log('2. Update frontend with BST token features');
        console.log('3. Test BST functionality');
        console.log('4. Deploy to Vercel production');
        
        return contract.address;
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        throw error;
    }
}

deployBSTToken().catch(console.error);
