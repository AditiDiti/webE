// score-engine.js
// Aggregates on-chain user data and calculates crypto credit scores

const ethers = require("ethers");
const fetch = require("node-fetch");

const COVALENT_API_KEY = "cqt_rQkVgY4GRtGYPmfwDrVTkYYwwHDK";

// Example scoring weights
const WEIGHTS = {
  transactions: 0.15,
  staking: 0.11,
  defi: 0.11,
  governance: 0.09,
  risk: 0.09,
  dex: 0.09,
  tokenTransfers: 0.11,
  nftActivity: 0.11,
  defiPositions: 0.09,
  contractInteractions: 0.05,
};
// Use Covalent API for token transfers (ERC20, ERC721, ERC1155)
async function getTokenTransfersScore(address) {
  const url = `https://api.covalenthq.com/v1/1/address/${address}/transfers_v2/?key=${COVALENT_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const transfers = (data.data && data.data.items) ? data.data.items : [];
  // Count ERC20, ERC721, ERC1155 transfers and also include 'other' types
  const erc20Transfers = transfers.filter(t => t.contract_decimals !== null && t.contract_ticker_symbol);
  const erc721Transfers = transfers.filter(t => t.transfer_type === 'erc721');
async function getWalletAgeScore(address) {
  const url = `https://api.covalenthq.com/v1/1/address/${address}/transactions_v2/?key=${COVALENT_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const txs = data.data.items || [];
  const firstTx = txs.length ? txs[txs.length - 1].block_signed_at : Date.now() / 1000;
  const walletAgeMonths = Math.max(1, Math.round((Date.now() / 1000 - new Date(firstTx).getTime() / 1000) / (30 * 24 * 3600)));
  // Score: older wallets get higher score
  let score = Math.min(100, Math.round((walletAgeMonths / 60) * 100));
  return score;
}

async function getInactivityScore(address) {
  const url = `https://api.covalenthq.com/v1/1/address/${address}/transactions_v2/?key=${COVALENT_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const txs = data.data.items || [];
  if (txs.length === 0) return 0;
  const lastTx = txs[0].block_signed_at;
  const inactivityMonths = Math.max(0, Math.round((Date.now() / 1000 - new Date(lastTx).getTime() / 1000) / (30 * 24 * 3600)));
  // Score: less inactivity gets higher score
  let score = Math.max(0, 100 - Math.round((inactivityMonths / 12) * 100));
  return score;
}

// Historical balances and portfolio changes
async function getHistoricalBalancesScore(address) {
  const url = `https://api.covalenthq.com/v1/1/address/${address}/portfolio_v2/?key=${COVALENT_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const portfolio = data.data.items || [];
  // Score: more growth in portfolio value gets higher score
  if (portfolio.length === 0) return 0;
  const startValue = portfolio[0].quote;
  const endValue = portfolio[portfolio.length - 1].quote;
  const growth = endValue - startValue;
  let score = Math.min(100, Math.round((growth / 1000) * 100));
  return score;
}

// Specific protocol events (staking, governance, etc.)
async function getProtocolEventsScore(address) {
  const url = `https://api.covalenthq.com/v1/1/address/${address}/activity/?key=${COVALENT_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const events = (data.data && data.data.items) ? data.data.items : [];
  // Count protocol-specific events (staking, governance, etc.)
  const protocolKeywords = ['staking', 'governance', 'vote', 'proposal', 'liquidity', 'borrow', 'lend'];
  const protocolEvents = events.filter(e => e.event_type && protocolKeywords.some(keyword => e.event_type.toLowerCase().includes(keyword)));
  let score = Math.min(100, Math.round((protocolEvents.length / 20) * 100));
  return score;
}

  const erc1155Transfers = transfers.filter(t => t.transfer_type === 'erc1155');
  const otherTransfers = transfers.filter(t => t.transfer_type === 'other');
  const totalTransfers = erc20Transfers.length + erc721Transfers.length + erc1155Transfers.length + otherTransfers.length;
  // Lower threshold for sensitivity
  let score = Math.min(100, Math.round((totalTransfers / 20) * 100));
  return score;
}

// Use Covalent API for NFT ownership and activity
async function getNftActivityScore(address) {
  const url = `https://api.covalenthq.com/v1/1/address/${address}/balances_v2/?nft=true&key=${COVALENT_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const tokens = data.data.items || [];
  const nftTokens = tokens.filter(t => t.type === 'nft');
  const nftsOwned = nftTokens.length;
  // Score: weighted by number of NFTs owned, lower threshold
  let score = Math.min(100, Math.round((nftsOwned / 5) * 100));
  return score;
}

