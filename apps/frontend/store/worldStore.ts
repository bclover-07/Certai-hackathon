import { create } from 'zustand';

interface WorldState {
  selectedCredentialId: string | null;
  isInspecting: boolean;
  cameraTarget: [number, number, number];
  selectCredential: (id: string | null) => void;
  clearSelection: () => void;
  setCameraTarget: (target: [number, number, number]) => void;
}

export const useWorldStore = create<WorldState>((set) => ({
  selectedCredentialId: null,
  isInspecting: false,
  cameraTarget: [0, 0, 0],

  selectCredential: (id) => set({
    selectedCredentialId: id,
    isInspecting: !!id
  }),

  clearSelection: () => set({
    selectedCredentialId: null,
    isInspecting: false,
    cameraTarget: [0, 0, 0]
  }),

  setCameraTarget: (cameraTarget) => set({ cameraTarget })
}));
