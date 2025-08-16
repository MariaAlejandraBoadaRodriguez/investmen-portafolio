import React, { useState } from "react";

// 👇 constante global (se evalúa una sola vez)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Controls({ selection }) {
  const [k, setK] = useState(5);
  const [budget, setBudget] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const disabled = loading || k < 1 || k > 7 || budget <= 0;

  const handleOptimize = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/optimize`, {   // 👈 aquí usas API_URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // universo: si el usuario no elige nada, el backend usa los 150 por defecto
          tickers: selection.length ? selection : [],
          // M = k (1–7)
          k: Number(k),
          budget_usd: Number(budget),

          // --- Parámetros discretos opcionales (puedes exponerlos en UI si quieres) ---
          q: 3,            // qubits por activo (resolución de pesos 2^q niveles)
          B_units: 10,     // suma(y)=B => paso de peso = 1/B
          lam_risk: 1.0,
          lam_ret: 0.5,
          lam_budget: 10.0,
        }),
      });

      // Manejo de errores HTTP
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="section-title">Parámetros</h3>
      <div className="controls">
        <label>
          Número de acciones (1–7)
          <input
            className="input"
            type="number"
            min={1}
            max={7}
            value={k}
            onChange={(e) => setK(e.target.value)}
          />
        </label>
        <label>
          Valor a invertir (USD)
          <input
            className="input"
            type="number"
            min={100}
            step={100}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </label>
        <button className="button" onClick={handleOptimize} disabled={disabled}>
          {loading ? "Optimizando…" : "Optimizar cartera"}
        </button>
      </div>

      {result && !result.error && (
        <div className="result">
          <div className="kicker">
            Resultado{result.method ? ` (${result.method})` : ""}
          </div>
          <ul>
            {result.selected?.map((a) => (
              <li key={a.ticker}>
                {a.ticker}: {(a.weight * 100).toFixed(2)}% → $
                {a.amount_usd.toLocaleString()}
              </li>
            ))}
          </ul>
          <div className="small">
            Ret. anual esp.:{" "}
            {typeof result.expected_annual_return === "number"
              ? result.expected_annual_return.toFixed(3)
              : "—"}{" "}
            • Vol. anual esp.:{" "}
            {typeof result.expected_annual_vol === "number"
              ? result.expected_annual_vol.toFixed(3)
              : "—"}{" "}
            • C (QUBO):{" "}
            {typeof result.C === "number" ? result.C.toFixed(3) : "—"}
          </div>
        </div>
      )}

      {result?.error && <p className="small">Error: {result.error}</p>}
    </div>
  );
}
