const VerificationLog = require('../models/VerificationLog');
const Credential = require('../models/Credential');
const leaderboardService = require('../services/leaderboardService');
const { success, error } = require('../utils/responseHelper');
const { recomputeAndSave } = require('../services/trustScoreService');

const verifyCredential = async (req, res, next) => {
  try {
    const { tokenId, purpose = 'employment', txHash } = req.body;
    const verifierAddress = req.body.verifierAddress || '0x0000000000000000000000000000000000000000';

    if (!tokenId) {
      return res.status(400).json(error('Token ID required for verification'));
    }

    const credential = await Credential.findOne({ tokenId });

    let result = false;
    let holderAddress = "";

    if (credential) {
      result = credential.status === 'active';
      holderAddress = credential.holderAddress;

      credential.verificationCount = (credential.verificationCount || 0) + 1;
      await credential.save();

      try {
        await recomputeAndSave(credential);
      } catch (e) {
        console.error('Failed to recompute trust score after verification:', e.message);
      }
    }

    const log = await VerificationLog.create({
      verifierAddress: verifierAddress.toLowerCase(),
      credentialTokenId: tokenId,
      holderAddress,
      result,
      purpose,
      txHash
    });

    try {
      await leaderboardService.updatePoints(verifierAddress, 'verify');
    } catch (e) {
      console.error('Failed to update leaderboard points for verification:', e.message);
    }

    return res.json(success({
      verified: true,
      isValid: result,
      credential,
      log
    }));
  } catch (err) {
    next(err);
  }
};

const getVerificationHistory = async (req, res, next) => {
  try {
    const { address } = req.params;
    const logs = await VerificationLog.find({ verifierAddress: address.toLowerCase() })
      .sort({ verifiedAt: -1 });

    return res.json(success(logs));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  verifyCredential,
  getVerificationHistory
};
