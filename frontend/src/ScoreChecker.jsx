
import React, { useState } from "react";

function ScoreChecker() {
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
      const res = await fetch(`/api/score?address=${address}`);
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
      {score !== null && (
        <div style={{
          marginTop: 32,
          padding: 24,
          borderRadius: 12,
          background: "#f1f5f9",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
        }}>
          <h2 style={{ color: "#6366f1", fontWeight: 700, fontSize: "1.5rem", marginBottom: 12 }}>
            Score: {score}
          </h2>
          <div style={{ fontSize: "1rem", color: "#334155", marginBottom: 8 }}>Details:</div>
          {details && (() => {
            let parsed;
            try {
              parsed = JSON.parse(details);
            } catch {
              return <pre>{details}</pre>;
            }
            const weights = parsed.weights || {};
            // Map frontend keys to backend weight keys
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
            const rows = Object.entries(parsed)
              .filter(([k]) => k !== 'weights')
              .map(([k, v]) => (
                <tr key={k}>
                  <td style={{ padding: '6px 12px', fontWeight: 500, color: '#6366f1', textTransform: 'capitalize' }}>{k.replace(/Score$/, '').replace(/([A-Z])/g, ' $1').trim()}</td>
                  <td style={{ padding: '6px 12px', color: '#334155' }}>{v}</td>
                  <td style={{ padding: '6px 12px', color: '#64748b' }}>{weights[keyMap[k]] !== undefined ? weights[keyMap[k]] : '-'}</td>
                </tr>
              ));
            return (
              <table style={{ width: '100%', background: '#e0e7ff', borderRadius: 8, marginTop: 8, fontSize: '0.98rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#6366f1', color: 'white' }}>
                    <th style={{ padding: '8px 12px', borderRadius: '8px 0 0 0', textAlign: 'left' }}>Factor</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Value</th>
                    <th style={{ padding: '8px 12px', borderRadius: '0 8px 0 0', textAlign: 'left' }}>Weight</th>
                  </tr>
                </thead>
                <tbody>{rows}</tbody>
              </table>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default ScoreChecker;