// Use Covalent API for DeFi protocol positions (liquidity, lending, borrowing)
async function getDefiPositionsScore(address) {
  const url = `https://api.covalenthq.com/v1/1/address/${address}/balances_v2/?key=${COVALENT_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const tokens = data.data.items || [];
  // Count DeFi tokens (excluding ETH)
  const defiTokens = tokens.filter(t => t.type === 'cryptocurrency' && t.contract_ticker_symbol !== 'ETH');
  // Simulate protocol positions: count tokens with protocol labels
  const protocolTokens = defiTokens.filter(t => t.protocol_metadata && t.protocol_metadata.length > 0);
  const positions = protocolTokens.length;
  // Score: weighted by number of positions, lower threshold
  let score = Math.min(100, Math.round((positions / 3) * 100));
  return score;
}
// Use Covalent API for DEX trading activity
// Use Covalent API for contract interactions (protocol-specific, general smart contracts)
async function getContractInteractionsScore(address) {
  const url = `https://api.covalenthq.com/v1/1/address/${address}/transactions_v2/?key=${COVALENT_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const txs = data.data.items || [];
  // Count unique contracts interacted with
  const contractAddresses = new Set();
  txs.forEach(tx => {
    if (tx.to_address && tx.to_address !== address) {
      contractAddresses.add(tx.to_address.toLowerCase());
    }
  });
  // Score: more unique contracts = higher score, lower threshold
  let score = Math.min(100, Math.round((contractAddresses.size / 5) * 100));
  return score;
}
async function getDexScore(address) {
  // Use Covalent's transactions endpoint to find DEX trades
  const url = `https://api.covalenthq.com/v1/1/address/${address}/transactions_v2/?key=${COVALENT_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const txs = data.data.items || [];
  // Filter for DEX-related transactions (Uniswap, SushiSwap, etc.)
  const dexKeywords = ['uniswap', 'sushiswap', 'swap', 'dex'];
  const dexTxs = txs.filter(tx => {
    if (!tx.to_address_label) return false;
    return dexKeywords.some(keyword => tx.to_address_label.toLowerCase().includes(keyword));
  });
  const dexTrades = dexTxs.length;
  const dexVolume = dexTxs.reduce((sum, tx) => sum + Number(tx.value) / 1e18, 0);
  // Score: weighted by number of trades and volume, lower thresholds
  let score = 0.6 * Math.min(100, Math.round((dexTrades / 10) * 100));
  score += 0.4 * Math.min(100, Math.round((dexVolume / 20) * 100));
  return Math.round(score);
}
// Use Covalent API and simulated logic for oracle usage, KYC, and risk factors
async function getRiskScore(address) {
  // Example: Use Covalent's activity endpoint for oracle usage
  const url = `https://api.covalenthq.com/v1/1/address/${address}/activity/?key=${COVALENT_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const events = (data.data && data.data.items) ? data.data.items : [];
  // Oracle usage: count events with 'oracle' in type
  const oracleEvents = events.filter(e => e.event_type && e.event_type.toLowerCase().includes('oracle'));
  const oracleUsage = oracleEvents.length;
  // KYC: Simulate (real KYC would require off-chain data or protocol-specific)
  // For demo, assume KYC if address has interacted with a known KYC contract (not implemented here)
  const kycVerified = false; // Set to true if you have a KYC registry
  // Risk: Penalize if address has events like 'liquidation', 'flagged', etc.
  const riskyEvents = events.filter(e => e.event_type && (e.event_type.toLowerCase().includes('liquidation') || e.event_type.toLowerCase().includes('flagged')));
  const riskPenalty = riskyEvents.length > 0 ? 50 : 0;
  // Score: oracle usage (positive), KYC (positive), risk (negative), lower threshold
  let score = 0.5 * Math.min(100, Math.round((oracleUsage / 2) * 100));
  score += 0.3 * (kycVerified ? 100 : 0);
  score -= 0.2 * riskPenalty;
  score = Math.max(0, Math.round(score));
  return score;
}
// Use Covalent API for governance participation (DAO votes, proposals)
async function getGovernanceScore(address) {
  // Example: Use Covalent's "address activity" endpoint for governance events
  const url = `https://api.covalenthq.com/v1/1/address/${address}/activity/?key=${COVALENT_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const events = (data.data && data.data.items) ? data.data.items : [];
  // Filter for governance-related events (e.g., votes, proposals)
  const governanceEvents = events.filter(e => {
    return e.event_type && (e.event_type.toLowerCase().includes('vote') || e.event_type.toLowerCase().includes('proposal'));
  });
  const votesCast = governanceEvents.filter(e => e.event_type.toLowerCase().includes('vote')).length;
  const proposalsMade = governanceEvents.filter(e => e.event_type.toLowerCase().includes('proposal')).length;
  // Score: weighted by votes and proposals, lower thresholds
  let score = 0.7 * Math.min(100, Math.round((votesCast / 5) * 100));
  score += 0.3 * Math.min(100, Math.round((proposalsMade / 2) * 100));
  return Math.round(score);
}

// Use Covalent API for transaction history
async function getTransactionScore(address) {
  const url = `https://api.covalenthq.com/v1/1/address/${address}/transactions_v2/?key=${COVALENT_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const txs = data.data.items || [];
  const txCount = txs.length;
  const volume = txs.reduce((sum, tx) => sum + Number(tx.value) / 1e18, 0);
  const firstTx = txs.length ? txs[txs.length - 1].block_signed_at : Date.now() / 1000;
  const walletAgeMonths = Math.max(1, Math.round((Date.now() / 1000 - new Date(firstTx).getTime() / 1000) / (30 * 24 * 3600)));
  // Score: weighted by count, volume, and age, lower thresholds
  let score = 0.4 * Math.min(100, Math.round((txCount / 200) * 100));
  score += 0.4 * Math.min(100, Math.round((volume / 20) * 100));
  score += 0.2 * Math.min(100, Math.round((walletAgeMonths / 12) * 100));
  return Math.round(score);
}

