const hre = require("hardhat");

async function main() {
  const BulkTransfer = await hre.ethers.getContractFactory("BulkTransfer");
  const bulkTransfer = await BulkTransfer.deploy();

  await bulkTransfer.deployed();

  console.log(
    `BulkTransfer deployed to ${bulkTransfer.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
