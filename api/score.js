// api/score.js
// Simple Express API endpoint for score calculation

const express = require("express");
const { calculateScore } = require("../engine/score-engine");
const router = express.Router();

router.post("/score", async (req, res) => {
  const address = req.query.address || (req.body && req.body.address);
  const weights = req.body && req.body.weights;
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({ error: "Invalid Ethereum address" });
  }
  try {
    const result = await calculateScore(address, weights);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
