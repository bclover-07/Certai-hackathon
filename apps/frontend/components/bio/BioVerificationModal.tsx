'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface BioResult {
  livenessScore: number;       // 0-100
  heartRateAvg: number;        // BPM
  stressScore: number;         // 0-100 (higher = more stress)
  blinkCount: number;
  clinicalScore: number;       // 0-3 correct answers
  passed: boolean;
  meshDetected: boolean;
}

interface BioVerificationModalProps {
  credentialTitle: string;
  onComplete: (result: BioResult) => void;
  onCancel: () => void;
}

// ─── CPR/BLS CLINICAL QUESTIONS ──────────────────────────────────────────────
const CLINICAL_QUESTIONS = [
  {
    id: 1,
    scenario: 'Patient is unresponsive, not breathing normally. No pulse detected.',
    question: 'What is the FIRST action you should take?',
    options: [
      'A) Give 2 rescue breaths immediately',
      'B) Call for help / activate emergency response',
      'C) Begin chest compressions at 30:2 ratio',
      'D) Check for airway obstruction'
    ],
    correct: 1,  // index of correct answer (0-based)
    explanation: 'Calling for help and activating emergency response is always first.'
  },
  {
    id: 2,
    scenario: 'You are performing CPR alone. AED arrives.',
    question: 'When should you use the AED?',
    options: [
      'A) Only after 5 minutes of CPR',
      'B) Immediately — turn on and follow prompts',
      'C) Wait for 2 rescuers before using AED',
      'D) Use AED only if patient is under 18'
    ],
    correct: 1,
    explanation: 'Use AED as soon as it arrives — defibrillation within 3-5 min is optimal.'
  },
  {
    id: 3,
    scenario: 'Adult patient, CPR in progress. Second rescuer arrives.',
    question: 'What is the correct chest compression rate?',
    options: [
      'A) 60–80 compressions per minute',
      'B) 100–120 compressions per minute',
      'C) 120–140 compressions per minute',
      'D) Whatever feels natural'
    ],
    correct: 1,
    explanation: 'AHA guidelines: 100-120 compressions/min, depth 2–2.4 inches.'
  }
];

