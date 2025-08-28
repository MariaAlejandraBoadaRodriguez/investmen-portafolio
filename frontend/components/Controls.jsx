import React, { useState } from "react";

// 👇 constante global (se evalúa una sola vez)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Controls({ selection }) {
  const [k, setK] = useState(5);
  const [budget, setBudget] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const disabled = loading || k < 1 || k > 7 || budget <= 0;

    // Helpers
  const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const toUsd = (x) => (typeof x === "number" ? USD.format(x) : "—");
  const toPct = (x) => (typeof x === "number" ? `${(x * 100).toFixed(1)}%` : "—");

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
                {a.ticker}: {(a.weight * 100).toFixed(2)}% → {toUsd(a.amount_usd)}
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

          {/* —— Análisis para el cliente —— */}
          <details className="explain" style={{ marginTop: 12 }}>
            <summary><strong>¿Cómo interpretar el resultado?</strong></summary>
            <div style={{ marginTop: 8, lineHeight: 1.4 }}>
              <p>
                <strong>Asignación sugerida.</strong> Los porcentajes son los <em>pesos</em> en la cartera,
                y la flecha “→” indica el <em>monto en dólares</em> a invertir en cada acción según tu
                presupuesto total ({toUsd(result.total_budget_usd)}).
              </p>

              <p>
                <strong>SA</strong> = <em>Simulated Annealing</em> (recocido simulado): algoritmo que explora muchas
                combinaciones y se queda con la que <em>minimiza</em> la función objetivo del modelo.
              </p>

              <p>
                <strong>Retorno anual esperado</strong> (ret. anual esp.) es la rentabilidad media estimada
                de la cartera en un año (no garantizada): <strong>{toPct(result.expected_annual_return)}</strong>.
              </p>

              <p>
                <strong>Volatilidad anual esperada</strong> (vol. anual esp.) es una medida de <em>riesgo</em>
                o variabilidad: <strong>{toPct(result.expected_annual_vol)}</strong>. Valores más altos implican
                más oscilaciones posibles.
              </p>

              <p>
                <strong>C (QUBO)</strong> es el valor de la función objetivo del problema
                <em> Quadratic Unconstrained Binary Optimization</em>. En este análisis fue{" "}
                <strong>{typeof result.C === "number" ? result.C.toFixed(3) : "—"}</strong>.{" "}
                En la práctica: <em>mientras más bajo (más negativo), mejor</em> el equilibrio
                retorno-riesgo bajo las restricciones.
              </p>

              <p className="small">
                Nota: las cifras son estimaciones históricas y no garantizan resultados futuros.
              </p>
            </div>
          </details>
        </div>
      )}

      {result?.error && <p className="small">Error: {result.error}</p>}
    </div>
  );
}