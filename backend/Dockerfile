# Use Ubuntu 22.04
FROM ubuntu:22.04

# Avoid prompts
ENV DEBIAN_FRONTEND=noninteractive

# Change mirrors to a more reliable one (Cloudflare) to fix the Exit Code 100
RUN sed -i 's/archive.ubuntu.com/mirror.cloudflare.com/g' /etc/apt/sources.list && \
    apt-get update && \
    apt-get install -y \
    python3-dlib \
    libglib2.0-0 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install PyTorch CPU version first to save massive amounts of RAM and disk space
RUN pip3 install --no-cache-dir --break-system-packages torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Install face-recognition without dependencies to prevent pip from building dlib from source
RUN pip3 install --no-cache-dir --break-system-packages --no-deps face-recognition==1.3.0

# Install remaining dependencies
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Copy app
COPY . .

# Run app
CMD ["python3", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
