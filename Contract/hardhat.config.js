require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
require("hardhat-gas-reporter");
require('dotenv').config()
module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      forking: {
        url: "https://bscrpc.com",
        blockNumber: 28524037
      },
      gasPrice  : 1000000000
    },
    bscTest:{
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: [process.env.WALLET_PRIVATE_KEY.toString()]
    }
  },
  gasReporter: {
    gasPrice: 3,
    enabled: true,
  }
};
