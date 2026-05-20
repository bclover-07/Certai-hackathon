const Credential = require('../models/Credential');
const User = require('../models/User');
const leaderboardService = require('../services/leaderboardService');
const { success, error } = require('../utils/responseHelper');

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
    const { status, tokenId, txHash } = req.body;

    const credential = await Credential.findById(id);
    if (!credential) {
      return res.status(404).json(error('Credential not found'));
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
    } else {
      await credential.save();
    }

    return res.json(success(credential, 'Credential updated successfully'));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCredentials,
  getCredential,
  getHolderCredentials,
  updateCredentialStatus
};
