import { create } from 'zustand';

interface WalletState {
  address: string | null;
  balance: string;
  isConnected: boolean;
  displayName: string | null;
  setWallet: (address: string | null, displayName?: string | null) => void;
  setBalance: (balance: string) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  balance: '100.00', 
  isConnected: false,
  displayName: null,

  setWallet: (address, displayName = null) => set({
    address: address ? address.toLowerCase() : null,
    isConnected: !!address,
    displayName: displayName
  }),

  setBalance: (balance) => set({ balance }),

  disconnect: () => set({
    address: null,
    balance: '0.00',
    isConnected: false,
    displayName: null
  })
}));
