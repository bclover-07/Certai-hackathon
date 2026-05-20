const mongoose = require("mongoose");

const verificationLogSchema = new mongoose.Schema(
  {
    verifierAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    credentialTokenId: {
      type: Number,
      required: true,
    },
    holderAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    result: {
      type: Boolean,
      required: true,
    },
    purpose: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    txHash: {
      type: String,
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

verificationLogSchema.index({ verifierAddress: 1, verifiedAt: -1 });
verificationLogSchema.index({ credentialTokenId: 1 });
verificationLogSchema.index({ holderAddress: 1 });

module.exports = mongoose.model("VerificationLog", verificationLogSchema);
