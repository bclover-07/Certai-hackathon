/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(?:@farcaster\/mini-app-solana|@farcaster\/miniapp-sdk|@solana\/wallet-adapter-react|@farcaster\/mini-app-sdk)$/,
      })
    );
    return config;
  },
};

export default nextConfig;
