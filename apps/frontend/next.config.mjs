/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
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
  experimental: {
    optimizePackageImports: [
      "@privy-io/react-auth",
      "@react-three/fiber",
      "@react-three/drei",
      "three",
      "zustand",
      "viem",
    ],
  },
};

export default nextConfig;
