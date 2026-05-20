export const CERTNFT_ADDRESS = "0x0000000000000000000000000000000000000001" as const;
export const CERTVERIFIER_ADDRESS = "0x0000000000000000000000000000000000000002" as const;
export const PEERENDORSE_ADDRESS = "0x0000000000000000000000000000000000000003" as const;

export const BASE_SEPOLIA_CHAIN_ID = 84532;

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export const CREDENTIAL_TYPES = {
  CERTIFICATION: "certification",
  LICENSE: "license",
  DEGREE: "degree",
  CPE: "cpe",
  RESIDENCY: "residency",
  FELLOWSHIP: "fellowship",
  BOARD_CERT: "board_certification",
  TRAINING: "training",
} as const;

export type CredentialType =
  (typeof CREDENTIAL_TYPES)[keyof typeof CREDENTIAL_TYPES];

export const CREDENTIAL_TYPE_LABELS: Record<CredentialType, string> = {
  certification: "Certification",
  license: "License",
  degree: "Degree",
  cpe: "CPE Credit",
  residency: "Residency",
  fellowship: "Fellowship",
  board_certification: "Board Certification",
  training: "Training",
};

export const CREDENTIAL_TYPE_COLORS: Record<
  CredentialType,
  { bg: string; text: string; border: string }
> = {
  certification: {
    bg: "rgba(0, 212, 255, 0.1)",
    text: "#00d4ff",
    border: "rgba(0, 212, 255, 0.3)",
  },
  license: {
    bg: "rgba(124, 58, 237, 0.1)",
    text: "#7c3aed",
    border: "rgba(124, 58, 237, 0.3)",
  },
  degree: {
    bg: "rgba(16, 185, 129, 0.1)",
    text: "#10b981",
    border: "rgba(16, 185, 129, 0.3)",
  },
  cpe: {
    bg: "rgba(236, 72, 153, 0.1)",
    text: "#ec4899",
    border: "rgba(236, 72, 153, 0.3)",
  },
  residency: {
    bg: "rgba(245, 158, 11, 0.1)",
    text: "#f59e0b",
    border: "rgba(245, 158, 11, 0.3)",
  },
  fellowship: {
    bg: "rgba(99, 102, 241, 0.1)",
    text: "#6366f1",
    border: "rgba(99, 102, 241, 0.3)",
  },
  board_certification: {
    bg: "rgba(14, 165, 233, 0.1)",
    text: "#0ea5e9",
    border: "rgba(14, 165, 233, 0.3)",
  },
  training: {
    bg: "rgba(168, 85, 247, 0.1)",
    text: "#a855f7",
    border: "rgba(168, 85, 247, 0.3)",
  },
};

export const CERTNFT_ABI = [
  {
    inputs: [
      { name: "holder", type: "address" },
      { name: "credentialHash", type: "bytes32" },
      { name: "metadataURI", type: "string" },
    ],
    name: "mintCredential",
    outputs: [{ name: "tokenId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "holder", type: "address" }],
    name: "getHolderCredentials",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "isValid",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "credentials",
    outputs: [
      { name: "holder", type: "address" },
      { name: "credentialHash", type: "bytes32" },
      { name: "metadataURI", type: "string" },
      { name: "issuedAt", type: "uint256" },
      { name: "isRevoked", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const CERTVERIFIER_ABI = [
  {
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "holder", type: "address" },
    ],
    name: "verify",
    outputs: [{ name: "isValid", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "getVerificationCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const PEERENDORSE_ABI = [
  {
    inputs: [
      { name: "credentialHolder", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "skill", type: "string" },
      { name: "comment", type: "string" },
    ],
    name: "endorse",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "holder", type: "address" }],
    name: "getEndorsementsForAddress",
    outputs: [
      {
        components: [
          { name: "endorser", type: "address" },
          { name: "tokenId", type: "uint256" },
          { name: "skill", type: "string" },
          { name: "comment", type: "string" },
          { name: "timestamp", type: "uint256" },
        ],
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const UGF_PAYMENT_COIN = "TYI_MOCK_USD" as const;
export const UGF_CHAIN_ID = 84532;

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Claim Credential", href: "/dashboard/claim", icon: "🎯" },
  { label: "3D World", href: "/dashboard/world", icon: "🌐" },
  { label: "Verify", href: "/dashboard/verify", icon: "✅" },
  { label: "My Credentials", href: "/dashboard/issued", icon: "📜" },
  { label: "Endorsements", href: "/dashboard/endorsements", icon: "🤝" },
  { label: "Leaderboard", href: "/dashboard/leaderboard", icon: "🏆" },
  { label: "Profile", href: "/dashboard/profile", icon: "👤" },
] as const;

export const ISSUER_NAV_ITEMS = [
  { label: "Issue", href: "/dashboard/issue", icon: "📝" },
] as const;
