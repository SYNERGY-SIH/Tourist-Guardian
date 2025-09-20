require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */

// Get the environment variables from your .env file
const { API_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.24", // Make sure this matches your contract's pragma
  networks: {
    sepolia: {
      url: API_URL,
      accounts: [PRIVATE_KEY],
    },
  },
};