
import React, { useState } from "react";
import { utils as XLSXUtils, writeFile as XLSXWriteFile } from "xlsx";

function ScoreChecker() {
  function handleDownloadExcel() {
    if (!details) return;
    let parsed;
    try {
      parsed = JSON.parse(details);
    } catch {
      return;
    }
    const keyMap = {
      txScore: 'transactions',
      stakingScore: 'staking',
      defiScore: 'defi',
      governanceScore: 'governance',
      riskScore: 'risk',
      dexScore: 'dex',
      tokenTransfersScore: 'tokenTransfers',
      nftActivityScore: 'nftActivity',
      defiPositionsScore: 'defiPositions',
      contractInteractionsScore: 'contractInteractions',
    };
    const rows = Object.entries(keyMap).map(([frontendKey, backendKey]) => {
      const raw = parsed[frontendKey] || 0;
      const weight = weights[backendKey] || 0;
      const weighted = raw * weight;
      return {
        Factor: frontendKey.replace(/Score$/, '').replace(/([A-Z])/g, ' $1').trim(),
        RawValue: raw,
        Weight: weight,
        WeightedValue: weighted,
      };
    });
    const totalScore = rows.reduce((a, b) => a + b.WeightedValue, 0);
    rows.push({ Factor: 'Total Score', RawValue: '', Weight: '', WeightedValue: Math.round(totalScore) });
    const ws = XLSXUtils.json_to_sheet(rows);
    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(wb, ws, "CreditScore");
    XLSXWriteFile(wb, "credit_score.xlsx");
  }
  const defaultWeights = {
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

  function handleResetWeights() {
    setWeights(defaultWeights);
  }
  const [weights, setWeights] = useState(defaultWeights);

  function handleWeightChange(key, value) {
    setWeights(w => ({
      ...w,
      [key]: Math.max(0, Math.min(1, Number(value)))
    }));
  }
  const [address, setAddress] = useState("");
  const [score, setScore] = useState(null);
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchScore() {
    setLoading(true);
    setError("");
    setScore(null);
    setDetails("");
    try {
    const res = await fetch(`/api/score?address=${address}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weights })
    });
      if (!res.ok) throw new Error("Failed to fetch score");
      const data = await res.json();
      setScore(data.score);
      setDetails(data.details);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  return (
    <div style={{
      maxWidth: 480,
      margin: "3rem auto",
      padding: 32,
      borderRadius: 16,
      boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      background: "linear-gradient(135deg,#f8fafc 60%,#e0e7ff 100%)"
    }}>
      <h1 style={{
        textAlign: "center",
        fontWeight: 700,
        fontSize: "2rem",
        marginBottom: 24,
        color: "#3b82f6"
      }}>
        Crypto Credit Score
      </h1>
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Enter Ethereum address"
          value={address}
          onChange={e => setAddress(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            fontSize: "1rem",
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            outline: "none",
            marginBottom: 8
          }}
        />
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <strong>Adjust Weights (0-1):</strong>
            <button
              type="button"
              onClick={handleResetWeights}
              style={{
                padding: '6px 18px',
                background: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1rem',
                boxShadow: '0 2px 8px rgba(99,102,241,0.08)'
              }}
            >
              Reset to Default
            </button>
          </div>
          <div style={{ marginTop: 4 }}>
            {Object.entries(weights).map(([key, value]) => (
              <div key={key} style={{ margin: "6px 0", display: 'flex', alignItems: 'center' }}>
                <label style={{ marginRight: 8, textTransform: "capitalize", minWidth: 120 }}>{key}:</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={value}
                  onChange={e => handleWeightChange(key, e.target.value)}
                  style={{ width: 60, padding: "2px 6px", borderRadius: 4, border: "1px solid #cbd5e1" }}
                />
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={fetchScore}
          disabled={loading || !address}
          style={{
            width: "100%",
            padding: "12px 0",
            fontSize: "1rem",
            background: loading ? "#a5b4fc" : "#6366f1",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: loading || !address ? "not-allowed" : "pointer",
            fontWeight: 600,
            boxShadow: "0 2px 8px rgba(99,102,241,0.08)"
          }}
        >
          {loading ? "Checking..." : "Check Score"}
        </button>
      </div>
      {error && <div style={{ color: "#ef4444", marginTop: 12, textAlign: "center" }}>{error}</div>}
      {details && (() => {
        let parsed;
        try {
          parsed = JSON.parse(details);
        } catch {
          return <pre>{details}</pre>;
        }
        const keyMap = {
          txScore: 'transactions',
          stakingScore: 'staking',
          defiScore: 'defi',
          governanceScore: 'governance',
          riskScore: 'risk',
          dexScore: 'dex',
          tokenTransfersScore: 'tokenTransfers',
          nftActivityScore: 'nftActivity',
          defiPositionsScore: 'defiPositions',
          contractInteractionsScore: 'contractInteractions',
        };
        // Only show table if at least one factor value exists
        const hasValues = Object.keys(keyMap).some(k => parsed[k] !== undefined);
        if (!hasValues) {
          return <div style={{ color: '#64748b', marginTop: 16, textAlign: 'center' }}>No score details available for this address.</div>;
        }
        // Calculate score using current weights
        const scoreValue = Object.entries(keyMap)
          .map(([frontendKey, backendKey]) => (parsed[frontendKey] || 0) * (weights[backendKey] || 0))
          .reduce((a, b) => a + b, 0);
        const rows = Object.entries(keyMap)
          .map(([frontendKey, backendKey]) => {
            const raw = parsed[frontendKey] || 0;
            const weight = weights[backendKey] || 0;
            const weighted = raw * weight;
            return {
              Factor: frontendKey.replace(/Score$/, '').replace(/([A-Z])/g, ' $1').trim(),
              RawValue: raw,
              Weight: weight,
              WeightedValue: weighted,
            };
          });
        const totalScore = rows.reduce((a, b) => a + b.WeightedValue, 0);
        rows.push({ Factor: 'Total Score', RawValue: '', Weight: '', WeightedValue: Math.round(totalScore) });
        return (
          <div>
            <h2 style={{ color: "#6366f1", fontWeight: 700, fontSize: "1.5rem", marginBottom: 12 }}>
              Score: {Math.round(scoreValue)}
            </h2>
            <button
              onClick={handleDownloadExcel}
              style={{
                marginBottom: 16,
                padding: '8px 20px',
                background: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(99,102,241,0.08)'
              }}
            >
              Download Excel
            </button>
            <div style={{ fontSize: "1rem", color: "#334155", marginBottom: 8 }}>Details:</div>
            <table style={{ width: '100%', background: '#e0e7ff', borderRadius: 8, marginTop: 8, fontSize: '0.98rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#6366f1', color: 'white' }}>
                  <th style={{ padding: '8px 12px', borderRadius: '8px 0 0 0', textAlign: 'left' }}>Factor</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Raw Value</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Weight</th>
                  <th style={{ padding: '8px 12px', borderRadius: '0 8px 0 0', textAlign: 'left' }}>Weighted Value</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.Factor + i}>
                    <td style={{ padding: '6px 12px', fontWeight: 500, color: '#6366f1', textTransform: 'capitalize' }}>{row.Factor}</td>
                    <td style={{ padding: '6px 12px', color: '#334155' }}>{row.RawValue}</td>
                    <td style={{ padding: '6px 12px', color: '#64748b' }}>{row.Weight}</td>
                    <td style={{ padding: '6px 12px', color: '#0f172a', fontWeight: row.Factor === 'Total Score' ? 700 : 400 }}>{row.WeightedValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}
    </div>
  );
}

export default ScoreChecker;
