#!/bin/bash
echo "🔧 Generating Prisma Client for Vercel..."
npx prisma generate --schema=./prisma/schema.prisma
echo "✅ Prisma Client generated successfully!"

echo "🏗️ Building Next.js application..."
npm run build
echo "✅ Build completed successfully!"
