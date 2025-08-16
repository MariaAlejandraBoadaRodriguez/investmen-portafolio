# -*- coding: utf-8 -*-
import pandas as pd
import numpy as np
from pathlib import Path

# Ruta ABSOLUTA al CSV (misma carpeta del backend)
DATA_DIR = Path(__file__).resolve().parent
CSV_PATH = DATA_DIR / "precios_150_acciones.csv"

# ---------- 1) Extraer SOLO 'Close' del CSV ----------
def recover_close_with_tickers_strict(df_raw: pd.DataFrame) -> pd.DataFrame:
    """
    Devuelve un DataFrame con el panel 'Close' y columnas renombradas al ticker real.
    NO usa 'Adj Close' bajo ninguna circunstancia.
    """
    # Caso columnas planas
    if not isinstance(df_raw.columns, pd.MultiIndex):
        cols = [c for c in df_raw.columns if isinstance(c, str) and c.strip().lower() == "close"]
        if len(cols) == 0:
            cols = [c for c in df_raw.columns if isinstance(c, str) and "close" in c.strip().lower()]
        if len(cols) == 0:
            raise RuntimeError("El CSV no contiene columna 'Close'. Reexporta incluyendo 'Close'.")
        out = df_raw[cols].copy()
        out.columns = [c.split(",")[-1].strip() if isinstance(c, str) else str(c) for c in out.columns]
        return out

    # Caso MultiIndex
    cols = df_raw.columns
    close_cols = [c for c in cols if any(isinstance(x, str) and x.strip().lower() == "close" for x in c)]
    if len(close_cols) == 0:
        raise RuntimeError("No se encontró bloque 'Close' en el encabezado (MultiIndex).")

    RESERVED = {"price", "adj close", "close", "open", "high", "low", "volume", "ticker", "nan", ""}

    def best_name(col_tuple):
        # de derecha a izquierda, primer token "válido"
        for x in reversed(col_tuple):
            if not isinstance(x, str):
                continue
            s = x.strip()
            if not s:
                continue
            low = s.lower()
            if low in RESERVED:
                continue
            if low.startswith("unnamed"):
                continue
            return s
        toks = [str(x).strip() for x in col_tuple
                if isinstance(x, str)
                and str(x).strip().lower() not in RESERVED
                and not str(x).strip().lower().startswith("unnamed")]
        return "_".join(toks) if toks else str(col_tuple[-1])

    close_block = df_raw.loc[:, close_cols].copy()
    nice_names = [best_name(c) for c in close_block.columns]
    close_block.columns = nice_names
    return close_block

def load_close_from_csv(path: str | Path = CSV_PATH) -> pd.DataFrame:
    """
    Lee el CSV local y devuelve un DataFrame de precios 'Close' limpio.
    No descarga nada de internet.
    """
    path = Path(path)
    if not path.exists():
        raise RuntimeError(f"No se encontró el archivo: {path}")

    df_raw = None
    for hdr in ([0, 1, 2], [0, 1], [0]):
        try:
            df_raw = pd.read_csv(path, header=hdr, index_col=0, parse_dates=True)
            break
        except Exception:
            pass
    if df_raw is None:
        raise RuntimeError(f"No se pudo leer '{path}'. Revisa formato/permiso.")

    close = recover_close_with_tickers_strict(df_raw)

    # limpieza
    for c in close.columns:
        close[c] = pd.to_numeric(close[c], errors="coerce")
    close = (close
             .sort_index()
             .dropna(how="all")
             .ffill()
             .bfill())
    # elimina columnas constantes
    close = close.loc[:, close.std() > 0]

    # exigir historial mínimo (puedes bajar a 150 si tu CSV tiene menos días)
    min_obs = 250
    ok_cols = [c for c in close.columns if close[c].notna().sum() >= min_obs]
    close = close[ok_cols]
    if close.empty:
        raise RuntimeError("Tras limpieza, no quedaron series 'Close' con historial suficiente.")
    return close
