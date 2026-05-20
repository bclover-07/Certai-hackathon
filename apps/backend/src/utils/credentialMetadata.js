const buildMetadata = (credential) => {
  const metadata = {
    name: credential.title || "Untitled Credential",
    description: credential.description || `${credential.credentialType} credential issued by ${credential.issuerName}`,
    image: "",
    external_url: "https://certai.vercel.app",
    attributes: [
      {
        trait_type: "Credential Type",
        value: credential.credentialType,
      },
      {
        trait_type: "Issuer",
        value: credential.issuerName,
      },
      {
        trait_type: "Hours Completed",
        display_type: "number",
        value: credential.hoursCompleted || 0,
      },
      {
        trait_type: "AI Confidence",
        display_type: "number",
        value: Math.round((credential.aiConfidence || 0) * 100),
      },
      {
        trait_type: "AI Model",
        value: credential.aiModel || "unknown",
      },
      {
        trait_type: "Status",
        value: credential.status || "pending",
      },
    ],
    properties: {
      holderAddress: credential.holderAddress,
      issuerAddress: credential.issuerAddress || "",
      skills: credential.skills || [],
      issuedAt: credential.issuedAt
        ? new Date(credential.issuedAt).toISOString()
        : new Date().toISOString(),
      expiresAt: credential.expiresAt
        ? new Date(credential.expiresAt).toISOString()
        : null,
      rawClaimText: credential.rawClaimText || "",
    },
  };

  return metadata;
};

module.exports = { buildMetadata };
