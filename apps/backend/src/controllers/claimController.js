const aiService = require('../services/aiService');
const Credential = require('../models/Credential');
const User = require('../models/User');
const { success, error } = require('../utils/responseHelper');

const parseClaim = async (req, res, next) => {
  try {
    const { claimText, walletAddress, sessionId, role = 'learner' } = req.body;

    if (!claimText || !claimText.trim() || claimText.length > 600) {
      return res.status(400).json(error('Claim text required (max 600 chars)'));
    }

    if (!walletAddress) {
      return res.status(400).json(error('Wallet address required'));
    }

    const result = await aiService.runCredentialAgent({
      claimText: claimText.trim(),
      walletAddress,
      sessionId,
      userRole: role
    });

    let credentialRecord = null;
    if (result.credential && result.credential.credentialType !== 'invalid') {
      credentialRecord = await Credential.create({
        holderAddress: walletAddress.toLowerCase(),
        credentialType: result.credential.credentialType,
        title: result.credential.title,
        issuerName: result.credential.issuerName,
        description: result.credential.description,
        hoursCompleted: result.credential.hoursCompleted,
        skills: result.credential.skills || [],
        rawClaimText: claimText,
        aiConfidence: result.confidence,
        aiModel: result.modelUsed,
        status: 'pending'
      });
    }

    setImmediate(async () => {
      try {
        await User.findOneAndUpdate(
          { walletAddress: walletAddress.toLowerCase() },
          { $set: { lastActiveAt: new Date() } },
          { upsert: true }
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
      estimatedFeeUSD: '~$0.01'
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

module.exports = { parseClaim, explainCredential };
