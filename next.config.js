/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  experimental: {
    serverActions: {
      bodySizeLimit: '60mb'
    }
  }
};

module.exports = nextConfig;
