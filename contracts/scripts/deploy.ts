import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  console.log("\n--- Deploying CertNFT ---");
  const CertNFT = await ethers.getContractFactory("CertNFT");
  const certNFT = await CertNFT.deploy(deployer.address);
  await certNFT.waitForDeployment();
  const certNFTAddress = await certNFT.getAddress();
  console.log("CertNFT deployed to:", certNFTAddress);

  console.log("\n--- Deploying CertVerifier ---");
  const CertVerifier = await ethers.getContractFactory("CertVerifier");
  const certVerifier = await CertVerifier.deploy(certNFTAddress);
  await certVerifier.waitForDeployment();
  const certVerifierAddress = await certVerifier.getAddress();
  console.log("CertVerifier deployed to:", certVerifierAddress);

  console.log("\n--- Deploying PeerEndorse ---");
  const PeerEndorse = await ethers.getContractFactory("PeerEndorse");
  const peerEndorse = await PeerEndorse.deploy();
  await peerEndorse.waitForDeployment();
  const peerEndorseAddress = await peerEndorse.getAddress();
  console.log("PeerEndorse deployed to:", peerEndorseAddress);

  const deployed = {
    network: "base-sepolia",
    chainId: 84532,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {
      CertNFT: certNFTAddress,
      CertVerifier: certVerifierAddress,
      PeerEndorse: peerEndorseAddress,
    },
  };

  const outputPath = path.join(__dirname, "..", "deployed.json");
  fs.writeFileSync(outputPath, JSON.stringify(deployed, null, 2));
  console.log("\nDeployed addresses written to:", outputPath);

  console.log("\n========================================");
  console.log("  CERTAI Deployment Summary");
  console.log("========================================");
  console.log(`  CertNFT:       ${certNFTAddress}`);
  console.log(`  CertVerifier:  ${certVerifierAddress}`);
  console.log(`  PeerEndorse:   ${peerEndorseAddress}`);
  console.log("========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
