const Endorsement = require('../models/Endorsement');
const Credential = require('../models/Credential');
const leaderboardService = require('../services/leaderboardService');
const { success, error } = require('../utils/responseHelper');

const createEndorsement = async (req, res, next) => {
  try {
    const { endorserAddress, recipientAddress, credentialId, credentialTokenId, skillTag, note, txHash } = req.body;

    if (!endorserAddress || !recipientAddress || !skillTag) {
      return res.status(400).json(error('Missing required endorsement parameters (endorser, recipient, skillTag)'));
    }

    if (endorserAddress.toLowerCase() === recipientAddress.toLowerCase()) {
      return res.status(400).json(error('Cannot endorse yourself'));
    }

    const endorsement = await Endorsement.create({
      endorserAddress: endorserAddress.toLowerCase(),
      recipientAddress: recipientAddress.toLowerCase(),
      credentialId,
      credentialTokenId,
      skillTag: skillTag.trim().toLowerCase(),
      note: note || '',
      txHash,
      status: txHash ? 'confirmed' : 'pending'
    });

    // Update leaderboard points for endorsement
    try {
      await leaderboardService.updatePoints(recipientAddress, 'endorse');
    } catch (e) {
      console.error('Failed to update leaderboard points for endorsement:', e.message);
    }

    return res.status(201).json(success(endorsement, 'Endorsement recorded successfully'));
  } catch (err) {
    next(err);
  }
};

const getReceivedEndorsements = async (req, res, next) => {
  try {
    const { address } = req.params;
    const endorsements = await Endorsement.find({ recipientAddress: address.toLowerCase() })
      .sort({ createdAt: -1 });

    return res.json(success(endorsements));
  } catch (err) {
    next(err);
  }
};

const getGivenEndorsements = async (req, res, next) => {
  try {
    const { address } = req.params;
    const endorsements = await Endorsement.find({ endorserAddress: address.toLowerCase() })
      .sort({ createdAt: -1 });

    return res.json(success(endorsements));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createEndorsement,
  getReceivedEndorsements,
  getGivenEndorsements
};
