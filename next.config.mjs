import { default as withPWA } from '@ducanh2912/next-pwa';

// Define the base Next.js config with PWA wrapper
const pwaConfig = withPWA({
  dest: 'public', // Output directory for service worker files
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development
  register: true, // Auto-register the service worker
  skipWaiting: true, // Activate new service worker immediately
});

// Load user config dynamically
let userConfig;
try {
  userConfig = await import('./v0-user-next.config');
} catch (e) {
  // Ignore error if user config doesn't exist
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
};

// Merge PWA config into nextConfig
mergeConfig(nextConfig, pwaConfig);

// Merge user config into nextConfig (if it exists)
mergeConfig(nextConfig, userConfig?.default);

function mergeConfig(nextConfig, additionalConfig) {
  if (!additionalConfig) {
    return;
  }

  for (const key in additionalConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key]) &&
      additionalConfig[key] !== null &&
      typeof additionalConfig[key] === 'object'
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...additionalConfig[key],
      };
    } else {
      nextConfig[key] = additionalConfig[key];
    }
  }
}

export default nextConfig;