const Credential = require('../models/Credential');
const User = require('../models/User');
const leaderboardService = require('../services/leaderboardService');
const { success, error } = require('../utils/responseHelper');
const { validateBioData, buildBioMetadata } = require('../services/biometricService');
const { recomputeAndSave } = require('../services/trustScoreService');

const getCredentials = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.credentialType) filter.credentialType = req.query.credentialType;

    const credentials = await Credential.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Credential.countDocuments(filter);

    return res.json(success({
      credentials,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }));
  } catch (err) {
    next(err);
  }
};

const getCredential = async (req, res, next) => {
  try {
    const { id } = req.params;
    const credential = await Credential.findById(id);

    if (!credential) {
      return res.status(404).json(error('Credential not found'));
    }

    return res.json(success(credential));
  } catch (err) {
    next(err);
  }
};

const getHolderCredentials = async (req, res, next) => {
  try {
    const { address } = req.params;
    const credentials = await Credential.find({ holderAddress: address.toLowerCase() })
      .sort({ createdAt: -1 });

    return res.json(success(credentials));
  } catch (err) {
    next(err);
  }
};

const updateCredentialStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, tokenId, txHash, bioVerification } = req.body;

    const credential = await Credential.findById(id);
    if (!credential) {
      return res.status(404).json(error('Credential not found'));
    }

    if (bioVerification) {
      const bioValidation = validateBioData(bioVerification);
      if (!bioValidation.valid) {
        return res.status(400).json(error(`Bio-verification failed: ${bioValidation.reason}`));
      }
      credential.bioVerification = buildBioMetadata(bioVerification);
    }

    const previousStatus = credential.status;
    if (status) credential.status = status;
    if (tokenId) credential.tokenId = tokenId;
    if (txHash) credential.txHash = txHash;

    if (status === 'active' && previousStatus !== 'active') {
      credential.issuedAt = new Date();
      await credential.save();

      try {
        await leaderboardService.updatePoints(credential.holderAddress, 'mint', {
          hours: credential.hoursCompleted || 0
        });
      } catch (err) {
        console.error('Failed to update leaderboard points on active status:', err.message);
      }

      try {
        await recomputeAndSave(credential);
      } catch (err) {
        console.error('Failed to recompute trust score on status update:', err.message);
      }
    } else {
      await credential.save();
    }

    return res.json(success(credential, 'Credential updated successfully'));
  } catch (err) {
    next(err);
  }
};

const upgradeTrustLevel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { trustLevel, issuerWallet, reason } = req.body;

    const credential = await Credential.findById(id);
    if (!credential) {
      return res.status(404).json(error('Credential not found'));
    }

    const LEVEL_ORDER = ['self_claimed', 'ai_verified', 'institution_verified'];
    const currentIdx = LEVEL_ORDER.indexOf(credential.trustLevel);
    const targetIdx = LEVEL_ORDER.indexOf(trustLevel);

    if (targetIdx < 0) {
      return res.status(400).json(error('Invalid trust level. Must be: self_claimed, ai_verified, or institution_verified'));
    }

    if (targetIdx <= currentIdx) {
      return res.status(400).json(error(`Cannot downgrade trust level from ${credential.trustLevel} to ${trustLevel}`));
    }

    credential.trustLevel = trustLevel;
    credential.trustLevelHistory.push({
      level: trustLevel,
      changedBy: issuerWallet || 'system',
      changedAt: new Date(),
      reason: reason || `Trust level upgraded to ${trustLevel}`
    });

    if (trustLevel === 'institution_verified' && issuerWallet) {
      credential.issuerVerification = {
        verified: true,
        issuerWallet,
        verifiedAt: new Date(),
        institutionName: reason || ''
      };
    }

    await credential.save();

    try {
      await recomputeAndSave(credential);
    } catch (err) {
      console.error('Failed to recompute trust score after trust level upgrade:', err.message);
    }

    return res.json(success(credential, `Trust level upgraded to ${trustLevel}`));
  } catch (err) {
    next(err);
  }
};

const revokeCredential = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, revokerAddress } = req.body;

    const credential = await Credential.findById(id);
    if (!credential) {
      return res.status(404).json(error('Credential not found'));
    }

    if (credential.status === 'revoked') {
      return res.status(400).json(error('Credential is already revoked'));
    }

    credential.status = 'revoked';
    credential.revocation = {
      revokedAt: new Date(),
      reason: reason || 'No reason provided',
      revokerAddress: revokerAddress || ''
    };
    credential.trustScore = 0;
    credential.trustScoreBreakdown = {
      issuerReputation: 0,
      aiConfidence: 0,
      verificationHistory: 0,
      endorsementCount: 0,
      documentProof: 0,
      institutionApproval: 0
    };
    credential.trustLevelHistory.push({
      level: 'revoked',
      changedBy: revokerAddress || 'system',
      changedAt: new Date(),
      reason: reason || 'Credential revoked'
    });

    await credential.save();

    return res.json(success(credential, 'Credential revoked successfully'));
  } catch (err) {
    next(err);
  }
};

const getCredentialByTxHash = async (req, res, next) => {
  try {
    const { txHash } = req.params;
    if (!txHash) {
      return res.status(400).json(error('Transaction hash required'));
    }

    const credential = await Credential.findOne({
      txHash: { $regex: new RegExp("^" + txHash + "$", "i") }
    });

    if (!credential) {
      return res.status(404).json(error('Credential not found for this transaction hash'));
    }

    return res.json(success(credential));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCredentials,
  getCredential,
  getHolderCredentials,
  updateCredentialStatus,
  upgradeTrustLevel,
  revokeCredential,
  getCredentialByTxHash
};
