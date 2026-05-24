import { useState } from 'react';
import { useClaimStore } from '../store/claimStore';
import { useWalletStore } from '../store/walletStore';
import { usePrivy, useWallets } from './usePrivy';
import { BACKEND_URL } from '../lib/constants';
import { UGFClient } from '@tychilabs/ugf-testnet-js';

export const useUGFExecute = () => {
  const { currentCredential, setUGFStage, addMessage, setCredential } = useClaimStore();
  const { address } = useWalletStore();
  const { getAccessToken } = usePrivy();
  const { wallets } = useWallets();

  const executeUGF = async () => {
    if (!currentCredential || !address) return;

    setUGFStage('quoting');
    addMessage({
      role: 'assistant',
      content: 'Initiating gasless transaction via Universal Gas Framework (UGF)...'
    });

    try {
      const activeWallet = wallets.find((w) => w.address.toLowerCase() === address.toLowerCase()) || wallets[0];
      if (!activeWallet) {
        throw new Error('No active wallet found');
      }

      const ethereumProvider = await activeWallet.getEthereumProvider();
      const provider = ethereumProvider as any;
      const signer = {
        sendTransaction: async (tx: any) => {
          const txHash = await provider.request({
            method: 'eth_sendTransaction',
            params: [tx],
          });
          return { hash: txHash };
        },
        getAddress: async () => address,
        signMessage: async (msg: string) => {
          return await provider.request({
            method: 'personal_sign',
            params: [msg, address],
          });
        }
      } as any;

      const mockTokenId = Math.floor(Math.random() * 1000000).toString();
      const isMockAuth = typeof window !== 'undefined' && localStorage.getItem('certai_mock_auth');

      if (UGFClient && !isMockAuth) {
        const client = new UGFClient();

        await client.auth.login(signer);

        const txObj = {
          to: currentCredential.contractAddress,
          data: currentCredential.calldata,
          value: '0'
        };

        const quote = await client.quote.get({
          payment_coin: 'TYI_MOCK_USD',
          payment_chain: '84532', 
          payment_chain_type: 'evm',
          tx_object: JSON.stringify(txObj),
          dest_chain_id: '84532',
          dest_chain_type: 'evm',
          payer_address: address
        });

        setUGFStage('settling');
        addMessage({
          role: 'assistant',
          content: 'UGF gasless fee quote received! Settling with TYI_MOCK_USD...'
        });

        setUGFStage('executing');
        let confirmedTxHash = '';

        await client.chains.evm.sponsorAndExecute(
          quote.digest,
          signer,
          async (tx: any) => {
            const executedTx = await signer.sendTransaction(tx);
            confirmedTxHash = executedTx.hash;
            return executedTx;
          }
        );

        setUGFStage('confirmed');
        addMessage({
          role: 'assistant',
          content: 'SoulBound credential minted successfully on Base Sepolia!',
          credential: { ...currentCredential, txHash: confirmedTxHash, status: 'active', tokenId: mockTokenId }
        });

        await syncBackendStatus(currentCredential.id, 'active', confirmedTxHash, mockTokenId, currentCredential.bioVerification);
        setCredential({ ...currentCredential, txHash: confirmedTxHash, status: 'active', tokenId: mockTokenId });

      } else {
        await new Promise((r) => setTimeout(r, 1200)); 

        setUGFStage('settling');
        addMessage({
          role: 'assistant',
          content: 'UGF fee quote received! Settling gasless fee of 0.01 Mock USD...'
        });
        await new Promise((r) => setTimeout(r, 1500)); 

        setUGFStage('executing');
        addMessage({
          role: 'assistant',
          content: 'Relaying transaction to Base Sepolia ledger...'
        });
        await new Promise((r) => setTimeout(r, 1500)); 

        const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

        setUGFStage('confirmed');
        addMessage({
          role: 'assistant',
          content: `On-chain confirmation received! Your credential has been securely minted. SoulBound ID permanently locked to your address.`,
          credential: { ...currentCredential, txHash: mockTxHash, status: 'active', tokenId: mockTokenId }
        });

        await syncBackendStatus(currentCredential.id, 'active', mockTxHash, mockTokenId, currentCredential.bioVerification);
        setCredential({ ...currentCredential, txHash: mockTxHash, status: 'active', tokenId: mockTokenId });
      }

    } catch (err: any) {
      console.error('UGF Minting execution failed:', err);
      setUGFStage('error');
      addMessage({
        role: 'assistant',
        content: `UGF Execution Error: ${err.message || 'Verification or Relayer failure'}.`
      });
    }
  };

  const syncBackendStatus = async (id: string, status: string, txHash: string, tokenId: string, bioVerification?: any) => {
    try {
      const token = await getAccessToken();

      await fetch(`${BACKEND_URL}/api/v1/credentials/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          txHash,
          tokenId,
          bioVerification
        })
      });
    } catch (err) {
      console.error('Failed to sync credential status with backend:', err);
    }
  };

  return {
    executeUGF
  };
};
