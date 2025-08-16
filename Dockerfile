# ----- Backend (FastAPI) en Render -----
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1

WORKDIR /app

# Copiamos solo el backend (incluye tu CSV)
COPY backend /app/backend

# Instala dependencias del backend
RUN pip install --upgrade pip \
 && pip install -r /app/backend/requirements.txt

# Puerto: Render inyecta $PORT; si no existe, usa 8000
ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}"]
