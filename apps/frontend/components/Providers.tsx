"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { baseSepolia } from "viem/chains";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "clt5x1x8a02c81804d9p5u6o5"; // Demo ID if not set

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ["email", "wallet", "google"],
        appearance: {
          theme: "dark",
          accentColor: "#00d4ff",
          logo: "https://certai.vercel.app/logo.png",
          showWalletLoginFirst: true,
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
      }}
    >
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </PrivyProvider>
  );
}
