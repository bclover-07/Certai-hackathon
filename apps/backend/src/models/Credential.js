const mongoose = require("mongoose");

const credentialSchema = new mongoose.Schema(
  {
    tokenId: {
      type: Number,
      sparse: true,
    },
    txHash: {
      type: String,
      default: null,
    },
    holderAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    issuerAddress: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
    credentialType: {
      type: String,
      required: true,
      enum: [
        "medical_training",
        "academic_credential",
        "professional_certification",
        "continuing_education",
        "clinical_rotation",
        "research_publication",
        "workshop_seminar",
        "license_renewal",
        "volunteer_service",
      ],
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    issuerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    hoursCompleted: {
      type: Number,
      default: 0,
      min: 0,
      max: 50000,
    },
    skills: {
      type: [String],
      default: [],
    },
    rawClaimText: {
      type: String,
      required: true,
    },
    aiConfidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
    aiModel: {
      type: String,
      default: "gemini-2.5-flash",
    },
    status: {
      type: String,
      enum: ["pending", "minting", "active", "expired", "revoked"],
      default: "pending",
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    verificationCount: {
      type: Number,
      default: 0,
    },
    calldata: {
      type: String,
      default: null,
    },
    contractAddress: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

credentialSchema.index({ holderAddress: 1, status: 1 });

credentialSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Credential", credentialSchema);
