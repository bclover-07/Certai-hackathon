import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useClaimStore } from '../store/claimStore';
import { BACKEND_URL } from '../lib/constants';

export const useClaimParser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addMessage, setCredential, sessionId } = useClaimStore();
  const { getAccessToken } = usePrivy();

  const parseClaim = async (claimText: string, walletAddress: string, role: string = 'learner') => {
    setIsLoading(true);
    setError(null);

    addMessage({ role: 'user', content: claimText });

    try {
      const token = await getAccessToken();
      const response = await fetch(`${BACKEND_URL}/api/v1/claim/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          claimText,
          walletAddress,
          sessionId,
          role
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze claim');
      }

      addMessage({
        role: 'assistant',
        content: data.data.conversationalReply,
        credential: data.data.credential
      });

      const checkIfBioRequired = (credential: any): boolean => {
        if (!credential) return false;
        const HIGH_STAKES = [
          'cpr', 'bls', 'acls', 'pals', 'trauma', 'emergency',
          'resuscitation', 'airway', 'triage', 'cardiac', 'life support',
          'board certification', 'medical license', 'clinical'
        ];
        const inputLower = (credential.title || '').toLowerCase();
        return HIGH_STAKES.some(term => inputLower.includes(term));
      };

      const requiresBio = data.data.requiresBioVerification || checkIfBioRequired(data.data.credential);

      if (data.data.credential && data.data.credential.credentialType !== 'invalid') {
        const credData = {
          ...data.data.credential,
          id: data.data.credentialId,
          calldata: data.data.calldata,
          contractAddress: data.data.contractAddress
        };
        if (!requiresBio) {
          setCredential(credData);
        }
      } else {
        setCredential(null);
      }

      return data.data;
    } catch (err: any) {
      console.error('Claim parsing failed:', err);
      const errMsg = err.message || 'An error occurred during analysis';
      setError(errMsg);
      addMessage({
        role: 'assistant',
        content: `Error: ${errMsg}. Please clarify your claim or try again.`
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    parseClaim,
    isLoading,
    error
  };
};
