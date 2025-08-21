# BaseStay Vercel Pro Setup Guide

## 🚀 **STEP 2: Vercel Pro Setup (While DNS Propagating)**

### **Why Setup Now:**
- DNS propagation takes 24-48 hours
- Can prepare hosting infrastructure  
- Test deployment before connecting custom domain
- Get familiar with Vercel dashboard

## 📋 **Vercel Pro Setup Process**

### **Step 1: Create Vercel Account**

#### **Sign Up Process:**
1. **Go to**: https://vercel.com
2. **Click "Sign Up"**
3. **Choose**: "Continue with GitHub" (recommended)
   - Connects directly to BaseStay repository
   - Auto-deploy on code changes
   - Easier project management

#### **GitHub Integration Benefits:**
- ✅ **Auto-deploy**: Push to main branch → auto deploy
- ✅ **Preview deployments**: Every PR gets preview URL
- ✅ **Environment sync**: Manage secrets securely
- ✅ **Team collaboration**: Share deployments easily

### **Step 2: Import BaseStay Project**

#### **Import Process:**
1. **In Vercel Dashboard**: Click "Add New..." → "Project"
2. **Import Git Repository**: Select BaseStay repository
3. **Configure Project**:
   ```
   Framework Preset: Next.js (auto-detected)
   Root Directory: ./ (default)
   Build Command: npm run build (auto)
   Output Directory: .next (auto)
   Install Command: npm install (auto)
   ```

#### **Environment Variables Setup:**
```bash
# Copy these from .env.local to Vercel:
DATABASE_URL=file:./dev.db
NEXT_PUBLIC_CDP_API_KEY=1bc100ff-af09-4d72-a4cf-e9617c6de50a
NEXT_PUBLIC_DOMAIN=basestay.io
NEXT_PUBLIC_APP_URL=https://basestay.io
NEXTAUTH_URL=https://basestay.io
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### **Step 3: First Deployment**

#### **Deploy Process:**
1. **Click "Deploy"** after configuration
2. **Wait for build** (2-3 minutes first time)  
3. **Get deployment URL**: https://basestay-xxx.vercel.app
4. **Test functionality**: Browse deployed site

#### **Expected Results:**
```
✅ Build successful
✅ BaseStay homepage loads
✅ Search functionality works
✅ Database queries working
✅ Web3 components loaded
✅ Professional URL ready
```

### **Step 4: Upgrade to Pro Plan**

#### **Why Upgrade to Pro:**
- **Custom Domains**: Required for basestay.io
- **More Build Time**: Faster deployments
- **Team Features**: Collaboration tools
- **Analytics**: Performance insights
- **Priority Support**: Faster help

#### **Upgrade Process:**
1. **Go to**: Settings → Usage → Upgrade
2. **Select**: Pro plan ($20/month)
3. **Payment**: Add payment method
4. **Confirm**: Upgrade account

### **Step 5: Prepare Custom Domain (Ready for DNS)**

#### **Domain Configuration (Don't Apply Yet):**
1. **Go to**: Project Settings → Domains
2. **Add Domain**: basestay.io
3. **Documentation**: Read custom domain setup
4. **DNS Records**: Note required records for later

#### **DNS Records Vercel Will Need:**
```
A Record: basestay.io → 76.76.19.19
CNAME: www.basestay.io → cname.vercel-dns.com

Or (Alternative):
CNAME: basestay.io → cname.vercel-dns.com
CNAME: www.basestay.io → cname.vercel-dns.com
```

## 🗄️ **STEP 3: Database Migration Planning**

## 🔄 **Database Migration: SQLite → PostgreSQL**

### **Why Migrate Database:**
- **Scalability**: SQLite limited to single user
- **Production Ready**: PostgreSQL handles concurrent users
- **Web Hosting**: Most platforms don't support SQLite files
- **Reliability**: Better backup and recovery options

### **Database Provider Options:**

#### **Option 1: Railway (Recommended)** ⭐⭐⭐⭐⭐
```
Cost: $5/month starter → $20/month pro
Features:
✅ PostgreSQL included
✅ Easy setup and migration
✅ Good performance
✅ Built-in backups
✅ Connection from anywhere
✅ Web dashboard for management

