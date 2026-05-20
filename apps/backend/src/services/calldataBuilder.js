const { ethers } = require("ethers");

const MINT_CREDENTIAL_ABI = [
  "function mintCredential(address holder, string credentialType, string title, string issuerName, uint256 hoursCompleted, uint256 expiresAt, string metadataURI)",
];

const buildCredentialCalldata = (credential, walletAddress) => {
  const contractAddress = process.env.CERTNFT_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("CERTNFT_CONTRACT_ADDRESS environment variable is not set");
  }

  const iface = new ethers.Interface(MINT_CREDENTIAL_ABI);

  const holder = ethers.getAddress(walletAddress);
  const credentialType = credential.credentialType || "";
  const title = credential.title || "";
  const issuerName = credential.issuerName || "";
  const hoursCompleted = BigInt(credential.hoursCompleted || 0);

  let expiresAt;
  if (credential.expiresAt) {
    expiresAt = BigInt(Math.floor(new Date(credential.expiresAt).getTime() / 1000));
  } else {
    expiresAt = BigInt(0);
  }

  const metadataURI = credential.metadataURI || "";

  const calldata = iface.encodeFunctionData("mintCredential", [
    holder,
    credentialType,
    title,
    issuerName,
    hoursCompleted,
    expiresAt,
    metadataURI,
  ]);

  return {
    calldata,
    contractAddress,
    to: contractAddress,
    data: calldata,
    value: "0",
  };
};

module.exports = { buildCredentialCalldata };
