import { Alchemy, Network } from "alchemy-sdk";

const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "demo",
  network: Network.BASE_SEPOLIA,
};

export const alchemy = new Alchemy(settings);
