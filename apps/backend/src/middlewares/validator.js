const WALLET_REGEX = /^0x[a-fA-F0-9]{40}$/;

const validateClaim = (req, res, next) => {
  const { claimText, walletAddress } = req.body;

  const errors = [];

  if (!claimText || typeof claimText !== "string" || claimText.trim().length === 0) {
    errors.push("claimText is required and must be a non-empty string.");
  } else if (claimText.length > 600) {
    errors.push("claimText must not exceed 600 characters.");
  }

  if (!walletAddress || typeof walletAddress !== "string") {
    errors.push("walletAddress is required.");
  } else if (!WALLET_REGEX.test(walletAddress)) {
    errors.push("walletAddress must be a valid Ethereum address (0x + 40 hex chars).");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors,
    });
  }

  req.body.claimText = claimText.trim();
  req.body.walletAddress = walletAddress.toLowerCase();
  next();
};

const validateEndorsement = (req, res, next) => {
  const { endorserAddress, recipientAddress, skillTag } = req.body;

  const errors = [];

  if (!endorserAddress || !WALLET_REGEX.test(endorserAddress)) {
    errors.push("endorserAddress must be a valid Ethereum address.");
  }

  if (!recipientAddress || !WALLET_REGEX.test(recipientAddress)) {
    errors.push("recipientAddress must be a valid Ethereum address.");
  }

  if (endorserAddress && recipientAddress && endorserAddress.toLowerCase() === recipientAddress.toLowerCase()) {
    errors.push("Cannot endorse yourself.");
  }

  if (!skillTag || typeof skillTag !== "string" || skillTag.trim().length === 0) {
    errors.push("skillTag is required.");
  }

  if (req.body.note && req.body.note.length > 280) {
    errors.push("note must not exceed 280 characters.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors,
    });
  }

  req.body.endorserAddress = endorserAddress.toLowerCase();
  req.body.recipientAddress = recipientAddress.toLowerCase();
  next();
};

const validateVerification = (req, res, next) => {
  const { verifierAddress, credentialTokenId } = req.body;

  const errors = [];

  if (!verifierAddress || !WALLET_REGEX.test(verifierAddress)) {
    errors.push("verifierAddress must be a valid Ethereum address.");
  }

  if (credentialTokenId === undefined || credentialTokenId === null || typeof credentialTokenId !== "number") {
    errors.push("credentialTokenId is required and must be a number.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors,
    });
  }

  req.body.verifierAddress = verifierAddress.toLowerCase();
  next();
};

module.exports = { validateClaim, validateEndorsement, validateVerification };
