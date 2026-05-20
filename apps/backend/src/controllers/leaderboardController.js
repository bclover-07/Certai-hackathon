const LeaderboardEntry = require('../models/LeaderboardEntry');
const { success, error } = require('../utils/responseHelper');

const getLeaderboard = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const entries = await LeaderboardEntry.find()
      .sort({ points: -1 })
      .limit(limit);

    return res.json(success(entries));
  } catch (err) {
    next(err);
  }
};

const getUserRank = async (req, res, next) => {
  try {
    const { address } = req.params;
    const entry = await LeaderboardEntry.findOne({ walletAddress: address.toLowerCase() });

    if (!entry) {
      return res.status(404).json(error('Leaderboard entry not found'));
    }

    const higherEntriesCount = await LeaderboardEntry.countDocuments({
      points: { $gt: entry.points }
    });

    const rank = higherEntriesCount + 1;

    return res.json(success({
      entry,
      rank
    }));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLeaderboard,
  getUserRank
};
