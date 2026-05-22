/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ["@headlessui/react", "@react-aria/focus", "react-aria"],
  webpack: (config, { webpack, isServer }) => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(?:@farcaster\/mini-app-solana|@farcaster\/miniapp-sdk|@solana\/wallet-adapter-react|@farcaster\/mini-app-sdk)$/,
      })
    );

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

  // Compile faster in dev
  swcMinify: true,

  // Remove console.log in production
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Faster image loading
  images: {
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    optimizePackageImports: [
      "@privy-io/react-auth",
      "@react-three/fiber",
      "@react-three/drei",
      "three",
      "zustand",
      "viem",
      "framer-motion",
      "lucide-react",
    ],
  },
};

export default nextConfig;