async function getStakingScore(address) {
  // Use Covalent API to fetch staking positions
  const url = `https://api.covalenthq.com/v1/1/address/${address}/staking_positions/?key=${COVALENT_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const positions = (data.data && data.data.items) ? data.data.items : [];
  // Calculate total amount staked and average duration
  let amountStaked = 0;
  let totalDurationDays = 0;
  let count = 0;
  positions.forEach(pos => {
    if (pos.amount && pos.start_date) {
      amountStaked += Number(pos.amount) / 1e18; // assuming amount in wei
      const start = new Date(pos.start_date);
      const now = new Date();
      const durationDays = Math.max(1, Math.round((now - start) / (1000 * 3600 * 24)));
      totalDurationDays += durationDays;
      count++;
    }
  });
  const avgDurationMonths = count ? Math.round((totalDurationDays / count) / 30) : 0;
  // Score: weighted by amount staked and average duration, lower thresholds
  let score = 0.6 * Math.min(100, Math.round((amountStaked / 4) * 100));
  score += 0.4 * Math.min(100, Math.round((avgDurationMonths / 6) * 100));
  return Math.round(score);
}

// Use Covalent API for DeFi protocols and NFT activity
async function getDeFiScore(address) {
  const url = `https://api.covalenthq.com/v1/1/address/${address}/balances_v2/?key=${COVALENT_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const tokens = data.data.items || [];
  // Count DeFi tokens and NFT tokens
  const defiTokens = tokens.filter(t => t.type === 'cryptocurrency' && t.contract_ticker_symbol !== 'ETH');
  const nftTokens = tokens.filter(t => t.type === 'nft');
  const protocolsUsed = defiTokens.length;
  const nftsOwned = nftTokens.length;
  // Simulate no liquidations (real data would require protocol-specific queries)
  const noLiquidations = true;
  let score = 0.5 * Math.min(100, Math.round((protocolsUsed / 3) * 100));
  score += 0.2 * Math.min(100, Math.round((nftsOwned / 3) * 100));
  score += 0.3 * (noLiquidations ? 100 : 50);
  return Math.round(score);
}

// Main scoring function
async function calculateScore(address) {
  const txScore = await getTransactionScore(address);
  const stakingScore = await getStakingScore(address);
  const defiScore = await getDeFiScore(address);
  const governanceScore = await getGovernanceScore(address);
  const riskScore = await getRiskScore(address);
  const dexScore = await getDexScore(address);
  const tokenTransfersScore = await getTokenTransfersScore(address);
  const nftActivityScore = await getNftActivityScore(address);
  const defiPositionsScore = await getDefiPositionsScore(address);
  const contractInteractionsScore = await getContractInteractionsScore(address);

  // Weighted sum
  const score = Math.round(
    txScore * WEIGHTS.transactions +
    stakingScore * WEIGHTS.staking +
    defiScore * WEIGHTS.defi +
    governanceScore * WEIGHTS.governance +
    riskScore * WEIGHTS.risk +
    dexScore * WEIGHTS.dex +
    tokenTransfersScore * WEIGHTS.tokenTransfers +
    nftActivityScore * WEIGHTS.nftActivity +
    defiPositionsScore * WEIGHTS.defiPositions +
    contractInteractionsScore * WEIGHTS.contractInteractions
  );

  // Details for transparency
  const details = JSON.stringify({
    txScore,
    stakingScore,
    defiScore,
    governanceScore,
    riskScore,
    dexScore,
    tokenTransfersScore,
    nftActivityScore,
    defiPositionsScore,
    contractInteractionsScore,
    weights: WEIGHTS,
  });

  return { score, details };
}

module.exports = { calculateScore };
