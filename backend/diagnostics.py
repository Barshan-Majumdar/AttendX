import sys
import os

print(f"Python Version: {sys.version}")
print(f"Current Directory: {os.getcwd()}")

try:
    import fastapi
    print("FastAPI: Installed")
except ImportError:
    print("FastAPI: NOT INSTALLED")

try:
    import face_recognition
    print("face_recognition: Installed")
except ImportError as e:
    print(f"face_recognition: NOT INSTALLED ({e})")

try:
    from pymongo import MongoClient
    client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=2000)
    client.server_info()
    print("MongoDB: Connected")
except Exception as e:
    print(f"MongoDB: NOT CONNECTED ({e})")
