# ---- Backend FastAPI con Docker (Render) ----
# Si llegas a tener problemas de wheels en el futuro, cambia a: FROM python:3.11
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1

# Trabajaremos directamente dentro de /app/backend
WORKDIR /app/backend

# Copiamos SOLO el backend (incluye tu CSV)
COPY backend /app/backend

# Instalar dependencias del backend
RUN pip install --upgrade pip \
 && pip install -r requirements.txt

# Render usa la variable PORT
ENV PORT=8000
EXPOSE 8000

# IMPORTANTE: arrancar desde /app/backend para que "from schemas import ..." funcione
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
