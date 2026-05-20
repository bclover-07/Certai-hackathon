const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    privyUserId: {
      type: String,
      sparse: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    profile: {
      displayName: { type: String, trim: true, default: "" },
      organization: { type: String, trim: true, default: "" },
      specialty: { type: String, trim: true, default: "" },
      role: {
        type: String,
        enum: ["learner", "issuer", "verifier", "admin"],
        default: "learner",
      },
      avatarUrl: { type: String, default: "" },
      bio: { type: String, maxlength: 500, default: "" },
    },
    stats: {
      credentialsMinted: { type: Number, default: 0 },
      endorsementsReceived: { type: Number, default: 0 },
      verificationsRun: { type: Number, default: 0 },
      totalHoursLogged: { type: Number, default: 0 },
      points: { type: Number, default: 0 },
    },
    aiMemory: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ "stats.points": -1 });

module.exports = mongoose.model("User", userSchema);
