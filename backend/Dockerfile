FROM python:3.11-slim

# System libs required by opencv-python (pulled in by pipecat webrtc transport)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libxcb1 libxkbcommon0 libglib2.0-0 libsm6 libxrender1 libxext6 libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Copy dependency files first — separate layer so code changes don't re-install packages
COPY pyproject.toml uv.lock ./

# Install all third-party dependencies (skip the local package — src/ not copied yet)
RUN uv sync --frozen --no-dev --no-install-project

# Copy application source and README (pyproject.toml references readme = "README.md")
COPY src/ ./src/
COPY README.md ./

# Install the local backend package into the venv
RUN uv sync --frozen --no-dev

# Put the venv on PATH so uvicorn is found directly
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
