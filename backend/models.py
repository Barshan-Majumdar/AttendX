from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class StudentBase(BaseModel):
    name: str
    roll_number: str

class StudentCreate(StudentBase):
    pass
    # We will accept an image file separately via UploadFile

class StudentInDB(StudentBase):
    id: str = Field(alias="_id")
    face_encoding: List[float] # Storing the numpy array as a list of floats

class AttendanceBase(BaseModel):
    student_id: str
    student_name: str
    date: str
    time: str

class AttendanceInDB(AttendanceBase):
    id: str = Field(alias="_id")
