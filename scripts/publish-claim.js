// publish-claim.js
// Publishes calculated score to ScoreRegistry smart contract

const { ethers } = require("ethers");
const { calculateScore } = require("../engine/score-engine");

// Replace with your deployed contract address and ABI
const SCORE_REGISTRY_ADDRESS = "<YOUR_CONTRACT_ADDRESS>";
const SCORE_REGISTRY_ABI = [
  "function updateScore(address user, uint256 newScore, string calldata details) external"
];

async function publishScore(userAddress, provider, signer) {
  const { score, details } = await calculateScore(userAddress);
  const contract = new ethers.Contract(SCORE_REGISTRY_ADDRESS, SCORE_REGISTRY_ABI, signer);
  const tx = await contract.updateScore(userAddress, score, details);
  await tx.wait();
  console.log(`Score published for ${userAddress}: ${score}`);
}

module.exports = { publishScore };
