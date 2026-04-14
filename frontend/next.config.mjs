/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production / Monolith optimized
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
