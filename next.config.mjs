/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip type-checking and linting during build — run these in CI separately
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['images.unsplash.com'],
  },
};

export default nextConfig;
