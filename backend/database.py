from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("MONGO_URI is not set. Please add it to backend/.env")

client = MongoClient(MONGO_URI)
db = client["face_attendance_db"]

# Collections
students_collection = db["students"]
attendance_collection = db["attendance"]

def get_db():
    return db
