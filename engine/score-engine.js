// score-engine.js
// Aggregates on-chain user data and calculates crypto credit scores

const ethers = require("ethers");

// Example scoring weights
const WEIGHTS = {
  transactions: 0.4,
  staking: 0.3,
  defi: 0.3,
};

// Improved data fetchers (replace with real on-chain queries or APIs)
async function getTransactionScore(address) {
  const provider = new ethers.JsonRpcProvider("https://mainnet.infura.io/v3/6bb4627473f542c1850658b8e67e568d");
  const txCount = await provider.getTransactionCount(address);
  const history = await provider.getHistory(address);
  const volume = history.reduce((sum, tx) => sum + Number(tx.value), 0) / 1e18; // ETH volume
  const firstTx = history.length ? history[0].timestamp : Date.now() / 1000;
  const walletAgeMonths = Math.max(1, Math.round((Date.now() / 1000 - firstTx) / (30 * 24 * 3600)));
  // Score: weighted by count, volume, and age
  let score = 0.4 * Math.min(100, Math.round((txCount / 1000) * 100));
  score += 0.4 * Math.min(100, Math.round((volume / 100) * 100));
  score += 0.2 * Math.min(100, Math.round((walletAgeMonths / 60) * 100));
  return Math.round(score);
}

async function getStakingScore(address) {
  // Simulate: amount staked and average duration
  const amountStaked = 10; // ETH (replace with real query)
  const avgDurationMonths = 6; // months (replace with real query)
  let score = 0.6 * Math.min(100, Math.round((amountStaked / 32) * 100));
  score += 0.4 * Math.min(100, Math.round((avgDurationMonths / 24) * 100));
  return Math.round(score);
}

async function getDeFiScore(address) {
  // Simulate: number of protocols used, no liquidations
  const protocolsUsed = 3; // replace with real query
  const noLiquidations = true; // replace with real query
  let score = 0.7 * Math.min(100, Math.round((protocolsUsed / 10) * 100));
  score += 0.3 * (noLiquidations ? 100 : 50);
  return Math.round(score);
}

// Main scoring function
async function calculateScore(address) {
  const txScore = await getTransactionScore(address);
  const stakingScore = await getStakingScore(address);
  const defiScore = await getDeFiScore(address);

  // Weighted sum
  const score = Math.round(
    txScore * WEIGHTS.transactions +
    stakingScore * WEIGHTS.staking +
    defiScore * WEIGHTS.defi
  );

  // Details for transparency
  const details = JSON.stringify({
    txScore,
    stakingScore,
    defiScore,
    weights: WEIGHTS,
  });

  return { score, details };
}

module.exports = { calculateScore };
