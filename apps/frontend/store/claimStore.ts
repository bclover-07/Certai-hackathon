import { create } from 'zustand';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  credential?: any;
}

export type UGFStage = 'idle' | 'quoting' | 'settling' | 'executing' | 'confirmed' | 'error';

interface ClaimState {
  messages: Message[];
  isLoading: boolean;
  currentCredential: any | null;
  ugfStage: UGFStage;
  sessionId: string;
  addMessage: (message: Omit<Message, 'timestamp'>) => void;
  setCredential: (credential: any) => void;
  setUGFStage: (stage: UGFStage) => void;
  clearChat: () => void;
  setLoading: (loading: boolean) => void;
}

export const useClaimStore = create<ClaimState>((set) => ({
  messages: [
    {
      role: 'assistant',
      content: "Hi! I'm CERTAI. I verify your professional accomplishments and issue secure, gasless on-chain credentials. What did you achieve today? (e.g. 'I completed my 40-hour ACLS certification at Memorial Hospital')",
      timestamp: new Date()
    }
  ],
  isLoading: false,
  currentCredential: null,
  ugfStage: 'idle',
  sessionId: `session_${Math.random().toString(36).substr(2, 9)}`,

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, { ...message, timestamp: new Date() }]
  })),

  setCredential: (credential) => set({ currentCredential: credential }),

  setUGFStage: (stage) => set({ ugfStage: stage }),

  clearChat: () => set((state) => ({
    messages: [
      {
        role: 'assistant',
        content: "Hi! I'm CERTAI. I verify your professional accomplishments and issue secure, gasless on-chain credentials. What did you achieve today? (e.g. 'I completed my 40-hour ACLS certification at Memorial Hospital')",
        timestamp: new Date()
      }
    ],
    currentCredential: null,
    ugfStage: 'idle',
    sessionId: `session_${Math.random().toString(36).substr(2, 9)}`
  })),

  setLoading: (loading) => set({ isLoading: loading })
}));
