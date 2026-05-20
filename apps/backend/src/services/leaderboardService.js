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
  
  let normalizedAction = action;
  let hours = 0;
  
  if (action === "mint") {
    normalizedAction = "credential_minted";
    if (amount && typeof amount === "object" && amount.hours) {
      hours = amount.hours;
    }
  } else if (action === "endorse") {
    normalizedAction = "endorsement_received";
  } else if (action === "verify") {
    normalizedAction = "verification_run";
  }
  
  const actualAmount = (amount && typeof amount === "object") ? 1 : amount;
  const pointsPerUnit = POINTS_MAP[normalizedAction];
  
  if (!pointsPerUnit) {
    throw new Error(`Unknown action: ${normalizedAction}. Valid actions: ${Object.keys(POINTS_MAP).join(", ")}`);
  }
  
  const totalPoints = pointsPerUnit * actualAmount;
  const breakdownField = BREAKDOWN_FIELD_MAP[normalizedAction];
  
  const userUpdate = {};
  userUpdate[`stats.points`] = totalPoints;
  if (normalizedAction === "credential_minted") {
    userUpdate["stats.credentialsMinted"] = actualAmount;
  } else if (normalizedAction === "endorsement_received") {
    userUpdate["stats.endorsementsReceived"] = actualAmount;
  } else if (normalizedAction === "verification_run") {
    userUpdate["stats.verificationsRun"] = actualAmount;
  } else if (normalizedAction === "hour_logged") {
    userUpdate["stats.totalHoursLogged"] = actualAmount;
  }

  if (hours > 0) {
    try {
      await updatePoints(walletAddress, "hour_logged", hours);
    } catch (err) {
      console.error("Failed to update points for hours logged:", err.message);
    }
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
