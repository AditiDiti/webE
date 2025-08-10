
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
          <pre style={{
            background: "#e0e7ff",
            padding: 16,
            borderRadius: 8,
            fontSize: "0.95rem",
            color: "#1e293b",
            overflowX: "auto"
          }}>{details}</pre>
        </div>
      )}
    </div>
  );
}

export default ScoreChecker;
