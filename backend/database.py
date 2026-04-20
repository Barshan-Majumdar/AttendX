from pymongo import MongoClient
import os

# For a production app, use an environment variable. 
# For now, default to local MongoDB instance
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

client = MongoClient(MONGO_URI)
db = client["face_attendance_db"]

# Collections
students_collection = db["students"]
attendance_collection = db["attendance"]

def get_db():
    return db
