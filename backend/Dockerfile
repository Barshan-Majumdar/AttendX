# Use official Python slim image which is much smaller and avoids Ubuntu mirror issues
FROM python:3.10-slim

# Avoid prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install only the necessary system libraries for OpenCV and Dlib
RUN apt-get update && \
    apt-get install -y libglib2.0-0 && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install PyTorch CPU version first to save massive amounts of RAM and disk space
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Install dlib-bin (Pre-compiled dlib) to avoid building from source
RUN pip install --no-cache-dir dlib-bin

# Install face-recognition without dependencies so it doesn't trigger a dlib source build
RUN pip install --no-cache-dir --no-deps face-recognition==1.3.0

# Install remaining dependencies
RUN pip install --no-cache-dir -r requirements.txt && \
    pip uninstall -y opencv-python && \
    pip install --no-cache-dir --force-reinstall opencv-python-headless

# Copy app
COPY . .

# Run app
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
