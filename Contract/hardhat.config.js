require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
require("hardhat-gas-reporter");
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      forking: {
        url: "https://bscrpc.com",
        blockNumber: 28524037
      },
      gasPrice  : 1000000000
    }
  },
  gasReporter: {
    gasPrice: 3,
    enabled: true,
    showMethodSig: true
  }
};
