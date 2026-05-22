"use client";

import React, { useState, useRef } from 'react';
import { BACKEND_URL } from '../../lib/constants';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentialId: string;
  onSuccess?: () => void;
}

interface AnalysisResult {
  ocrText: string;
  logoDetected: boolean;
  issuerNameMatch: boolean;
  titleMatch: boolean;
  dateFound: string | null;
  fraudIndicators: string[];
  documentConfidence: number;
  analysisMethod: string;
}

export default function DocumentUploadModal({ isOpen, onClose, credentialId, onSuccess }: DocumentUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      processFile(selected);
    }
  };

  const processFile = (selected: File) => {
    setErrorMsg(null);
    setResult(null);
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(selected.type)) {
      setErrorMsg('Unsupported file type. Please upload PNG, JPG, WEBP, or PDF.');
      return;
    }

    setFile(selected);
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      setBase64(base64String);
      if (selected.type.startsWith('image/')) {
        setPreviewUrl(reader.result as string);
      } else {
        setPreviewUrl('/pdf-icon.png'); // fallback icon for PDFs
      }
    };
    reader.readAsDataURL(selected);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      processFile(dropped);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!base64 || !file) return;

    setLoading(true);
    setErrorMsg(null);
    setProgress(10);

    try {
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 500);

      // We'll read privyToken if it exists, otherwise pass mock token in header
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Look for Privy token in localStorage or cookie if needed,
      // here we use mock-test-token if nothing is found (for development/hackathon testing)
      const token = localStorage.getItem('privy:token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['Authorization'] = 'Bearer mock-test-token';
      }

      const res = await fetch(`${BACKEND_URL}/api/v1/documents/verify`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          credentialId,
          documentBase64: base64,
          mimeType: file.type
        })
      });

      clearInterval(interval);
      setProgress(100);

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Verification failed');
      }

      setResult(data.data.analysis);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during AI analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-gray-900 border border-white/10 rounded-2xl p-6 relative shadow-2xl text-white my-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
          AI Document Verification (Gemini Vision)
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Upload your certificate PDF or image. Our AI engine will perform OCR extraction, logo analysis, and fraud detection to instantly verify authenticity.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-500/30 rounded-lg text-red-300 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {!result && (
          <div className="space-y-6">
            {/* Drag & Drop Zone */}
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                file 
                  ? 'border-cyan-500/50 bg-cyan-950/10' 
                  : 'border-white/10 hover:border-cyan-500/30 hover:bg-white/5'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*,application/pdf" 
                className="hidden" 
              />
              
              {previewUrl ? (
                <div className="flex flex-col items-center">
                  {file?.type === 'application/pdf' ? (
                    <div className="w-16 h-16 bg-red-500/10 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-red-400 font-bold">PDF</span>
                    </div>
                  ) : (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-h-40 rounded-lg object-contain mb-3 border border-white/10" 
                    />
                  )}
                  <p className="text-sm font-semibold truncate max-w-xs">{file?.name}</p>
                  <p className="text-xs text-gray-400">{(file!.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3 text-cyan-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium">Drag & drop your file here, or <span className="text-cyan-400">browse</span></p>
                  <p className="text-xs text-gray-500 mt-1">Supports PDF, PNG, JPG (Max 5MB)</p>
                </div>
              )}
            </div>

            {/* Actions / Progress */}
            {loading ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400 font-medium">
                  <span>AI extraction in progress...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!file}
                  onClick={handleUpload}
                  className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                    file 
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                      : 'bg-white/5 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Analyze with AI
                </button>
              </div>
            )}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Results Title / Overall Gauge */}
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" className="stroke-white/5 fill-transparent" strokeWidth="4" />
                  <circle 
                    cx="32" 
                    cy="32" 
                    r="28" 
                    className="stroke-cyan-500 fill-transparent transition-all duration-500" 
                    strokeWidth="4" 
                    strokeDasharray={175} 
                    strokeDashoffset={175 - (175 * result.documentConfidence)} 
                  />
                </svg>
                <span className="text-sm font-bold text-cyan-400">
                  {Math.round(result.documentConfidence * 100)}%
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-white">AI Analysis Score</h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Confidence rating based on logo verification, title match, OCR validation, and fraud patterns.
                </p>
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className={`p-3 rounded-lg border text-center ${
                result.logoDetected 
                  ? 'bg-green-500/10 border-green-500/30 text-green-300' 
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}>
                <div className="text-xs font-semibold">Logo Verified</div>
                <div className="text-lg font-bold mt-1">{result.logoDetected ? '✓ Yes' : '✗ No'}</div>
              </div>
              <div className={`p-3 rounded-lg border text-center ${
                result.issuerNameMatch 
                  ? 'bg-green-500/10 border-green-500/30 text-green-300' 
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}>
                <div className="text-xs font-semibold">Issuer Match</div>
                <div className="text-lg font-bold mt-1">{result.issuerNameMatch ? '✓ Yes' : '✗ No'}</div>
              </div>
              <div className={`p-3 rounded-lg border text-center ${
                result.titleMatch 
                  ? 'bg-green-500/10 border-green-500/30 text-green-300' 
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}>
                <div className="text-xs font-semibold">Title Match</div>
                <div className="text-lg font-bold mt-1">{result.titleMatch ? '✓ Yes' : '✗ No'}</div>
              </div>
            </div>

            {/* Date and Fraud Warnings */}
            {result.fraudIndicators.length > 0 ? (
              <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4">
                <h5 className="text-sm font-semibold text-amber-400 flex items-center gap-1.5 mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Potential Anomalies Detected
                </h5>
                <ul className="text-xs text-amber-300/80 space-y-1 list-disc pl-4">
                  {result.fraudIndicators.map((indicator, idx) => (
                    <li key={idx}>{indicator}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-green-950/20 border border-green-500/20 rounded-xl p-4 text-xs text-green-300 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>No high-risk fraud indicators or modifications detected. Document looks authentic.</span>
              </div>
            )}

            {/* OCR Text Extraction (Collapsible) */}
            <details className="bg-white/5 border border-white/5 rounded-lg p-3 group">
              <summary className="text-xs font-semibold text-gray-400 cursor-pointer select-none flex justify-between items-center">
                <span>View Extracted Document Text (OCR)</span>
                <svg className="w-4 h-4 transform group-open:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-3 text-xs text-gray-400 max-h-36 overflow-y-auto whitespace-pre-wrap font-mono bg-black/40 p-2 rounded border border-white/5 leading-relaxed">
                {result.ocrText || 'No text extracted.'}
              </div>
            </details>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm rounded-lg transition-all duration-300 shadow-[0_4px_12px_rgba(6,182,212,0.25)] hover:shadow-[0_4px_20px_rgba(6,182,212,0.4)]"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
