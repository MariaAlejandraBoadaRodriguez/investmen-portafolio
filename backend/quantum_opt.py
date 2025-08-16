# -*- coding: utf-8 -*-
import numpy as np
import pandas as pd
from typing import List
import pennylane as qml  # Se usa si luego activas QAOA/VQA (no se llama por defecto)

# ---------- Estadísticos (anualizados) ----------
def returns_annualized(close: pd.DataFrame):
    ret = np.log(close / close.shift(1)).replace([np.inf, -np.inf], np.nan).dropna(how="any")
    mu = ret.mean() * 252
    cov = ret.cov() * 252
    return mu, cov

# ---------- Preselección EXACTA de M activos ----------
def preselect_assets(mu_all: pd.Series, Sigma_all: pd.DataFrame, universe: List[str], M: int,
                     strategy: str = "lowvol_corr", rf: float = 0.02,
                     vol_weight: float = 0.6, corr_weight: float = 0.4):
    tickers = [t for t in universe if t in mu_all.index and t in Sigma_all.index]
    mu_all = mu_all.loc[tickers]
    Sigma_all = Sigma_all.loc[tickers, tickers]

    if strategy == "sharpe":
        vol = np.sqrt(np.diag(Sigma_all.values))
        sh = (mu_all - rf) / pd.Series(vol, index=Sigma_all.index).replace(0, np.nan)
        sub = sh.sort_values(ascending=False).head(M).index
    elif strategy == "ret":
        sub = mu_all.sort_values(ascending=False).head(M).index
    else:  # lowvol_corr (por defecto)
        vol = np.sqrt(np.diag(Sigma_all.values))
        C = pd.DataFrame(Sigma_all, index=Sigma_all.index, columns=Sigma_all.columns).corr()
        mean_corr = (C.sum(axis=1) - 1) / (len(C) - 1)
        score = vol_weight * pd.Series(vol, index=Sigma_all.index) + corr_weight * mean_corr
        sub = score.sort_values().head(M).index

    mu = mu_all.loc[sub]
    Sig = Sigma_all.loc[sub, sub]
    return list(sub), mu, Sig

# ---------- QUBO para pesos discretos ----------
def build_qubo_discrete(mu: pd.Series, Sigma: pd.DataFrame, q=3, B_units=10,
                        lam_risk=1.0, lam_ret=0.5, lam_budget=10.0):
    M = len(mu)
    n_bits = M * q
    B = B_units
    alpha = 1.0 / B

    A = np.zeros((M, n_bits))
    for i in range(M):
        for k in range(q):
            A[i, i*q + k] = 2**k

    Q_risk = lam_risk * (alpha**2) * (A.T @ Sigma.values @ A)
    q_lin  = (- lam_ret * alpha) * (A.T @ mu.values)
    Q_ret  = np.diag(q_lin)

    one = np.ones(M)
    Q_budget     = lam_budget * (alpha**2) * (A.T @ np.outer(one, one) @ A)
    q_budget_lin = -2.0 * lam_budget * alpha * (A.T @ one)
    Q_budget    += np.diag(q_budget_lin)

    Q = Q_risk + Q_ret + Q_budget
    Q = 0.5 * (Q + Q.T)

    mapping = {"M": M, "q": q, "n_bits": n_bits, "alpha": alpha, "B": B, "A": A,
               "mu": mu.values, "Sigma": Sigma.values}
    return Q, mapping

def decode_weights(b, map_):
    A, alpha = map_["A"], map_["alpha"]
    return alpha * (A @ np.asarray(b, int))

def qubo_cost(Q, b):
    x = np.asarray(b, int)
    return float(x @ Q @ x)

# ---------- Simulated Annealing (rápido y sin dependencias raras) ----------
def run_sa(Q, steps=20000, T0=1.0, alpha=0.995, seed=42):
    rng = np.random.default_rng(seed)
    n = Q.shape[0]
    x = rng.integers(0, 2, n)
    c = float(x @ Q @ x)
    best_x, best_c = x.copy(), c
    T = T0
    for _ in range(steps):
        i = rng.integers(n)
        x_new = x.copy(); x_new[i] ^= 1
        c_new = float(x_new @ Q @ x_new)
        d = c_new - c
        if d < 0 or rng.random() < np.exp(-d/max(T, 1e-9)):
            x, c = x_new, c_new
            if c < best_c:
                best_x, best_c = x.copy(), c
        T *= alpha
    return best_x, best_c
