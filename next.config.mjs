/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['images.unsplash.com', 'res.cloudinary.com', 'ui-avatars.com'],
  },
  async rewrites() {
    // In production Vercel proxies /api/* to the backend server-side,
    // avoiding mixed-content errors (HTTPS frontend → HTTP backend).
    // In dev, NEXT_PUBLIC_API_URL is used directly (see .env.local).
    if (process.env.NODE_ENV !== 'production') return [];
    const BACKEND = 'http://165.22.70.65:4000';
    return [
      { source: '/api/:path*', destination: `${BACKEND}/api/:path*` },
      { source: '/health',     destination: `${BACKEND}/health` },
    ];
  },
};

export default nextConfig;
