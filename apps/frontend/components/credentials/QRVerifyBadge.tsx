"use client";

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRVerifyBadgeProps {
  tokenId: string;
  title: string;
}

export default function QRVerifyBadge({ tokenId, title }: QRVerifyBadgeProps) {
  const [copied, setCopied] = useState(false);
  const [verifyUrl, setVerifyUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setVerifyUrl(`${window.location.origin}/verify/${tokenId}`);
    }
  }, [tokenId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl max-w-sm mx-auto text-white">
      <div className="mb-4 text-center">
        <h4 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
          Bio-Secure Verification
        </h4>
        <p className="text-xs text-gray-400 mt-1 max-w-[200px] truncate">
          {title}
        </p>
      </div>

      <div className="p-4 bg-gray-950 rounded-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] mb-4">
        {verifyUrl ? (
          <QRCodeSVG
            value={verifyUrl}
            size={180}
            bgColor="#030712" // matches gray-950
            fgColor="#06b6d4" // cyan-500
            level="H"
            includeMargin={true}
          />
        ) : (
          <div className="w-[180px] h-[180px] flex items-center justify-center text-cyan-500/50">
            Generating...
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center mb-4 max-w-[220px]">
        Scan QR to verify credential status, biometric proof, and trust score.
      </p>

      <button
        onClick={handleCopy}
        className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm transition-all duration-300 shadow-[0_4px_12px_rgba(6,182,212,0.25)] hover:shadow-[0_4px_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
      >
        {copied ? (
          <>
            <span className="text-green-300">✓</span> Copied Link
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copy Verification Link
          </>
        )}
      </button>
    </div>
  );
}
