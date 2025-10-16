// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  experimental: {
    // Optimize package imports
    optimizePackageImports: ["@clerk/nextjs", "convex/react", "lucide-react"],
  },


  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Image optimization
  images: {
    // Add your image domains here
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
    // Optimize image formats - AVIF first for better compression
    formats: ["image/avif", "image/webp"],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for different layouts
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Allow local images
    unoptimized: false,
  },

  // Build optimization
  poweredByHeader: false, // Remove X-Powered-By header for security
  compress: true, // Enable gzip compression

  // Environment-specific optimizations
  ...(process.env.NODE_ENV === "development" && {
    // Development-only settings
    logging: {
      fetches: {
        fullUrl: true,
      },
    },
  }),

  // Production optimizations
  ...(process.env.NODE_ENV === "production" && {
    output: "standalone", // For Docker deployments
    // Additional production settings can go here
  }),

  // Webpack optimization for faster builds
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize for faster builds
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }

    // Reduce bundle size
    config.resolve.alias = {
      ...config.resolve.alias,
      // Add specific aliasing if needed
    };

    return config;
  },
};

export default nextConfig;
