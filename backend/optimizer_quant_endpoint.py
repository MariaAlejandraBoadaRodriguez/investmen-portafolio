# -*- coding: utf-8 -*-
from typing import List
import numpy as np
from data_loader import load_close_from_csv
from quantum_opt import (
    returns_annualized, preselect_assets, build_qubo_discrete,
    run_sa, decode_weights
)

def optimize_discrete(tickers: List[str], k: int, budget: float,
                      q: int = 3, B_units: int = 10,
                      lam_risk: float = 1.0, lam_ret: float = 0.5, lam_budget: float = 10.0,
                      preselect_strategy: str = "lowvol_corr"):
    """
    Lee Close del CSV local, preselecciona EXACTAMENTE M=K activos del universo, 
    arma el QUBO y resuelve con SA. Devuelve pesos y montos en USD.
    """
    close = load_close_from_csv()

    # Universo: si el usuario mandó tickers, usar esos; si no, usar todos los del CSV
    universe = tickers if tickers else list(close.columns)
    universe = [t for t in universe if t in close.columns]
    if len(universe) == 0:
        raise ValueError("Ningún ticker del usuario existe en el CSV de precios.")

    # Estadísticos
    mu, Sigma = returns_annualized(close[universe])

    # Preselección EXACTA de M=k (limitada por tamaño del universo)
    M = min(k, len(universe))
    pre, mu_s, Sig_s = preselect_assets(mu, Sigma, universe, M=M, strategy=preselect_strategy)

    # QUBO + SA
    Q, mapping = build_qubo_discrete(mu_s, Sig_s, q=q, B_units=B_units,
                                     lam_risk=lam_risk, lam_ret=lam_ret, lam_budget=lam_budget)

    b_sa, C_sa = run_sa(Q, steps=20000)
    w_sa = decode_weights(b_sa, mapping)

    # Sanitizar y normalizar pesos
    w_sa = np.maximum(w_sa, 0)
    s = w_sa.sum()
    w_sa = w_sa / s if s > 0 else np.ones_like(w_sa) / len(w_sa)

    # Métricas
    exp_ret = float(np.array(mapping["mu"]) @ w_sa)
    exp_vol = float(np.sqrt(w_sa @ mapping["Sigma"] @ w_sa))

    # Armado de respuesta
    allocations = []
    for t, w in sorted(zip(pre, w_sa), key=lambda x: x[1], reverse=True):
        allocations.append({
            "ticker": t,
            "weight": float(w),
            "amount_usd": round(float(w * budget), 2)
        })

    return {
        "method": "SA",
        "selected": allocations,              # solo Close, sin Adj Close
        "total_budget_usd": float(budget),
        "C": float(C_sa),
        "expected_annual_return": exp_ret,
        "expected_annual_vol": exp_vol,
    }
