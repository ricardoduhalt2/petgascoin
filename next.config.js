/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { 
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        tty: false
      };
    }
    return config;
  },
  images: {
    domains: ['assets.petgascoin.com'],
  },
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/index',
      },
    ];
  },
};

module.exports = nextConfig;
