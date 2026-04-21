# Use an image that ALREADY has dlib and opencv installed (No more apt-get errors!)
FROM valeriansaliou/python-dlib-opencv:v1.0.0

# Set the working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install the remaining small libraries
# We use --break-system-packages because the base image has a custom python
RUN pip install --no-cache-dir --break-system-packages -r requirements.txt

# Copy the rest of the app
COPY . .

# Expose port
EXPOSE 8000

# Run the app
CMD ["python3", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
