# URGENT: Add These Environment Variables to Vercel Dashboard

## Go to: https://vercel.com/dashboard → basestay → Settings → Environment Variables

Add these variables one by one:

### 1. DATABASE_URL (CRITICAL - This is why properties creation fails)
```
DATABASE_URL=postgresql://postgres:XpVxtvGygQkoPwJsOdCviVNtXIUbVspP@interchange.proxy.rlwy.net:20197/railway
```

### 2. Smart Contract Addresses
```
NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS=0x1CBE968d60aeaabfe3E11C2c3C3fBAe74193d708
NEXT_PUBLIC_BOOKING_MANAGER_ADDRESS=0x07314d16678595162fC55e02Df28e36839a81b74
NEXT_PUBLIC_REVIEW_SYSTEM_ADDRESS=0x529B251FE5B4d38a9F31199F201F57b0002bA965
NEXT_PUBLIC_BST_TOKEN_ADDRESS=0x8fDc3a7c612bc637B5659526B29Ee233e291F371
```

### 3. App Configuration
```
NEXT_PUBLIC_CDP_API_KEY=1bc100ff-af09-4d72-a4cf-e9617c6de50a
NEXT_PUBLIC_APP_URL=https://basestay.vercel.app
NEXT_PUBLIC_DOMAIN=basestay.vercel.app
```

### 4. Apply to:
- ✅ Production
- ✅ Preview  
- ✅ Development

### 5. After adding all variables:
- Go to Deployments tab
- Click "Redeploy" on latest deployment

## Why This Fixes the Error:
The "unhandled error" when creating properties was caused by missing DATABASE_URL in production environment. Local development worked because .env.local exists, but Vercel production couldn't connect to Railway PostgreSQL database.

## Test After Deployment:
1. Go to https://basestay.io/host
2. Try creating a property
3. Check https://basestay.io/api/env-check to verify variables are set
4. Check https://basestay.io/api/database-test to verify DB connection
