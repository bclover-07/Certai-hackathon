const aiService = require('../services/aiService');
const Credential = require('../models/Credential');
const User = require('../models/User');
const { success, error } = require('../utils/responseHelper');
const { validateBioData, buildBioMetadata } = require('../services/biometricService');
const { recomputeAndSave } = require('../services/trustScoreService');

const parseClaim = async (req, res, next) => {
  try {
    const { claimText, walletAddress, sessionId, role = 'learner' } = req.body;

    if (!claimText || !claimText.trim() || claimText.length > 600) {
      return res.status(400).json(error('Claim text required (max 600 chars)'));
    }

    if (!walletAddress) {
      return res.status(400).json(error('Wallet address required'));
    }

    let result;
    try {
      result = await aiService.runCredentialAgent({
        claimText: claimText.trim(),
        walletAddress,
        sessionId,
        userRole: role
      });
    } catch (agentErr) {
      console.error('Error executing runCredentialAgent:', agentErr);
      return res.status(500).json(error('Failed to parse your claim. The AI agent timed out or returned an error: ' + agentErr.message));
    }

    let credentialRecord = null;
    if (result.credential && result.credential.credentialType !== 'invalid') {
      const bioData = req.body.bioVerification || null;
      let bioMetadata = null;

      if (bioData) {
        const bioValidation = validateBioData(bioData);
        if (!bioValidation.valid) {
          return res.status(400).json(error(`Bio-verification failed: ${bioValidation.reason}`));
        }
        bioMetadata = buildBioMetadata(bioData);
      }

      const aiConf = result.confidence || 0;
      const initialTrustLevel = aiConf >= 0.7 ? 'ai_verified' : 'self_claimed';

      credentialRecord = await Credential.create({
        holderAddress: walletAddress.toLowerCase(),
        credentialType: result.credential.credentialType,
        title: result.credential.title,
        issuerName: result.credential.issuerName,
        description: result.credential.description,
        hoursCompleted: result.credential.hoursCompleted,
        skills: result.credential.skills || [],
        rawClaimText: claimText,
        aiConfidence: aiConf,
        aiModel: result.modelUsed,
        status: 'pending',
        bioVerification: bioMetadata,
        trustLevel: initialTrustLevel,
        trustLevelHistory: [{
          level: initialTrustLevel,
          changedBy: 'system',
          changedAt: new Date(),
          reason: aiConf >= 0.7
            ? `AI extraction confidence ${Math.round(aiConf * 100)}% meets verification threshold`
            : 'User self-claimed credential'
        }]
      });

      try {
        await recomputeAndSave(credentialRecord);
      } catch (e) {
        console.error('Failed to compute initial trust score:', e.message);
      }
    }

    setImmediate(async () => {
      try {
        await User.findOneAndUpdate(
          { walletAddress: walletAddress.toLowerCase() },
          { $set: { lastActiveAt: new Date() } },
          { upsert: false }
        );
      } catch (e) {
        console.error('Background task error:', e.message);
      }
    });

    return res.json(success({
      credentialId: credentialRecord ? credentialRecord._id : null,
      credential: result.credential,
      conversationalReply: result.reply,
      confidence: result.confidence,
      modelUsed: result.modelUsed,
      agentSteps: result.steps,
      calldata: result.calldata,
      contractAddress: result.contractAddress,
      estimatedFeeUSD: '~$0.01',
      bioVerification: credentialRecord ? credentialRecord.bioVerification : null,
      requiresBioVerification: checkIfHighStakes(result.credential),
      trustLevel: credentialRecord ? credentialRecord.trustLevel : null,
      trustScore: credentialRecord ? credentialRecord.trustScore : null
    }));

  } catch (err) {
    next(err);
  }
};

const explainCredential = async (req, res, next) => {
  try {
    const { credentialType, title, hoursCompleted } = req.body;
    const explanation = await aiService.explainCredential(credentialType, title, hoursCompleted);
    return res.json(success({ explanation }));
  } catch (err) {
    next(err);
  }
};

const checkIfHighStakes = (credential) => {
  if (!credential) return false;
  const HIGH_STAKES_TYPES = [
    'medical_license', 'board_certification', 'residency_completion'
  ];
  const HIGH_STAKES_KEYWORDS = [
    'cpr', 'bls', 'acls', 'pals', 'trauma', 'emergency',
    'triage', 'cardiac', 'resuscitation', 'life support'
  ];
  const titleLower = (credential.title || '').toLowerCase();
  const typeMatch = HIGH_STAKES_TYPES.includes(credential.credentialType);
  const keywordMatch = HIGH_STAKES_KEYWORDS.some(k => titleLower.includes(k));
  return typeMatch || keywordMatch;
};

module.exports = { parseClaim, explainCredential };
