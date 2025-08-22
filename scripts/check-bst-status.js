// Script to unpause BST token if needed
const ethers = require('ethers');

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
        "name": "unpause",
        "outputs": [],
        "stateMutability": "nonpayable", 
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    }
];

async function checkAndUnpauseBST() {
    // Connect to Base mainnet
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    
    // You need to add your private key here (the owner of the BST contract)
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        throw new Error('PRIVATE_KEY environment variable not set');
    }
    
    const wallet = new ethers.Wallet(privateKey, provider);
    const bstContract = new ethers.Contract(BST_ADDRESS, BST_ABI, wallet);
    
    try {
        // Check if paused
        const isPaused = await bstContract.paused();
        console.log('BST Token Paused Status:', isPaused);
        
        if (isPaused) {
            console.log('Token is paused. Attempting to unpause...');
            
            // Check if we're the owner
            const owner = await bstContract.owner();
            const signerAddress = await wallet.getAddress();
            
            console.log('Contract Owner:', owner);
            console.log('Signer Address:', signerAddress);
            
            if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
                throw new Error('Not the contract owner. Cannot unpause.');
            }
            
            // Unpause the contract
            const tx = await bstContract.unpause();
            console.log('Unpause transaction sent:', tx.hash);
            
            await tx.wait();
            console.log('✅ BST Token successfully unpaused!');
            
            // Verify
            const isStillPaused = await bstContract.paused();
            console.log('Final Paused Status:', isStillPaused);
            
        } else {
            console.log('✅ BST Token is already unpaused and working normally.');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run the check
checkAndUnpauseBST();