Setup Process:
1. Sign up railway.app
2. Create PostgreSQL database
3. Get connection string
4. Update DATABASE_URL in Vercel
5. Run migration commands
```

#### **Option 2: Supabase** ⭐⭐⭐⭐
```
Cost: FREE → $25/month pro
Features:
✅ PostgreSQL + Auth + APIs
✅ Real-time subscriptions
✅ Built-in admin panel
✅ Good free tier

Setup Process:
1. Sign up supabase.com
2. Create new project
3. Get database URL
4. Configure BaseStay connection
```

#### **Option 3: PlanetScale** ⭐⭐⭐⭐
```
Cost: FREE → $29/month
Features:
✅ MySQL (not PostgreSQL)
✅ Branching like Git
✅ Excellent performance
✅ Built for scale

Note: Would require changing Prisma schema to MySQL
```

### **Migration Process (Railway):**

#### **Step 1: Setup Railway Database**
```bash
1. Sign up: railway.app
2. Create new project
3. Add PostgreSQL service
4. Copy connection string
```

#### **Step 2: Update Environment Variables**
```bash
# Update in both .env.local and Vercel:
DATABASE_URL="postgresql://username:password@hostname:port/database"
```

#### **Step 3: Run Migration**
```bash
# In local development:
npx prisma migrate deploy
npx prisma db seed (if you have seed data)

# Test connection:
npx prisma studio
```

#### **Step 4: Verify Data**
```bash
# Check tables created:
- User table
- Property table  
- Booking table
- Review table
- Message table
- SearchIndex table
```

## 🔐 **STEP 4: Security & Environment Setup**

### **Generate Secure Secrets:**

#### **NextAuth Secret Generation:**
```bash
# Run in terminal to generate secure secret:
openssl rand -base64 32

# Or use online generator:
# https://generate-secret.vercel.app/32

# Update both .env.local and Vercel:
NEXTAUTH_SECRET=your-generated-secret-here
```

#### **Additional Security Variables:**
```bash
# Add these to Vercel environment:
NODE_ENV=production
NEXTAUTH_URL=https://basestay.io
NEXT_PUBLIC_APP_URL=https://basestay.io
NEXT_PUBLIC_DOMAIN=basestay.io
```

### **Environment Variable Management:**

#### **Development (.env.local):**
```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### **Production (Vercel):**
```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_URL=https://basestay.io
NEXT_PUBLIC_APP_URL=https://basestay.io
```

## 📊 **STEP 5: Performance Optimization**

### **Vercel Analytics Setup:**
1. **Enable Analytics**: Project Settings → Analytics
2. **Web Vitals**: Monitor Core Web Vitals
3. **Usage Monitoring**: Track function usage
4. **Performance Insights**: Identify bottlenecks

### **Database Optimization:**
1. **Indexes**: Review Prisma schema for indexes
2. **Query Optimization**: Analyze slow queries
3. **Connection Pooling**: Configure for production
4. **Caching Strategy**: Plan Redis integration

## ⏱️ **Timeline for Setup**

### **Today (2-3 hours):**
- [ ] **Vercel account** signup and project import
- [ ] **First deployment** to test functionality  
- [ ] **Railway database** signup and creation
- [ ] **Environment variables** configuration

### **Tomorrow (1-2 hours):**
- [ ] **Database migration** from SQLite to PostgreSQL
- [ ] **Data testing** and validation
- [ ] **Security secrets** generation
- [ ] **Performance optimization** initial setup

### **When DNS Ready (30 minutes):**
- [ ] **Custom domain** connection to Vercel
- [ ] **SSL certificate** automatic provisioning
- [ ] **Email routing** setup in Cloudflare
- [ ] **Final testing** of complete setup

## 💰 **Cost Update**

### **New Monthly Costs:**
```
Domain: $4.17/month ($50/year paid)
Cloudflare: $0/month (FREE plan)
Vercel Pro: $20/month
Railway DB: $5-20/month
Email: $0/month (Cloudflare routing)

Total: $29-44/month
```

### **One-time Setup:**
```
Domain: $50 (paid)
Setup time: ~10 hours total
Development value: Priceless 🚀
```

## 🎯 **Ready to Start?**

**Priority order while DNS propagating:**
1. **Vercel signup & import** (30 minutes)
2. **Railway database setup** (30 minutes)  
3. **Environment configuration** (20 minutes)
4. **First deployment test** (20 minutes)

**Which one would you like to tackle first?** 🚀
