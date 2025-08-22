/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignore hardhat files during build
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

export default nextConfig
