// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  experimental: {
    // Optimize package imports
    optimizePackageImports: ["@clerk/nextjs", "convex/react", "lucide-react"],
  },

  // Turbopack configuration (now stable in Next.js 15)
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
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
      {
        protocol: "https",
        hostname: "your-cdn-domain.com", // Replace with your actual CDN
        port: "",
        pathname: "/**",
      },
    ],
    // Optimize image formats
    formats: ["image/webp", "image/avif"],
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
