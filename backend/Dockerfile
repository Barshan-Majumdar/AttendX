# Use the FULL official Python runtime (more stable for building dlib)
FROM python:3.11

# Install system dependencies required for dlib
RUN apt-get update && apt-get install -y \
    cmake \
    libopenblas-dev \
    liblapack-dev \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install dependencies
# We install dlib first to ensure it's built correctly
RUN pip install --no-cache-dir cmake && \
    export MAKEFLAGS="-j 1" && \
    pip install --no-cache-dir dlib && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
