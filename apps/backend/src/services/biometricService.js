// Processes biometric data from frontend and generates trust assessment

const validateBioData = (bioData) => {
  if (!bioData) return { valid: false, reason: 'No biometric data provided' };

  // Parse clinicalScore if it comes as a string format like "2/3" or as a number
  let scoreNum = 0;
  if (typeof bioData.clinicalScore === 'string') {
    const parts = bioData.clinicalScore.split('/');
    scoreNum = parseInt(parts[0]) || 0;
  } else {
    scoreNum = typeof bioData.clinicalScore === 'number' ? bioData.clinicalScore : 0;
  }

  const { livenessScore, heartRateAvg, stressScore, meshDetected } = bioData;

  if (!meshDetected) return { valid: false, reason: 'Face mesh not detected' };
  if (livenessScore < 40) return { valid: false, reason: 'Liveness score too low' };
  if (scoreNum < 2) return { valid: false, reason: 'Clinical score insufficient' };
  if (heartRateAvg < 40 || heartRateAvg > 220) return { valid: false, reason: 'Heart rate out of range' };

  return { valid: true };
};

const computeBioTrustScore = (bioData) => {
  if (!bioData) return 0;

  let scoreNum = 0;
  if (typeof bioData.clinicalScore === 'string') {
    const parts = bioData.clinicalScore.split('/');
    scoreNum = parseInt(parts[0]) || 0;
  } else {
    scoreNum = typeof bioData.clinicalScore === 'number' ? bioData.clinicalScore : 0;
  }

  const { livenessScore = 0, heartRateAvg = 70, meshDetected = false } = bioData;

  // Component weights:
  const livenessPoints = (livenessScore / 100) * 40;           // max 40pts
  const clinicalPoints = (scoreNum / 3) * 40;                  // max 40pts
  const meshPoints = meshDetected ? 10 : 0;                    // 10pts
  const vitalsPoints = (heartRateAvg > 50 && heartRateAvg < 160) ? 10 : 0; // 10pts

  return Math.round(livenessPoints + clinicalPoints + meshPoints + vitalsPoints);
};

const buildBioMetadata = (bioData) => {
  const trustScore = computeBioTrustScore(bioData);
  
  let scoreStr = '0/3';
  if (typeof bioData?.clinicalScore === 'string') {
    scoreStr = bioData.clinicalScore;
  } else if (typeof bioData?.clinicalScore === 'number') {
    scoreStr = `${bioData.clinicalScore}/3`;
  }

  return {
    bioVerified: bioData?.passed ?? false,
    bioTrustScore: trustScore,
    livenessScore: bioData?.livenessScore ?? 0,
    heartRateAvg: bioData?.heartRateAvg ?? 0,
    stressScore: bioData?.stressScore ?? 0,
    clinicalScore: scoreStr,
    meshDetected: bioData?.meshDetected ?? false,
    verificationMethod: 'MediaPipe-FaceLandmarker-478pts + rPPG-Forehead',
    verifiedAt: new Date().toISOString()
  };
};

module.exports = { validateBioData, computeBioTrustScore, buildBioMetadata };
