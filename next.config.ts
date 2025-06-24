import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Add a rule to ignore the hosting directory
    config.watchOptions.ignored = [
      ...(Array.isArray(config.watchOptions.ignored) ? config.watchOptions.ignored : []),
      /hosting\/.*/,
    ];
    return config;
  },
};

export default nextConfig;
