# Use Debian Bookworm (it has pre-compiled dlib!)
FROM debian:bookworm-slim

# Install pre-compiled dlib, python, and essential tools
# This avoids the 8GB compilation error entirely!
RUN apt-get update && apt-get install -y \
    python3-dlib \
    python3-pip \
    python3-venv \
    libgl1-mesa-glx \
    libglib2.0-0 \
    cmake \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Install dependencies
# We use --break-system-packages because we are in a container and using the system dlib
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 8000

# Run the app using the system python which has the pre-compiled dlib
CMD ["python3", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
