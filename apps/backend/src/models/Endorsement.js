const mongoose = require("mongoose");

const endorsementSchema = new mongoose.Schema(
  {
    endorserAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    recipientAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    credentialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Credential",
      default: null,
    },
    credentialTokenId: {
      type: Number,
      default: null,
    },
    skillTag: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
    note: {
      type: String,
      trim: true,
      maxlength: 280,
      default: "",
    },
    txHash: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

endorsementSchema.index({ recipientAddress: 1, createdAt: -1 });
endorsementSchema.index({ endorserAddress: 1, createdAt: -1 });

module.exports = mongoose.model("Endorsement", endorsementSchema);
