FROM python:3.12-slim

WORKDIR /app

# Install uv (fast Python package installer)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy only dependency files first (for Docker layer caching)
COPY flask-server/pyproject.toml /app/pyproject.toml

# Install dependencies with uv (no venv in container)
RUN uv pip install --system --no-cache -r pyproject.toml

# Copy application code
COPY flask-server /app

ENV FLASK_APP=app
EXPOSE 5001

CMD ["flask", "run", "--host=0.0.0.0", "--port=5001"]
