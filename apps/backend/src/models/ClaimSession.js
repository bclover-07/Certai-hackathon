const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    credentialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Credential",
      default: null,
    },
  },
  { _id: false }
);

const claimSessionSchema = new mongoose.Schema(
  {
    userAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    agentMemory: {
      extractedSkills: { type: [String], default: [] },
      mentionedOrgs: { type: [String], default: [] },
      estimatedLevel: {
        type: String,
        enum: ["beginner", "intermediate", "advanced", "expert", "unknown"],
        default: "unknown",
      },
      conversationSummary: { type: String, default: "" },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

claimSessionSchema.index({ userAddress: 1, isActive: 1 });
claimSessionSchema.index({ updatedAt: -1 });

module.exports = mongoose.model("ClaimSession", claimSessionSchema);
