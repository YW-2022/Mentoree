# syntax=docker/dockerfile:1
FROM python:3.8-bullseye
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app/api
COPY requirements.txt /app/api/
RUN pip install -r requirements.txt
COPY . /app/api/
