# -*- coding: utf-8 -*-
from pydantic import BaseModel, Field
from typing import List, Optional

class OptimizeRequest(BaseModel):
    tickers: List[str] = []              # universo seleccionado (opcional)
    k: int = Field(ge=1, le=20)          # K = M (cantidad de acciones que pide el usuario)
    budget_usd: float = Field(gt=0)
    # hiperparámetros (opcionales)
    q: int = Field(default=3, ge=1, le=6)
    B_units: int = Field(default=10, ge=1, le=100)
    lam_risk: float = 1.0
    lam_ret: float = 0.5
    lam_budget: float = 10.0
    # Compatibilidad con el frontend actual: se ignoran si vienen
    start: Optional[str] = None
    end: Optional[str] = None

class Allocation(BaseModel):
    ticker: str
    weight: float
    amount_usd: float

class OptimizeResponse(BaseModel):
    method: str
    selected: List[Allocation]
    total_budget_usd: float
    C: Optional[float] = None
    expected_annual_return: Optional[float] = None
    expected_annual_vol: Optional[float] = None

class RefreshResponse(BaseModel):
    ok: bool
    rows: int
    cols: int
    file: str
