/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Required for Cloudflare Pages (static export compatible)
  output: 'export',
  trailingSlash: true,
};

module.exports = nextConfig;
