const User = require("../models/User");
const LeaderboardEntry = require("../models/LeaderboardEntry");

const POINTS_MAP = {
  credential_minted: 20,
  endorsement_received: 10,
  verification_run: 5,
  hour_logged: 1,
};

const BREAKDOWN_FIELD_MAP = {
  credential_minted: "credentialsMinted",
  endorsement_received: "endorsementsReceived",
  verification_run: "verificationsRun",
  hour_logged: "hoursLogged",
};

const updatePoints = async (walletAddress, action, amount = 1) => {
  const addr = walletAddress.toLowerCase();
  const pointsPerUnit = POINTS_MAP[action];

  if (!pointsPerUnit) {
    throw new Error(`Unknown action: ${action}. Valid actions: ${Object.keys(POINTS_MAP).join(", ")}`);
  }

  const totalPoints = pointsPerUnit * amount;
  const breakdownField = BREAKDOWN_FIELD_MAP[action];

  const userUpdate = {};
  userUpdate[`stats.points`] = totalPoints;
  if (action === "credential_minted") {
    userUpdate["stats.credentialsMinted"] = amount;
  } else if (action === "endorsement_received") {
    userUpdate["stats.endorsementsReceived"] = amount;
  } else if (action === "verification_run") {
    userUpdate["stats.verificationsRun"] = amount;
  } else if (action === "hour_logged") {
    userUpdate["stats.totalHoursLogged"] = amount;
  }

  await User.findOneAndUpdate(
    { walletAddress: addr },
    {
      $inc: userUpdate,
      $set: { lastActiveAt: new Date() },
    },
    { upsert: false }
  );

  const leaderboardInc = { points: totalPoints };
  leaderboardInc[`breakdown.${breakdownField}`] = amount;

  const user = await User.findOne({ walletAddress: addr }).lean();

  const entry = await LeaderboardEntry.findOneAndUpdate(
    { walletAddress: addr },
    {
      $inc: leaderboardInc,
      $set: {
        displayName: user?.profile?.displayName || "",
        organization: user?.profile?.organization || "",
        updatedAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );

  const higherCount = await LeaderboardEntry.countDocuments({
    points: { $gt: entry.points },
  });

  entry.rank = higherCount + 1;
  await entry.save();

  return {
    walletAddress: addr,
    points: entry.points,
    rank: entry.rank,
    added: totalPoints,
  };
};

module.exports = { updatePoints, POINTS_MAP };
