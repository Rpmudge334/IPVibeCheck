FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

# Create stats file if not exists
RUN echo '{"impurities_smelted": 0}' > forge_stats.json

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
