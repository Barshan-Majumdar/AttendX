from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import get_db
from face_utils import get_face_encoding, match_faces, check_duplicate_face
from datetime import datetime, timezone, timedelta
from bson import ObjectId
from imagekitio import ImageKit
from dotenv import load_dotenv
import asyncio
import base64
import os

load_dotenv()

app = FastAPI(title="Face Attendance API")

# Initialize ImageKit (v5 only needs private_key)
imagekit = ImageKit(private_key=os.getenv("IMAGEKIT_PRIVATE_KEY"))

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://face-attendance-x.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def ping_server():
    """Returns a tiny response to keep cron jobs happy without 'output too large' errors."""
    return {"status": "awake"}

def upload_to_imagekit(image_bytes: bytes, filename: str) -> str:
    """Upload image to ImageKit and return the URL."""
    try:
        result = imagekit.files.upload(
            file=image_bytes,
            file_name=filename,
            folder="/face_attendance/students/",
        )
        if result and hasattr(result, 'url'):
            return result.url
        return None
    except Exception as e:
        print(f"ImageKit upload error: {e}")
        return None

@app.post("/api/students/register")
async def register_student(
    name: str = Form(...),
    roll_number: str = Form(...),
    file: UploadFile = File(...)
):
    db = get_db()
    
    # Check if roll number already exists
    if db.students.find_one({"roll_number": roll_number}):
        raise HTTPException(status_code=400, detail="Student with this roll number already exists")
        
    image_bytes = await file.read()
    
    # VULNERABILITY FIX: Prevent Memory Exhaustion (OOM) on server
    if len(image_bytes) > 5 * 1024 * 1024: # 5MB limit
        raise HTTPException(status_code=413, detail="Image size exceeds 5MB limit. Please upload a smaller image.")
        
    # VULNERABILITY FIX: Prevent Event Loop Blocking (DoS)
    encoding = await asyncio.to_thread(get_face_encoding, image_bytes)
    
    if not encoding:
        raise HTTPException(status_code=400, detail="No face detected in the provided image")
    
    # SECURITY: Check if this face already exists in the database
    existing_students = list(db.students.find({}, {"_id": 1, "name": 1, "face_encoding": 1}))
    if existing_students:
        encodings_dict = {str(s["_id"]): s["face_encoding"] for s in existing_students}
        duplicate_id = check_duplicate_face(encoding, encodings_dict)
        
        if duplicate_id:
            duplicate_student = next(
                (s for s in existing_students if str(s["_id"]) == duplicate_id), None
            )
            duplicate_name = duplicate_student["name"] if duplicate_student else "Unknown"
            raise HTTPException(
                status_code=409,
                detail=f"This face is already registered under the name '{duplicate_name}'. Duplicate registration is not allowed."
            )
    
    # Upload student photo to ImageKit (Off-loaded to thread to prevent blocking)
    safe_name = name.replace(" ", "_").lower()
    photo_url = await asyncio.to_thread(upload_to_imagekit, image_bytes, f"{safe_name}_{roll_number}.jpg")
    
    student_doc = {
        "name": name,
        "roll_number": roll_number,
        "face_encoding": encoding,
        "photo_url": photo_url or "",
        "registered_at": datetime.now(timezone(timedelta(hours=5, minutes=30))).isoformat()
    }
    
    result = db.students.insert_one(student_doc)
    return {
        "message": "Student registered successfully",
        "id": str(result.inserted_id),
        "photo_url": photo_url
    }

@app.get("/api/students")
def get_students():
    db = get_db()
    students = []
    for doc in db.students.find({}, {"face_encoding": 0}):
        doc["_id"] = str(doc["_id"])
        students.append(doc)
    return students

@app.delete("/api/students/{student_id}")
def delete_student(student_id: str):
    db = get_db()
    result = db.students.delete_one({"_id": ObjectId(student_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    db.attendance.delete_many({"student_id": student_id})
    return {"message": "Student and their attendance records deleted"}

@app.post("/api/attendance/mark")
async def mark_attendance(file: UploadFile = File(...)):
    db = get_db()
    image_bytes = await file.read()
    
    # VULNERABILITY FIX: Prevent Memory Exhaustion (OOM)
    if len(image_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image size exceeds 5MB limit.")
    
    known_students = list(db.students.find({}, {"_id": 1, "name": 1, "face_encoding": 1, "photo_url": 1}))
    if not known_students:
        raise HTTPException(status_code=404, detail="No students registered yet")
        
    encodings_dict = {str(student["_id"]): student["face_encoding"] for student in known_students}
    
    # VULNERABILITY FIX: Prevent Event Loop Blocking (DoS)
    matched_ids = await asyncio.to_thread(match_faces, image_bytes, encodings_dict)
    
    if not matched_ids:
        raise HTTPException(status_code=404, detail="No faces recognized")
        
    now = datetime.now(timezone(timedelta(hours=5, minutes=30)))
    current_date = now.strftime("%Y-%m-%d")
    current_time = now.strftime("%H:%M:%S")
    
    marked_students = []
    already_marked = []
    
    for matched_id in matched_ids:
        matched_student = next(s for s in known_students if str(s["_id"]) == matched_id)
        
        # SECURITY: Block duplicate attendance
        existing = db.attendance.find_one({
            "student_id": matched_id,
            "date": current_date
        })
        
        if existing:
            already_marked.append(matched_student['name'])
            continue
            
        attendance_doc = {
            "student_id": matched_id,
            "student_name": matched_student["name"],
            "student_photo": matched_student.get("photo_url", ""),
            "date": current_date,
            "time": current_time
        }
        
        db.attendance.insert_one(attendance_doc)
        marked_students.append({
            "student_name": matched_student["name"],
            "student_photo": matched_student.get("photo_url", ""),
            "time": current_time
        })
        
    if not marked_students and already_marked:
        raise HTTPException(
            status_code=409,
            detail=f"Attendance already marked today for: {', '.join(already_marked)}."
        )
        
    return {
        "message": f"Successfully marked attendance for {len(marked_students)} student(s)",
        "marked_students": marked_students,
        "already_marked": already_marked
    }

@app.get("/api/attendance/today")
def get_today_attendance():
    db = get_db()
    current_date = datetime.now(timezone(timedelta(hours=5, minutes=30))).strftime("%Y-%m-%d")
    records = []
    for doc in db.attendance.find({"date": current_date}):
        doc["_id"] = str(doc["_id"])
        records.append(doc)
    return records
