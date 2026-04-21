# Use Ubuntu 22.04
FROM ubuntu:22.04

# Avoid prompts
ENV DEBIAN_FRONTEND=noninteractive

# Change mirrors to a more reliable one (Cloudflare) to fix the Exit Code 100
RUN sed -i 's/archive.ubuntu.com/mirror.cloudflare.com/g' /etc/apt/sources.list && \
    apt-get update && \
    apt-get install -y \
    python3-dlib \
    python3-opencv \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install dependencies
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Copy app
COPY . .

# Run app
CMD ["python3", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
