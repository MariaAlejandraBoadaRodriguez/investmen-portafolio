# -*- coding: utf-8 -*-
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import OptimizeRequest, OptimizeResponse, Allocation, RefreshResponse
from optimizer_quant_endpoint import optimize_discrete
from data_loader import load_close_from_csv, CSV_PATH

app = FastAPI(title="Investment Portfolio Optimization API")

# CORS (Vite por defecto)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok", "message": "API operativa (CSV local de Close)"}

@app.post("/optimize", response_model=OptimizeResponse)
async def optimize(req: OptimizeRequest):
    try:
        res = optimize_discrete(
            tickers=req.tickers,
            k=req.k,
            budget=req.budget_usd,
            q=req.q,
            B_units=req.B_units,
            lam_risk=req.lam_risk,
            lam_ret=req.lam_ret,
            lam_budget=req.lam_budget,
            preselect_strategy="lowvol_corr"  # cambia a "sharpe" si prefieres
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return OptimizeResponse(
        method=res["method"],
        selected=[Allocation(**a) for a in res["selected"]],
        total_budget_usd=res["total_budget_usd"],
        C=res["C"],
        expected_annual_return=res["expected_annual_return"],
        expected_annual_vol=res["expected_annual_vol"],
    )

# Endpoint opcional para verificar que el CSV se lee bien
@app.post("/refresh_prices", response_model=RefreshResponse)
async def refresh_local():
    df = load_close_from_csv(CSV_PATH)
    return RefreshResponse(ok=True, rows=df.shape[0], cols=df.shape[1], file=str(CSV_PATH))
