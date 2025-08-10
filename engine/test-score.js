// test-score.js
// Test script for score-engine.js

const { calculateScore } = require("./score-engine");

async function main() {
  // Replace with any valid Ethereum address
  const address = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
  const result = await calculateScore(address);
  console.log(`Score for ${address}:`, result);
}

main().catch(console.error);
