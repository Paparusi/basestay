# BaseStay Web3 APIs Requirements

## 🎯 **Core Web3 APIs Needed**

### 1. 💰 **Coinbase Developer Platform (CDP) - $50/month**
```typescript
// Current usage in BaseStay:
export const ONCHAINKIT_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_CDP_API_KEY || '',
  chain: baseChain,
}
```

**What it provides:**
- **Base RPC Access**: Reliable blockchain node connectivity
- **OnchainKit Components**: Pre-built Web3 UI components
- **Transaction APIs**: Send/receive USDC payments
- **Wallet Integration**: Connect wallets seamlessly
- **Rate Limits**: 100,000 requests/month (enough for MVP)

**Cost**: Free tier available, $50/month for production

### 2. 🌐 **Base Network RPC - FREE/Paid**
```typescript
// Current configuration:
export const baseChain = {
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org']
    }
  }
}
```

**What it provides:**
- **Blockchain Queries**: Read smart contract data
- **Transaction Broadcasting**: Send blockchain transactions
- **Event Listening**: Monitor contract events
- **Block Data**: Get latest blockchain state

**Options:**
- **Free Public RPC**: https://mainnet.base.org (rate limited)
- **Alchemy**: $99/month (reliable, fast)
- **QuickNode**: $49/month (good performance)
- **Coinbase Cloud**: Included with CDP

### 3. 🔑 **WalletConnect Project ID - FREE**
```typescript
// For wallet connection support
const wagmiConfig = createConfig({
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
})
```

**What it provides:**
- **Multi-Wallet Support**: MetaMask, Coinbase Wallet, etc.
- **QR Code Connection**: Mobile wallet linking
- **Session Management**: Persistent connections
- **Cross-Platform**: Works on all devices

**Cost**: Free for basic usage, $99/month for advanced analytics

## 💡 **Smart Contract APIs (Your Own Contracts)**

### 1. **PropertyRegistry Contract**
```solidity
// Functions you'll call via API:
- mintProperty(address owner, string tokenURI) 
- getProperty(uint256 tokenId)
- updateProperty(uint256 tokenId, string newURI)
- transferProperty(address from, address to, uint256 tokenId)
```

### 2. **BookingManager Contract** 
```solidity
// Booking-related APIs:
- createBooking(uint256 propertyId, uint256 startDate, uint256 endDate)
- confirmBooking(uint256 bookingId) 
- cancelBooking(uint256 bookingId)
- processPayment(uint256 bookingId, uint256 amount)
```

### 3. **ReviewSystem Contract**
```solidity
// Review APIs:
- submitReview(uint256 bookingId, uint8 rating, string review)
- getReviews(uint256 propertyId)
- calculateAverageRating(uint256 propertyId)
```

## 🛠️ **Required API Integrations**

### **Blockchain Data APIs:**
```typescript
// Read contract data
const contract = new ethers.Contract(address, abi, provider)
const properties = await contract.getAllProperties()

// Listen to events
contract.on('PropertyBooked', (propertyId, guest, startDate) => {
  // Update UI, send notifications
})

// Send transactions
const tx = await contract.createBooking(propertyId, dates, { value: price })
```

### **USDC Payment APIs:**
```typescript
// Check USDC balance
const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider)
const balance = await usdcContract.balanceOf(userAddress)

// Transfer USDC
const tx = await usdcContract.transfer(recipientAddress, amount)
```

## 📊 **API Usage Patterns in BaseStay**

### **User Registration Flow:**
1. **WalletConnect API**: Connect user wallet
2. **CDP API**: Sign-in with wallet signature  
3. **Your Database**: Store user profile
4. **Base RPC**: Verify wallet ownership

### **Property Listing Flow:**
1. **IPFS API**: Upload property images
2. **PropertyRegistry API**: Mint property NFT
3. **Base RPC**: Broadcast transaction
4. **Your Database**: Cache property metadata

### **Booking Flow:**
1. **USDC API**: Check user balance
2. **BookingManager API**: Create booking
3. **USDC API**: Transfer payment
4. **Base RPC**: Confirm transactions
5. **Your Database**: Update booking status

### **Search Flow:**
1. **Your Database**: Fast text search
2. **Base RPC**: Verify property ownership
3. **IPFS API**: Load property images
4. **Cache**: Store results for performance

## 💰 **Cost Breakdown by API Usage**

### **Light Usage (0-1000 users/month):**
- **CDP**: Free tier (10k requests/month)
- **WalletConnect**: Free
- **Base RPC**: Free public endpoint
- **Total**: $0/month

### **Medium Usage (1000-10000 users/month):**
- **CDP**: $50/month (100k requests)  
- **WalletConnect**: Free
- **Base RPC**: $49/month (QuickNode)
- **Total**: $99/month

### **Heavy Usage (10000+ users/month):**
- **CDP**: $200/month (500k requests)
- **WalletConnect**: $99/month (analytics)
- **Base RPC**: $199/month (Alchemy Growth)
- **IPFS**: $80/month (Pinata)
- **Total**: $578/month

## 🚀 **Setup Priority Order**

### **Phase 1: Essential (Launch)**
1. ✅ **WalletConnect Project ID** - Free, quick setup
2. ✅ **CDP API Key** - Start with free tier
3. ✅ **Base RPC** - Use free public endpoint initially

### **Phase 2: Scale (Growth)**
4. **Paid RPC Provider** - Better reliability
5. **IPFS Service** - Professional image hosting
6. **Advanced Analytics** - WalletConnect Pro

### **Phase 3: Enterprise (Mature)**
7. **Custom Infrastructure** - Your own nodes
8. **Multi-chain Support** - Ethereum, Polygon
9. **Enterprise Support** - Dedicated account managers

## 🔧 **Environment Variables Needed**

```bash
# Required for BaseStay production:
NEXT_PUBLIC_CDP_API_KEY="cdp_..."
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID="wallet_connect_..."
NEXT_PUBLIC_BASE_RPC_URL="https://base-mainnet.g.alchemy.com/v2/..."

# Optional for advanced features:
NEXT_PUBLIC_ALCHEMY_API_KEY="alch_..."
PINATA_JWT="eyJ..."
ETHERSCAN_API_KEY="..."
```

## ⚠️ **Important Notes**

### **Free Tier Limitations:**
- **Public RPC**: Rate limited, can be slow during high traffic
- **CDP Free**: 10k requests/month (≈330 requests/day)
- **No SLA**: No guaranteed uptime

### **Production Considerations:**
- **Redundancy**: Use multiple RPC providers
- **Caching**: Cache blockchain data aggressively  
- **Error Handling**: Graceful degradation when APIs fail
- **Monitoring**: Track API usage and costs

### **Security Best Practices:**
- **API Keys**: Never expose secret keys in frontend
- **Rate Limiting**: Implement client-side rate limiting
- **Validation**: Always validate blockchain data
- **Backup Plans**: Have fallback providers ready
