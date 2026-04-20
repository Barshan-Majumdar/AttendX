from dotenv import load_dotenv
import os
load_dotenv(".env")

from pymongo import MongoClient
client = MongoClient(os.getenv("MONGO_URI"))

# Check which DB name is being used
db_name = os.getenv("MONGO_URI").split("/")[-1].split("?")[0]
print(f"DB name from URI: '{db_name}'")

db = client[db_name]
print(f"Collections: {db.list_collection_names()}")

students = list(db.students.find({}, {"face_encoding": 0}))
print(f"Students in '{db_name}': {len(students)}")
for s in students:
    print(f"  Name: {s.get('name')} | Roll: {s.get('roll_number')} | Photo: {s.get('photo_url', 'NONE')}")

# Also check the hardcoded DB name from database.py
db2 = client["face_attendance_db"]
students2 = list(db2.students.find({}, {"face_encoding": 0}))
print(f"\nStudents in 'face_attendance_db': {len(students2)}")
for s in students2:
    print(f"  Name: {s.get('name')} | Roll: {s.get('roll_number')} | Photo: {s.get('photo_url', 'NONE')}")

# Test ImageKit
print("\n--- ImageKit Test ---")
pk = os.getenv("IMAGEKIT_PRIVATE_KEY")
print(f"Private key set: {bool(pk and pk != 'your_private_key_here')}")
print(f"Private key prefix: {pk[:10] if pk else 'NOT SET'}...")
