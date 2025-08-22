🚀 BST TOKEN DEPLOYMENT GUIDE
============================

⚠️  AUTOMATIC DEPLOYMENT FAILED - BYTECODE COMPATIBILITY ISSUE
Bytecode không tương thích với Base network. 

📋 MANUAL DEPLOYMENT VIA REMIX IDE:
===================================

1. 🌐 Mở Remix IDE: https://remix.ethereum.org

2. 📁 Tạo file BST.sol và copy contract từ: d:\BaseStay\contracts\BST.sol

3. ⚙️  Compiler Settings:
   - Solidity version: 0.8.19
   - EVM version: London hoặc auto
   - Optimization: Enabled (200 runs)

4. 🔌 Connect MetaMask:
   - Add Base network to MetaMask:
     * Network Name: Base
     * RPC URL: https://mainnet.base.org  
     * Chain ID: 8453
     * Currency: ETH
     * Block Explorer: https://basescan.org

5. 🔐 Import Wallet:
   - Private Key: [ĐÃ CÓ TRONG .env.local]
   - Address: 0xAa5D40d90C119F3C3cB8C9eD24e49573CbaF9A20
   - Balance: 0.040279212495110504 ETH

6. 🚀 Deploy Contract:
   - Select "Injected Provider - MetaMask"
   - Choose BaseStayToken contract
   - Click Deploy (no constructor parameters needed)
   - Confirm transaction in MetaMask

7. ✅ Post-deployment:
   - Copy contract address
   - Update .env.local with NEXT_PUBLIC_BST_TOKEN_ADDRESS
   - Verify on BaseScan

💡 CONTRACT FEATURES:
===================
- Name: BaseStay Token
- Symbol: BST  
- Total Supply: 10,000,000,000 BST (10 billion)
- Decimals: 18
- Min Host Stake: 1,000 BST
- Full ERC-20 compliance
- Staking & reward system
- Platform fee discounts
- Property visibility boost

🔗 USEFUL LINKS:
===============
- Remix IDE: https://remix.ethereum.org
- BaseScan: https://basescan.org
- Base RPC: https://mainnet.base.org
- MetaMask: https://metamask.io

Bạn có thể deploy ngay bây giờ bằng cách làm theo hướng dẫn trên! 🚀
