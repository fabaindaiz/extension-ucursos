FROM python:3.10-slim-buster

RUN apt-get update -y && apt-get upgrade -y && apt-get install -y \
    git

WORKDIR /app
COPY app /app
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

EXPOSE 8282
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8282"]