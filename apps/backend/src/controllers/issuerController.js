const Credential = require('../models/Credential');
const User = require('../models/User');
const { success, error } = require('../utils/responseHelper');
const { recomputeAndSave } = require('../services/trustScoreService');

const registerIssuer = async (req, res, next) => {
  try {
    const { walletAddress, institutionName, institutionDomain } = req.body;

    if (!walletAddress || !institutionName) {
      return res.status(400).json(error('Wallet address and institution name are required'));
    }

    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      return res.status(404).json(error('User not found. Please register first.'));
    }

    user.profile.role = 'issuer';
    user.profile.institutionName = institutionName;
    user.profile.institutionDomain = institutionDomain || '';
    user.profile.isVerifiedIssuer = false;
    user.lastActiveAt = new Date();
    await user.save();

    return res.json(success(user, 'Issuer registration submitted. Awaiting admin verification.'));
  } catch (err) {
    next(err);
  }
};

const verifyIssuer = async (req, res, next) => {
  try {
    const { walletAddress } = req.body;

    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      return res.status(404).json(error('User not found'));
    }

    user.profile.isVerifiedIssuer = true;
    user.profile.issuerVerifiedAt = new Date();
    await user.save();

    return res.json(success(user, 'Issuer verified successfully'));
  } catch (err) {
    next(err);
  }
};

const approveCredential = async (req, res, next) => {
  try {
    const { credentialId, approvalNote } = req.body;

    if (!credentialId) {
      return res.status(400).json(error('Credential ID is required'));
    }

    const credential = await Credential.findById(credentialId);
    if (!credential) {
      return res.status(404).json(error('Credential not found'));
    }

    const issuerUser = req.userProfile;
    const issuerWallet = issuerUser?.walletAddress || '';
    const institutionName = issuerUser?.profile?.institutionName || '';

    credential.trustLevel = 'institution_verified';
    credential.issuerVerification = {
      verified: true,
      issuerWallet,
      verifiedAt: new Date(),
      institutionName
    };
    credential.issuerAddress = issuerWallet;
    credential.trustLevelHistory.push({
      level: 'institution_verified',
      changedBy: issuerWallet,
      changedAt: new Date(),
      reason: approvalNote || `Approved by ${institutionName}`
    });

    await credential.save();

    try {
      await recomputeAndSave(credential);
    } catch (e) {
      console.error('Failed to recompute trust score after issuer approval:', e.message);
    }

    return res.json(success(credential, 'Credential approved by institution'));
  } catch (err) {
    next(err);
  }
};

const getPendingCredentials = async (req, res, next) => {
  try {
    const issuerUser = req.userProfile;
    const institutionName = issuerUser?.profile?.institutionName || '';

    let filter = {
      status: { $in: ['pending', 'active'] },
      'issuerVerification.verified': { $ne: true }
    };

    if (institutionName) {
      filter.issuerName = { $regex: new RegExp(institutionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') };
    }

    const credentials = await Credential.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json(success(credentials));
  } catch (err) {
    next(err);
  }
};

const getIssuers = async (req, res, next) => {
  try {
    const issuers = await User.find({ 'profile.role': 'issuer' })
      .select('walletAddress profile.displayName profile.institutionName profile.isVerifiedIssuer profile.issuerVerifiedAt')
      .sort({ createdAt: -1 });

    return res.json(success(issuers));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerIssuer,
  verifyIssuer,
  approveCredential,
  getPendingCredentials,
  getIssuers
};
