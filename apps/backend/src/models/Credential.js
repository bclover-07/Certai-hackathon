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
    trustLevel: {
      type: String,
      enum: ['self_claimed', 'ai_verified', 'institution_verified'],
      default: 'self_claimed'
    },
    trustScore: { type: Number, default: 0, min: 0, max: 100 },
    trustScoreBreakdown: {
      issuerReputation: { type: Number, default: 0 },
      aiConfidence: { type: Number, default: 0 },
      verificationHistory: { type: Number, default: 0 },
      endorsementCount: { type: Number, default: 0 },
      documentProof: { type: Number, default: 0 },
      institutionApproval: { type: Number, default: 0 }
    },
    trustLevelHistory: [{
      level: String,
      changedBy: { type: String, default: 'system' },
      changedAt: { type: Date, default: Date.now },
      reason: String
    }],
    issuerVerification: {
      verified: { type: Boolean, default: false },
      issuerWallet: { type: String, default: '' },
      verifiedAt: { type: Date, default: null },
      institutionName: { type: String, default: '' }
    },
    documentVerification: {
      uploaded: { type: Boolean, default: false },
      mimeType: { type: String, default: '' },
      ocrText: { type: String, default: '' },
      logoDetected: { type: Boolean, default: false },
      issuerNameMatch: { type: Boolean, default: false },
      titleMatch: { type: Boolean, default: false },
      fraudIndicators: [String],
      documentConfidence: { type: Number, default: 0 },
      analyzedAt: { type: Date, default: null }
    },
    revocation: {
      revokedAt: { type: Date, default: null },
      reason: { type: String, default: '' },
      revokerAddress: { type: String, default: '' }
    },
    bioVerification: {
      bioVerified: { type: Boolean, default: false },
      bioTrustScore: { type: Number, default: 0 },
      livenessScore: { type: Number, default: 0 },
      heartRateAvg: { type: Number, default: 0 },
      stressScore: { type: Number, default: 0 },
      clinicalScore: { type: String, default: '0/3' },
      meshDetected: { type: Boolean, default: false },
      verificationMethod: { type: String, default: '' },
      verifiedAt: { type: Date, default: null }
    },
  },
  {
    timestamps: true,
  }
);

credentialSchema.index({ holderAddress: 1, status: 1 });

credentialSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Credential", credentialSchema);
