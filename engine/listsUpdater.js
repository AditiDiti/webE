// listsUpdater.js
const axios = require('axios');
const fs = require('fs');
const cron = require('node-cron');

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "P3HFWEH1V4AVAXTZHIPKQIWKXU3W4SY8CF";

// Example: fetch verified contract addresses from Etherscan
async function fetchAllowlist() {
  // Example: Use Etherscan labels API (Pro plan required)
  // This is a placeholder for actual dynamic fetching
  // For demo, we use static protocol addresses
  const allowlist = [
    "0x00000000219ab540356cbb839cbe05303d7705fa", // Beacon Deposit
    "0xe592427a0aece92de3edee1f18e0157c05861564", // Uniswap V3 Router
    "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9", // Aave LendingPool V2
    "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
    "0x0000000022d53366457f9d5e68ec105046fc4383"  // Curve
  ];

  // Example: If you have Etherscan Pro, you could fetch protocol addresses dynamically
  // try {
  //   const res = await axios.get(`https://api.etherscan.io/api`, {
  //     params: {
  //       module: "account",
  //       action: "getcontractcreation",
  //       address: "uniswap", // Replace with actual contract address or label
  //       apikey: ETHERSCAN_API_KEY
  //     }
  //   });
  //   // Parse and push addresses to allowlist
  // } catch (err) {
  //   console.error("Error fetching from Etherscan:", err.message);
  // }

  return allowlist;
}

// Example: fetch scam addresses from Chainabuse
async function fetchDenylist() {
  // Static scam addresses
  const staticScams = [
    "0x997114ca0830e9bee7443368fa27f4af2d4e55a6", // PlusToken
    "0x3fdb3f5f5e8530c9f2aacf8a3dcef45e1d6b18f3", // OneCoin
    "0x2a65aca4d5fc5b5c859090a6c34d164135398226", // Fake MEW
    "0x7cB57B5A97eAbe94205C07890BE4c1aD31E486A8", // Cryptopia
    "0x489a7a5e0f76bcbf02a019b9334e9f3cc0f92d5f"  // BSC Bridge Exploit
  ];
  try {
    // Placeholder: Chainabuse has a GraphQL endpoint for public data
    const res = await axios.get("https://api.chainabuse.com/api/v1/scams");
    const chainabuseScams = res.data.data.map(scam => scam.address.toLowerCase());
    return Array.from(new Set([...staticScams, ...chainabuseScams]));
  } catch (err) {
    console.error("Error fetching scams:", err.message);
    return staticScams;
  }
}

async function updateLists() {
  const allowlist = await fetchAllowlist();
  const denylist = await fetchDenylist();

  fs.writeFileSync("./lists.json", JSON.stringify({ allowlist, denylist }, null, 2));
  console.log("✅ Lists updated:", new Date().toISOString());
}

// Run every Monday at 2am UTC
cron.schedule("0 2 * * MON", updateLists);

// Run immediately on startup
updateLists();
