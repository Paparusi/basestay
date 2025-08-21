# BaseStay Vercel Deployment Guide

## 🎉 **GitHub Repository Ready!**

### **✅ Repository Information:**
- **URL**: https://github.com/Paparusi/basestay
- **Branch**: main
- **Files**: 92 objects (195.17 KiB)
- **Status**: Successfully pushed

## 🚀 **Step-by-Step Vercel Import**

### **1. Import Project to Vercel:**

#### **In Vercel Dashboard:**
1. **Click "Import Project"** (or "New Project")
2. **Select "Import Git Repository"**
3. **Choose GitHub** as provider
4. **Search for "basestay"** or paste: `Paparusi/basestay`
5. **Click "Import"** next to basestay repository

### **2. Configure Project Settings:**

#### **Project Configuration:**
```
Project Name: basestay
Framework Preset: Next.js (Auto-detected)
Root Directory: ./ (default)
Build Command: npm run build (auto)
Output Directory: .next (auto)
Install Command: npm install (auto)
```

#### **Environment Variables to Add:**
```bash
# Essential for production:
DATABASE_URL = [Will add Railway PostgreSQL URL later]
NEXT_PUBLIC_CDP_API_KEY = 1bc100ff-af09-4d72-a4cf-e9617c6de50a
NEXT_PUBLIC_DOMAIN = basestay.io
NEXT_PUBLIC_APP_URL = https://basestay.io
NEXTAUTH_URL = https://basestay.io
NEXTAUTH_SECRET = [Generate secure secret]

# Base blockchain config:
NEXT_PUBLIC_CHAIN_ID = 8453
NEXT_PUBLIC_BASE_RPC_URL = https://mainnet.base.org

# Smart contract addresses (empty for now):
NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS = 
NEXT_PUBLIC_BOOKING_MANAGER_ADDRESS = 
NEXT_PUBLIC_REVIEW_SYSTEM_ADDRESS = 
```

### **3. Generate Secure NEXTAUTH_SECRET:**

Use this command to generate secure secret:
```bash
# Method 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Method 2: OpenSSL
openssl rand -hex 32

# Method 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

### **4. Deploy Process:**

#### **First Deployment:**
1. **Click "Deploy"** after configuration
2. **Vercel builds** the project (2-5 minutes)
3. **Get preview URL**: `https://basestay-xyz123.vercel.app`
4. **Test functionality** on preview URL

#### **Expected Build Output:**
```
✅ Installing dependencies...
✅ Running build command...
✅ Optimizing pages...
✅ Generating static pages...
✅ Deployment successful!
```

### **5. Upgrade to Vercel Pro:**

#### **Why Pro is Needed:**
- **Custom Domain**: basestay.io support
- **Higher Limits**: Function timeout, bandwidth
- **Priority Support**: Faster support response
- **Analytics**: Advanced performance insights

#### **Upgrade Process:**
1. **Go to Settings** → **General**
2. **Click "Upgrade to Pro"**
3. **Select Pro Plan**: $20/month
4. **Add payment method**
5. **Confirm upgrade**

### **6. Add Custom Domain (After Pro Upgrade):**

#### **Domain Configuration:**
1. **Go to Project Settings** → **Domains**
2. **Add Domain**: `basestay.io`
3. **Add Domain**: `www.basestay.io` (redirect to basestay.io)
4. **Vercel provides DNS records** to add to Cloudflare

#### **DNS Records for Cloudflare:**
```
A Record: basestay.io → 76.76.19.19 (Vercel)
CNAME: www.basestay.io → cname.vercel-dns.com
```

## ⏱️ **Timeline Expectations:**

### **Phase 1: Initial Deployment (Today)**
- **Import & Configure**: 15 minutes
- **First Build**: 5-10 minutes  
- **Test Preview URL**: 10 minutes
- **Upgrade to Pro**: 5 minutes
- **Total**: ~30-40 minutes

### **Phase 2: Custom Domain (After DNS Propagation)**
- **Add basestay.io**: 5 minutes
- **SSL Certificate**: Automatic
- **DNS Configuration**: 10 minutes
- **Testing**: 15 minutes

## 🎯 **Expected Results:**

### **After Phase 1:**
- ✅ **BaseStay live** at preview URL
- ✅ **Automatic deployments** on GitHub push
- ✅ **Professional hosting** with Vercel Pro
- ✅ **Global CDN** for fast loading

### **After Phase 2 (When DNS active):**
- ✅ **https://basestay.io** live
- ✅ **SSL certificate** automatic
- ✅ **Production ready** website
- ✅ **Professional branding**

## 🚨 **Common Issues & Solutions:**

### **Build Errors:**
```
Issue: "Module not found" errors
Solution: Check package.json dependencies

Issue: Environment variables missing  
Solution: Add all required env vars in Vercel dashboard

Issue: Database connection failed
Solution: Use SQLite for now, PostgreSQL later
```

### **Domain Issues:**
```
Issue: Domain not resolving
Solution: Wait for DNS propagation (24-48 hours)

Issue: SSL certificate errors
Solution: Vercel handles automatically, wait a few minutes
```

## 📋 **Pre-Import Checklist:**

### **Before Starting Vercel Import:**
- [x] **GitHub repository** created and pushed
- [ ] **Generate NEXTAUTH_SECRET**
- [ ] **Prepare environment variables**
- [ ] **Credit card ready** for Pro upgrade

### **Ready to Import?**

**Your GitHub repository is ready at:**
`https://github.com/Paparusi/basestay`

**Next action: Go to Vercel dashboard and click "Import Project"!** 🚀
