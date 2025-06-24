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
  webpack: (config) => {
    const originalIgnored = config.watchOptions.ignored || [];
    config.watchOptions.ignored = [
        ...(Array.isArray(originalIgnored) ? originalIgnored : [originalIgnored]),
        /hosting\/.*/,
    ];
    return config;
  },
};

export default nextConfig;
