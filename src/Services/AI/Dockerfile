FROM python:3.11-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1

COPY src/Services/AI/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY src/Services/AI/ ./

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "::", "--port", "8080"]
