const LeaderboardEntry = require('../models/LeaderboardEntry');
const { syncAllUsersToLeaderboard } = require('../services/leaderboardService');
const User = require('../models/User');
const { success, error } = require('../utils/responseHelper');

const getLeaderboard = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    // Sync all onboarded users first to make sure 100% representation
    await syncAllUsersToLeaderboard();

    const entries = await LeaderboardEntry.find()
      .sort({ points: -1 })
      .limit(limit);

    // Dynamically assign mathematically correct ranks to prevent tie-breaking/stale state bugs
    const rankedEntries = entries.map((entry, idx) => {
      const obj = entry.toObject();
      obj.rank = idx + 1;
      return obj;
    });

    return res.json(success(rankedEntries));
  } catch (err) {
    next(err);
  }
};

const getUserRank = async (req, res, next) => {
  try {
    const { address } = req.params;
    const addr = address.toLowerCase();

    let entry = await LeaderboardEntry.findOne({ walletAddress: addr });

    // If entry not found in leaderboard (e.g. newly onboarded scholar with 0 points),
    // let's fetch them from User model and initialize on the fly to avoid 404 error
    if (!entry) {
      const user = await User.findOne({ walletAddress: addr });
      if (!user) {
        return res.status(404).json(error('User not found'));
      }

      entry = await LeaderboardEntry.findOneAndUpdate(
        { walletAddress: addr },
        {
          $setOnInsert: {
            walletAddress: addr,
            points: user.stats?.points || 0,
            breakdown: {
              credentialsMinted: user.stats?.credentialsMinted || 0,
              endorsementsReceived: user.stats?.endorsementsReceived || 0,
              verificationsRun: user.stats?.verificationsRun || 0,
              hoursLogged: user.stats?.totalHoursLogged || 0,
            }
          },
          $set: {
            displayName: user.profile?.displayName || `Scholar ${addr.substring(0, 8)}`,
            organization: user.profile?.organization || "No Affiliation",
            updatedAt: new Date()
          }
        },
        { upsert: true, new: true }
      );
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

