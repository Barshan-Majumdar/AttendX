# Use Ubuntu 22.04 (The most stable for AI/CV libraries)
FROM ubuntu:22.04

# Avoid prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install pre-compiled dlib, opencv, and python
# This is the fastest and most stable way!
RUN apt-get update && apt-get install -y \
    python3-dlib \
    python3-opencv \
    python3-pip \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Install the rest of the dependencies
# We use --break-system-packages (or just ignore it on older pip)
RUN pip3 install --no-cache-dir -r requirements.txt || pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 8000

# Run the app
CMD ["python3", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
