
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
    // Return a new config object to avoid mutating the original
    return {
      ...config,
      watchOptions: {
        ...config.watchOptions,
        ignored: [
          ...(Array.isArray(config.watchOptions.ignored)
            ? config.watchOptions.ignored
            : []),
          '**/hosting/**',
        ],
      },
    };
  },
};

export default nextConfig;
