import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const Registry = await ethers.getContractFactory("AgentRegistry");
  const registry = await Registry.deploy();
  await registry.deployed();

  console.log("AgentRegistry deployed to:", registry.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
