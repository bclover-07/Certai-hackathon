const Credential = require('../models/Credential');
const leaderboardService = require('../services/leaderboardService');
const { success, error } = require('../utils/responseHelper');

const handleAlchemyWebhook = async (req, res, next) => {
  try {
    const { event } = req.body;

    if (!event || !event.activity) {
      return res.json(success({}, 'No activity events found in webhook payload'));
    }

    const activities = event.activity;
    for (const activity of activities) {
      const txHash = activity.hash;
      const holderAddress = activity.toAddress;

      const credential = await Credential.findOne({
        txHash: txHash.toLowerCase(),
        status: { $in: ['pending', 'minting'] }
      });

      if (credential) {
        credential.status = 'active';

        if (activity.erc721TokenId) {
          credential.tokenId = parseInt(activity.erc721TokenId, 16).toString();
        }

        credential.issuedAt = new Date();
        await credential.save();

        try {
          await leaderboardService.updatePoints(holderAddress, 'mint', {
            hours: credential.hoursCompleted || 0
          });
        } catch (e) {
          console.error('Failed to award points from Alchemy webhook:', e.message);
        }
      }
    }

    return res.json(success({}, 'Webhook processed successfully'));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  handleAlchemyWebhook
};
