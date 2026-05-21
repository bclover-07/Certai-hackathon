import { createConfig } from "@privy-io/wagmi";
import { http } from "wagmi";
import { baseSepolia } from "wagmi/chains";

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
});
