"use client";

import { usePrivy as usePrivyActual, useWallets as useWalletsActual } from "@privy-io/react-auth";

export function usePrivy() {
  return usePrivyActual();
}

export function useWallets() {
  return useWalletsActual();
}
