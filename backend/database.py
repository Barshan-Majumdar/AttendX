from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("MONGO_URI is not set. Please add it to backend/.env")

# Extract database name from URI, default to face_attendance_db if none specified
db_name = MONGO_URI.split("/")[-1].split("?")[0]
if not db_name:
    db_name = "face_attendance_db"
    
client = MongoClient(MONGO_URI)
db = client[db_name]

# Collections
students_collection = db["students"]
attendance_collection = db["attendance"]

def get_db():
    return db
