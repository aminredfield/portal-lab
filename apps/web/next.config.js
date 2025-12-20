/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['picsum.photos'],
  },
  async rewrites() {
    const apiInternal = process.env.API_INTERNAL_URL || 'http://127.0.0.1:4000';
    console.log('🔧 API_INTERNAL_URL:', apiInternal);
    return [
      {
        source: '/api/:path*',
        destination: `${apiInternal}/:path*`
      }
    ];
  },
};

module.exports = nextConfig;