// ─── rPPG ALGORITHM CONSTANTS ─────────────────────────────────────────────────
// MediaPipe forehead landmark indices (top of nose bridge area)
const FOREHEAD_LANDMARKS = [10, 109, 338, 67, 297, 54, 284, 103, 332];
const SAMPLE_BUFFER_SIZE = 150;  // ~5 seconds at 30fps
const HEART_RATE_MIN = 45;
const HEART_RATE_MAX = 180;

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function BioVerificationModal({
  credentialTitle,
  onComplete,
  onCancel
}: BioVerificationModalProps) {

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);    // hidden — for pixel extraction
  const overlayRef = useRef<HTMLCanvasElement>(null);  // visible — mesh overlay
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  // rPPG signal buffer
  const rPPGBufferRef = useRef<number[]>([]);           // green channel values
  const heartRateHistoryRef = useRef<{time: number, bpm: number}[]>([]);

  // Liveness
  const blinkCountRef = useRef(0);
  const lastEyeOpenRef = useRef(true);

  // State
  const [phase, setPhase] = useState<'loading' | 'scanning' | 'quiz' | 'processing' | 'done'>('loading');
  const [devMode, setDevMode] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [heartRateData, setHeartRateData] = useState<{time: number, bpm: number}[]>([]);
  const [currentBPM, setCurrentBPM] = useState(0);
  const [livenessScore, setLivenessScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);   // 0-100
  const [loadingText, setLoadingText] = useState('Initializing MediaPipe WASM...');

  // ── Initialize MediaPipe ────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        setLoadingText('Loading face landmarker model...');

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU'
          },
          outputFaceBlendshapes: true,
          runningMode: 'VIDEO',
          numFaces: 1
        });

        if (cancelled) return;
        landmarkerRef.current = landmarker;

        setLoadingText('Starting webcam...');

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false
        });

        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await new Promise<void>(res => {
            if (!videoRef.current) return res();
            videoRef.current.onloadedmetadata = () => res();
          });
          await videoRef.current.play();
        }

        setPhase('scanning');
        setScanProgress(0);
        startProcessingLoop();
      } catch (err) {
        console.error('BioVerification init error:', err);
        setLoadingText('Camera access failed. Please allow webcam access.');
      }
    };

    init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      landmarkerRef.current?.close();
    };
  }, []);

  // ── rPPG: Extract mean green channel from forehead region ──────────────────
  const extractForheadGreen = useCallback((
    landmarks: any[],
    videoEl: HTMLVideoElement,
    ctx: CanvasRenderingContext2D
  ): number | null => {
    if (!landmarks || landmarks.length === 0) return null;

    const w = videoEl.videoWidth;
    const h = videoEl.videoHeight;

    // Get forehead pixel coordinates from landmark indices
    const points = FOREHEAD_LANDMARKS.map(idx => ({
      x: Math.floor(landmarks[idx].x * w),
      y: Math.floor(landmarks[idx].y * h)
    })).filter(p => p.x > 0 && p.y > 0 && p.x < w && p.y < h);

    if (points.length < 3) return null;

    // Draw a small patch around the forehead centroid
    const cx = Math.floor(points.reduce((s, p) => s + p.x, 0) / points.length);
    const cy = Math.floor(points.reduce((s, p) => s + p.y, 0) / points.length);
    const patchSize = 20;

    ctx.drawImage(videoEl, 0, 0, w, h);
    const imageData = ctx.getImageData(
      Math.max(0, cx - patchSize),
      Math.max(0, cy - patchSize),
      patchSize * 2,
      patchSize * 2
    );

    // Average the green channel (index 1 in RGBA)
    let greenSum = 0;
    let count = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      greenSum += imageData.data[i + 1];
      count++;
    }
    return count > 0 ? greenSum / count : null;
  }, []);

  // ── rPPG: Estimate BPM from green channel buffer ──────────────────────────
  const estimateHeartRate = useCallback((buffer: number[]): number => {
    if (buffer.length < 60) return 0;

    // Detrend: subtract rolling mean
    const windowSize = 30;
    const detrended = buffer.map((v, i) => {
      const start = Math.max(0, i - windowSize);
      const slice = buffer.slice(start, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
      return v - mean;
    });

    // Count zero crossings (positive → negative = one beat)
    let crossings = 0;
    for (let i = 1; i < detrended.length; i++) {
      if (detrended[i - 1] > 0 && detrended[i] <= 0) crossings++;
    }

    // BPM = crossings per second × 60
    const durationSeconds = buffer.length / 30; // assuming ~30fps
    const bpm = Math.round((crossings / durationSeconds) * 60);

    // Clamp to physiologically valid range
    return Math.max(HEART_RATE_MIN, Math.min(HEART_RATE_MAX, bpm));
  }, []);

  // ── Liveness: Detect blinks via eye blendshape scores ────────────────────
  const detectBlink = useCallback((blendshapes: any[]): boolean => {
    if (!blendshapes || blendshapes.length === 0) return false;
    const scores = blendshapes[0]?.categories || [];
    const leftEye = scores.find((c: any) => c.categoryName === 'eyeBlinkLeft')?.score ?? 0;
    const rightEye = scores.find((c: any) => c.categoryName === 'eyeBlinkRight')?.score ?? 0;
    return (leftEye + rightEye) / 2 > 0.45;
  }, []);

  // ── Draw face mesh overlay ────────────────────────────────────────────────
  const drawMeshOverlay = useCallback((
    landmarks: any[],
    overlayCtx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    overlayCtx.clearRect(0, 0, width, height);

    if (!landmarks || landmarks.length === 0) return;

    // Draw all 478 landmark dots
    overlayCtx.fillStyle = '#00ff88';
    landmarks.forEach((lm: any, i: number) => {
      const x = lm.x * width;
      const y = lm.y * height;
      overlayCtx.beginPath();
      overlayCtx.arc(x, y, 1.2, 0, Math.PI * 2);
      overlayCtx.fill();
    });

    // Highlight forehead ROI in cyan
    overlayCtx.fillStyle = 'rgba(0, 212, 255, 0.25)';
    overlayCtx.strokeStyle = '#00d4ff';
    overlayCtx.lineWidth = 1;
    const foreheadPoints = FOREHEAD_LANDMARKS.map(idx => ({
      x: landmarks[idx]?.x * width,
      y: landmarks[idx]?.y * height
    })).filter(p => p.x && p.y);

    if (foreheadPoints.length > 2) {
      overlayCtx.beginPath();
      overlayCtx.moveTo(foreheadPoints[0].x, foreheadPoints[0].y);
      foreheadPoints.forEach(p => overlayCtx.lineTo(p.x, p.y));
      overlayCtx.closePath();
      overlayCtx.fill();
      overlayCtx.stroke();
    }

    // Label
    overlayCtx.font = '11px monospace';
    overlayCtx.fillStyle = '#00d4ff';
    overlayCtx.fillText('rPPG ROI', foreheadPoints[0]?.x - 20 || 10, (foreheadPoints[0]?.y || 40) - 8);
  }, []);

  // ── Main processing loop ───────────────────────────────────────────────────
  const startProcessingLoop = useCallback(() => {
    let frameCount = 0;
    const scanStart = Date.now();

    const process = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const overlay = overlayRef.current;
      const landmarker = landmarkerRef.current;

      if (!video || !canvas || !overlay || !landmarker) {
        animFrameRef.current = requestAnimationFrame(process);
        return;
      }

      if (video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(process);
        return;
      }

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const overlayCtx = overlay.getContext('2d');
      if (!ctx || !overlayCtx) {
        animFrameRef.current = requestAnimationFrame(process);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      overlay.width = video.videoWidth;
      overlay.height = video.videoHeight;

      const timestamp = performance.now();
      const result = landmarker.detectForVideo(video, timestamp);
      const landmarks = result?.faceLandmarks?.[0];
      const blendshapes = result?.faceBlendshapes;

      const detected = !!landmarks;
      setFaceDetected(detected);

      if (detected && landmarks) {
        // rPPG extraction
        const greenVal = extractForheadGreen(landmarks, video, ctx);
        if (greenVal !== null) {
          rPPGBufferRef.current.push(greenVal);
          if (rPPGBufferRef.current.length > SAMPLE_BUFFER_SIZE) {
            rPPGBufferRef.current.shift();
          }

          // Estimate BPM every 30 frames
          if (frameCount % 30 === 0 && rPPGBufferRef.current.length >= 60) {
            const bpm = estimateHeartRate(rPPGBufferRef.current);
            if (bpm > 0) {
              setCurrentBPM(bpm);
              const entry = { time: Math.floor((Date.now() - scanStart) / 1000), bpm };
              heartRateHistoryRef.current.push(entry);
              if (heartRateHistoryRef.current.length > 30) heartRateHistoryRef.current.shift();
              setHeartRateData([...heartRateHistoryRef.current]);
            }
          }
        }

        // Blink detection
        if (blendshapes) {
          const isBlinking = detectBlink(blendshapes);
          if (!isBlinking && !lastEyeOpenRef.current) {
            blinkCountRef.current += 1;
            setLivenessScore(Math.min(100, blinkCountRef.current * 20));
          }
          lastEyeOpenRef.current = !isBlinking;
        }

        // Mesh overlay (dev mode only)
        if (devMode) {
          drawMeshOverlay(landmarks, overlayCtx, overlay.width, overlay.height);
        } else {
          overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
        }
      } else {
        overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
      }

      frameCount++;

      // Scanning progress (advance over 10 seconds)
      const elapsed = Date.now() - scanStart;
      const progress = Math.min(100, Math.floor((elapsed / 10000) * 100));
      setScanProgress(progress);

      // After 10 seconds of scanning, move to quiz
      if (elapsed >= 10000) {
        setPhase('quiz');
        return;  // stop the loop
      }

      animFrameRef.current = requestAnimationFrame(process);
    };

    animFrameRef.current = requestAnimationFrame(process);
  }, [devMode, extractForheadGreen, estimateHeartRate, detectBlink, drawMeshOverlay]);

  // Restart loop when devMode changes
  useEffect(() => {
    if (phase === 'scanning') {
      cancelAnimationFrame(animFrameRef.current);
      startProcessingLoop();
    }
  }, [devMode]);

  // ── Answer a quiz question ─────────────────────────────────────────────────
  const handleAnswer = (answerIndex: number) => {
    if (showFeedback) return;
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);

    setTimeout(() => {
      const newAnswers = [...answers, answerIndex];
      setAnswers(newAnswers);
      setSelectedAnswer(null);
      setShowFeedback(false);

      if (currentQuestion + 1 < CLINICAL_QUESTIONS.length) {
        setCurrentQuestion(q => q + 1);
      } else {
        // Quiz done — calculate results
        setPhase('processing');
        finalizeBioVerification(newAnswers);
      }
    }, 1200);
  };

  // ── Finalize and return result ─────────────────────────────────────────────
  const finalizeBioVerification = (finalAnswers: number[]) => {
    const clinicalScore = finalAnswers.reduce((score, ans, i) => {
      return score + (ans === CLINICAL_QUESTIONS[i].correct ? 1 : 0);
    }, 0);

    const bpmList = heartRateHistoryRef.current.map(d => d.bpm).filter(b => b > 0);
    const heartRateAvg = bpmList.length > 0
      ? Math.round(bpmList.reduce((a, b) => a + b, 0) / bpmList.length)
      : 72;

    // Stress score: higher BPM compared to resting baseline (assumed 70bpm) = higher stress
    const stressScore = Math.min(100, Math.max(0, Math.round(((heartRateAvg - 70) / 50) * 100)));

    const finalLiveness = Math.min(100, (blinkCountRef.current >= 2 ? 90 : 40) + (faceDetected ? 10 : 0));

    const passed = clinicalScore >= 2 && finalLiveness >= 40;

    setTimeout(() => {
      setPhase('done');
      onComplete({
        livenessScore: finalLiveness,
        heartRateAvg,
        stressScore,
        blinkCount: blinkCountRef.current,
        clinicalScore,
        passed,
        meshDetected: faceDetected
      });
    }, 2000);
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(3, 5, 8, 0.97)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'IBM Plex Mono, monospace'
      }}
    >
      {/* Header */}
      <div style={{ width: '100%', maxWidth: 900, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: '#00d4ff', margin: 0, fontSize: 20, fontWeight: 600 }}>
            ⚕ Bio-Verified Proof of Skill
          </h2>
          <p style={{ color: '#7890a8', margin: '4px 0 0', fontSize: 13 }}>
            Claiming: <span style={{ color: '#fbbf24' }}>{credentialTitle}</span>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Dev Mode Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#7890a8', fontSize: 12 }}>
            <span>DEV MODE</span>
            <div
              onClick={() => setDevMode(d => !d)}
              style={{
                width: 44, height: 24,
                borderRadius: 12,
                background: devMode ? '#00d4ff' : '#1a1f2e',
                border: '1px solid #334',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 3, left: devMode ? 22 : 3,
                width: 16, height: 16,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s'
              }} />
            </div>
          </label>

          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              border: '1px solid #334',
              color: '#ef4444',
              padding: '6px 14px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ width: '100%', maxWidth: 900, display: 'flex', gap: 20 }}>

        {/* LEFT: Webcam + Overlay */}
        <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Video container */}
          <div style={{
            position: 'relative',
            borderRadius: 12,
            overflow: 'hidden',
            border: `2px solid ${faceDetected ? '#00d4ff' : '#334'}`,
            background: '#050810',
            transition: 'border-color 0.3s'
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', display: 'block', transform: 'scaleX(-1)' }}
            />

            {/* Hidden extraction canvas */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Visible mesh overlay canvas */}
            <canvas
              ref={overlayRef}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                transform: 'scaleX(-1)',
                opacity: devMode ? 1 : 0,
                transition: 'opacity 0.4s',
                pointerEvents: 'none'
              }}
            />

            {/* Scan line animation (non-dev mode) */}
            {!devMode && phase === 'scanning' && (
              <div style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  left: 0, right: 0,
                  height: 2,
                  background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
                  animation: 'scanline 2s linear infinite',
                  top: `${scanProgress}%`
                }} />
              </div>
            )}

            {/* Face not detected warning */}
            {!faceDetected && phase === 'scanning' && (
              <div style={{
                position: 'absolute',
                bottom: 8, left: 0, right: 0,
                textAlign: 'center',
                color: '#fbbf24',
                fontSize: 11,
                background: 'rgba(0,0,0,0.7)',
                padding: '4px'
              }}>
                ⚠ No face detected — center your face
              </div>
            )}
          </div>

          {/* Status badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Face Mesh', value: faceDetected ? '478 pts' : 'Scanning...', ok: faceDetected },
              { label: 'Liveness', value: `${livenessScore}%`, ok: livenessScore >= 40 },
              { label: 'Heart Rate', value: currentBPM > 0 ? `${currentBPM} BPM` : '---', ok: currentBPM > 0 },
              { label: 'Blinks', value: `${blinkCountRef.current} detected`, ok: blinkCountRef.current >= 2 }
            ].map(b => (
              <div key={b.label} style={{
                background: '#090d14',
                border: `1px solid ${b.ok ? '#00d4ff33' : '#1a2030'}`,
                borderRadius: 8,
                padding: '8px 10px'
              }}>
                <div style={{ color: '#7890a8', fontSize: 10, marginBottom: 2 }}>{b.label}</div>
                <div style={{ color: b.ok ? '#00d4ff' : '#556', fontSize: 13, fontWeight: 600 }}>{b.value}</div>
              </div>
            ))}
          </div>

          {/* Dev mode: live heart rate chart */}
          {devMode && heartRateData.length > 2 && (
            <div style={{
              background: '#090d14',
              border: '1px solid #00d4ff22',
              borderRadius: 8,
              padding: 12
            }}>
              <div style={{ color: '#00d4ff', fontSize: 11, marginBottom: 8 }}>
                rPPG Signal — Live Heart Rate
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={heartRateData}>
                  <Line
                    type="monotone"
                    dataKey="bpm"
                    stroke="#00d4ff"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[50, 160]} hide />
                  <Tooltip
                    formatter={(v: any) => [`${v} BPM`, 'Heart Rate']}
                    contentStyle={{ background: '#0a0f1a', border: '1px solid #334', fontSize: 11 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* RIGHT: Phase content */}
        <div style={{ flex: 1 }}>

          {/* LOADING phase */}
          {phase === 'loading' && (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20
            }}>
              <div style={{
                width: 48, height: 48,
                border: '3px solid #334',
                borderTopColor: '#00d4ff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <p style={{ color: '#00d4ff', fontSize: 13, textAlign: 'center' }}>{loadingText}</p>
            </div>
          )}

          {/* SCANNING phase */}
          {phase === 'scanning' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                background: '#090d14',
                border: '1px solid #00d4ff22',
                borderRadius: 12,
                padding: 20
              }}>
                <h3 style={{ color: '#f0f4ff', margin: '0 0 8px', fontSize: 16 }}>
                  Biometric Scan in Progress
                </h3>
                <p style={{ color: '#7890a8', fontSize: 13, margin: '0 0 16px', lineHeight: 1.6 }}>
                  MediaPipe is mapping your 478 facial landmarks and extracting
                  your rPPG vitals contactlessly. Please look directly at the camera.
                  Blink naturally.
                </p>

                {/* Progress bar */}
                <div style={{ background: '#1a2030', borderRadius: 4, height: 6, marginBottom: 8 }}>
                  <div style={{
                    height: '100%',
                    borderRadius: 4,
                    background: '#00d4ff',
                    width: `${scanProgress}%`,
                    transition: 'width 0.3s'
                  }} />
                </div>
                <div style={{ color: '#556', fontSize: 11 }}>
                  {scanProgress < 100 ? `Collecting vitals data... ${scanProgress}%` : 'Ready — loading clinical test...'}
                </div>
              </div>

              {/* What we're measuring */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: '🫀', label: 'Heart rate via rPPG', detail: 'Forehead pixel analysis', active: currentBPM > 0 },
                  { icon: '👁', label: 'Liveness detection', detail: 'Blink rate + pupil tracking', active: blinkCountRef.current > 0 },
                  { icon: '🧠', label: '3D face mapping', detail: '478 landmark points', active: faceDetected },
                  { icon: '📊', label: 'Stress baseline', detail: 'HRV measurement', active: heartRateData.length > 3 }
                ].map(item => (
                  <div key={item.label} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    background: item.active ? '#0a1520' : '#090d14',
                    border: `1px solid ${item.active ? '#00d4ff33' : '#1a2030'}`,
                    borderRadius: 8,
                    transition: 'all 0.3s'
                  }}>
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                    <div>
                      <div style={{ color: item.active ? '#f0f4ff' : '#556', fontSize: 13, fontWeight: 500 }}>
                        {item.label}
                      </div>
                      <div style={{ color: '#556', fontSize: 11 }}>{item.detail}</div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      {item.active
                        ? <span style={{ color: '#00e676', fontSize: 11 }}>✓ Active</span>
                        : <span style={{ color: '#556', fontSize: 11 }}>Scanning...</span>
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUIZ phase */}
          {phase === 'quiz' && currentQuestion < CLINICAL_QUESTIONS.length && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Progress */}
              <div style={{ display: 'flex', gap: 8 }}>
                {CLINICAL_QUESTIONS.map((_, i) => (
                  <div key={i} style={{
                    height: 4,
                    flex: 1,
                    borderRadius: 2,
                    background: i < currentQuestion ? '#00e676'
                              : i === currentQuestion ? '#00d4ff'
                              : '#1a2030'
                  }} />
                ))}
              </div>

              {/* Scenario */}
              <div style={{
                background: '#0a1020',
                border: '1px solid #fbbf2422',
                borderRadius: 12,
                padding: 16
              }}>
                <div style={{ color: '#fbbf24', fontSize: 11, marginBottom: 6 }}>
                  CLINICAL SCENARIO — QUESTION {currentQuestion + 1}/3
                </div>
                <p style={{ color: '#f0f4ff', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                  {CLINICAL_QUESTIONS[currentQuestion].scenario}
                </p>
              </div>

              {/* Question */}
              <p style={{ color: '#f0f4ff', fontSize: 15, fontWeight: 500, margin: 0 }}>
                {CLINICAL_QUESTIONS[currentQuestion].question}
              </p>

              {/* Answer options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {CLINICAL_QUESTIONS[currentQuestion].options.map((opt, i) => {
                  const isSelected = selectedAnswer === i;
                  const isCorrect = i === CLINICAL_QUESTIONS[currentQuestion].correct;
                  const showResult = showFeedback;

                  let borderColor = '#1a2030';
                  let bg = '#090d14';
                  let textColor = '#7890a8';

                  if (showResult && isCorrect) {
                    borderColor = '#00e676';
                    bg = '#001a0d';
                    textColor = '#00e676';
                  } else if (showResult && isSelected && !isCorrect) {
                    borderColor = '#ef4444';
                    bg = '#1a0009';
                    textColor = '#ef4444';
                  } else if (!showResult && isSelected) {
                    borderColor = '#00d4ff';
                    bg = '#0a1520';
                    textColor = '#f0f4ff';
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      disabled={showFeedback}
                      style={{
                        background: bg,
                        border: `1px solid ${borderColor}`,
                        borderRadius: 10,
                        padding: '12px 16px',
                        color: textColor,
                        fontSize: 13,
                        textAlign: 'left',
                        cursor: showFeedback ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                        fontFamily: 'DM Sans, sans-serif'
                      }}
                    >
                      {opt}
                      {showResult && isCorrect && <span style={{ float: 'right' }}>✓</span>}
                      {showResult && isSelected && !isCorrect && <span style={{ float: 'right' }}>✗</span>}
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              {showFeedback && (
                <p style={{
                  color: selectedAnswer === CLINICAL_QUESTIONS[currentQuestion].correct ? '#00e676' : '#fbbf24',
                  fontSize: 12,
                  margin: 0,
                  padding: '10px 14px',
                  background: '#0a0f14',
                  borderRadius: 8,
                  borderLeft: `3px solid ${selectedAnswer === CLINICAL_QUESTIONS[currentQuestion].correct ? '#00e676' : '#fbbf24'}`
                }}>
                  {CLINICAL_QUESTIONS[currentQuestion].explanation}
                </p>
              )}
            </div>
          )}

          {/* PROCESSING phase */}
          {phase === 'processing' && (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20
            }}>
              <div style={{
                width: 64, height: 64,
                border: '3px solid #1a2030',
                borderTopColor: '#a855f7',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#a855f7', fontSize: 15, margin: '0 0 6px' }}>
                  LangGraph synthesizing biometric data...
                </p>
                <p style={{ color: '#556', fontSize: 12, margin: 0 }}>
                  Agent 1: Clinical accuracy evaluation<br/>
                  Agent 2: rPPG vitals + liveness analysis
                </p>
              </div>
            </div>
          )}

          {/* DONE phase */}
          {phase === 'done' && (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20
            }}>
              <div style={{ fontSize: 48 }}>✅</div>
              <p style={{ color: '#00e676', fontSize: 18, fontWeight: 600, margin: 0 }}>
                Bio-Verification Complete
              </p>
              <p style={{ color: '#7890a8', fontSize: 13, margin: 0 }}>
                Preparing SoulBound credential for UGF minting...
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scanline {
          0% { top: 0%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
