const mongoose = require("mongoose");

const leaderboardEntrySchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
      default: "",
    },
    organization: {
      type: String,
      trim: true,
      default: "",
    },
    points: {
      type: Number,
      default: 0,
      index: true,
    },
    rank: {
      type: Number,
      default: 0,
    },
    breakdown: {
      credentialsMinted: { type: Number, default: 0 },
      endorsementsReceived: { type: Number, default: 0 },
      verificationsRun: { type: Number, default: 0 },
      hoursLogged: { type: Number, default: 0 },
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

leaderboardEntrySchema.index({ points: -1 });

module.exports = mongoose.model("LeaderboardEntry", leaderboardEntrySchema);
