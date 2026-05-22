const Endorsement = require('../models/Endorsement');
const VerificationLog = require('../models/VerificationLog');

const KNOWN_INSTITUTIONS = [
  'american heart association', 'aha', 'mayo clinic', 'johns hopkins',
  'harvard', 'stanford', 'mit', 'yale', 'columbia', 'duke',
  'cleveland clinic', 'massachusetts general', 'memorial sloan kettering',
  'national institutes of health', 'nih', 'world health organization', 'who',
  'american red cross', 'red cross', 'american medical association', 'ama',
  'american nurses association', 'ucsf', 'emory', 'vanderbilt',
  'university of pennsylvania', 'upenn', 'cornell', 'northwestern',
  'university of michigan', 'uc berkeley', 'oxford', 'cambridge',
  'imperial college', 'karolinska', 'google', 'microsoft', 'aws',
  'coursera', 'edx', 'udemy', 'linkedin learning'
];

const computeIssuerReputation = (issuerName) => {
  if (!issuerName) return 5;
  const lower = issuerName.toLowerCase().trim();
  if (lower === 'self-reported' || lower === 'unknown issuer') return 2;
  const match = KNOWN_INSTITUTIONS.some(inst => lower.includes(inst));
  return match ? 25 : 8;
};

const computeTrustScore = async (credential) => {
  if (!credential) return { score: 0, breakdown: {} };

  const issuerReputation = computeIssuerReputation(credential.issuerName);

  const rawConf = credential.aiConfidence || 0;
  const aiConfidence = Math.round(rawConf * 20);

  let verificationHistory = 0;
  try {
    if (credential.tokenId) {
      const verCount = await VerificationLog.countDocuments({
        credentialTokenId: credential.tokenId
      });
      verificationHistory = Math.min(15, verCount * 3);
    }
  } catch (e) {
    verificationHistory = Math.min(15, (credential.verificationCount || 0) * 3);
  }

  let endorsementCount = 0;
  try {
    const endCount = await Endorsement.countDocuments({
      credentialId: credential._id
    });
    endorsementCount = Math.min(15, endCount * 5);
  } catch (e) {
    endorsementCount = 0;
  }

  const hasDoc = credential.documentVerification?.uploaded === true;
  const docConf = credential.documentVerification?.documentConfidence || 0;
  const documentProof = hasDoc ? Math.round(docConf * 15) : 0;

  const isInstApproved = credential.issuerVerification?.verified === true;
  const institutionApproval = isInstApproved ? 10 : 0;

  const breakdown = {
    issuerReputation,
    aiConfidence,
    verificationHistory,
    endorsementCount,
    documentProof,
    institutionApproval
  };

  const score = Math.min(100,
    issuerReputation + aiConfidence + verificationHistory +
    endorsementCount + documentProof + institutionApproval
  );

  return { score, breakdown };
};

const recomputeAndSave = async (credential) => {
  const { score, breakdown } = await computeTrustScore(credential);
  credential.trustScore = score;
  credential.trustScoreBreakdown = breakdown;
  await credential.save();
  return { score, breakdown };
};

module.exports = { computeTrustScore, computeIssuerReputation, recomputeAndSave };
