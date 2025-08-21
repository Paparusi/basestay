# BaseStay Production Infrastructure Setup

## 📋 **Required Services Checklist**

### 1. Domain Registration (~$50/year)
- **Service**: Namecheap, GoDaddy, or Cloudflare
- **Recommended**: `basestay.io` or `basestay.com`
- **Setup Time**: 5 minutes
- **Priority**: ⭐⭐⭐ (Do First)

### 2. Hosting - Vercel Pro ($20/month)
- **Why Vercel**: Best Next.js integration, automatic deployments
- **Features**: Custom domains, analytics, faster builds
- **Setup Time**: 10 minutes 
- **Priority**: ⭐⭐⭐ (Do First)

### 3. Database - PlanetScale ($29/month)
- **Why PlanetScale**: Serverless MySQL, branches like Git, auto-scaling
- **Migration**: From SQLite to MySQL (I'll help with this)
- **Setup Time**: 20 minutes
- **Priority**: ⭐⭐⭐ (Critical for real users)

### 4. File Storage - Pinata IPFS ($20/month)
- **Why Pinata**: Reliable IPFS pinning, fast CDN
- **Use Case**: Property images, user avatars
- **Setup Time**: 15 minutes
- **Priority**: ⭐⭐ (For image uploads)

### 5. CDN - Cloudflare Pro ($25/month)
- **Why Cloudflare**: Global CDN, DDoS protection, caching
- **Features**: Page Rules, Analytics, Security
- **Setup Time**: 15 minutes
- **Priority**: ⭐⭐ (For performance)

### 6. Web3 APIs - Coinbase Developer Platform ($50/month)
- **Why CDP**: Base network support, reliable RPC
- **Use Case**: Blockchain interactions, wallet connections
- **Setup Time**: 10 minutes
- **Priority**: ⭐⭐⭐ (For Web3 features)

## 💰 **Total Monthly Cost: ~$144/month**

## 🔧 **Setup Process**

### Phase 1: Basic Infrastructure (Day 1)
```bash
1. Buy domain (basestay.io) 
2. Setup Vercel account & connect GitHub
3. Deploy BaseStay to Vercel
4. Configure custom domain
```

### Phase 2: Database Migration (Day 2-3)
```bash
1. Create PlanetScale database
2. Update Prisma schema for MySQL
3. Migrate data from SQLite
4. Update environment variables
```

### Phase 3: File Storage (Day 4)
```bash
1. Setup Pinata account
2. Integrate IPFS upload in codebase
3. Update image handling components
4. Test image uploads
```

### Phase 4: Performance & Security (Day 5)
```bash
1. Setup Cloudflare DNS
2. Configure caching rules
3. Enable security features
4. Setup Coinbase CDP APIs
```

## 🚀 **Alternative Budget Options**

### 💸 **Minimal Budget (~$50/month)**
- **Hosting**: Vercel Hobby (Free) + Domain ($50/year)
- **Database**: Railway PostgreSQL ($5/month)
- **Storage**: Free IPFS gateways (limited)
- **CDN**: Cloudflare Free
- **Web3**: Free RPC limits

### 💰 **Recommended Production (~$150/month)**  
- All services listed above
- Professional reliability
- Better performance & support

### 💎 **Premium Setup (~$300/month)**
- **Database**: PlanetScale Pro ($99/month)
- **Monitoring**: DataDog ($150/month)
- **Security**: Advanced DDoS protection
- **Analytics**: Premium tracking

## ⚡ **Setup Automation Scripts**

I can help you create setup scripts for:
- Environment variables configuration
- Database schema migration
- IPFS integration
- Deployment automation

## 📊 **Expected Performance Improvements**

### Before (Current SQLite + Localhost)
- **Page Load**: 2-3 seconds
- **Search**: 500ms-1s
- **Image Load**: 1-2 seconds
- **Uptime**: Development only

### After (Production Stack)
- **Page Load**: 500ms-1s (Vercel + Cloudflare)
- **Search**: 100-300ms (PlanetScale)  
- **Image Load**: 200-500ms (Pinata + CDN)
- **Uptime**: 99.9%+ (Professional hosting)

## 🔐 **Security Considerations**

### Environment Variables Needed:
```bash
# Database
DATABASE_URL="mysql://..."

# IPFS
PINATA_JWT="..."
PINATA_API_KEY="..."

# Coinbase
NEXT_PUBLIC_CDP_API_KEY="..."

# Domain
NEXT_PUBLIC_BASE_URL="https://basestay.io"
```

## 📈 **ROI Calculation**

### Investment: $150/month = $1,800/year
### Break-even: 60 bookings/month at 5% commission ($50 average)
### Target: 200+ bookings/month = $500+ monthly commission

**Payback period**: 3-4 months with good traction
