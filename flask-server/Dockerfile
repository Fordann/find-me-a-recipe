FROM python:3.12-slim

WORKDIR /app

# Install Poetry using pip (no apt-get needed)
RUN pip install --no-cache-dir poetry==1.8.3

# Copy only dependency files first (for Docker layer caching)
COPY flask-server/pyproject.toml /app/pyproject.toml

# Configure Poetry and install dependencies
RUN poetry config virtualenvs.create false && \
    poetry install --no-interaction --no-ansi --no-root || \
    pip install --no-cache-dir flask flask-cors flask-caching deep-translator beautifulsoup4 requests aiohttp

# Copy application code
COPY flask-server /app

ENV FLASK_APP=app
EXPOSE 5001

CMD ["flask", "run", "--host=0.0.0.0", "--port=5001"]
