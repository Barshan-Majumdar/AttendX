# 🧑‍🎓 AttendX — AI-Powered Face Attendance System

A scalable, full-stack face recognition attendance system built for universities and institutions.

## 🏗️ Architecture

```
face_Attendance/
├── backend/               # Python FastAPI server
│   ├── main.py            # API routes
│   ├── database.py        # MongoDB connection
│   ├── models.py          # Pydantic data models
│   ├── face_utils.py      # Face encoding & matching logic
│   └── requirements.txt   # Python dependencies
├── frontend/              # React + Vite dashboard
│   └── src/
│       ├── App.jsx         # Layout & routing
│       ├── pages/
│       │   ├── Dashboard.jsx   # Attendance log viewer
│       │   ├── Register.jsx    # Student registration form
│       │   └── Kiosk.jsx       # Live webcam attendance scanner
│       └── index.css       # Global design system
└── main.py                # Original standalone script (legacy)
```

## ✨ Features

- **Face Registration** — Register students via webcam capture or file upload. Encodes and stores face data in MongoDB.
- **Live Kiosk Mode** — Auto-scanning webcam view that identifies and marks attendance in real-time.
- **Attendance Dashboard** — View today's attendance with timestamps, filterable by date.
- **Duplicate Prevention** — Automatically prevents marking attendance twice on the same day.
- **MongoDB Storage** — Scalable, production-ready database for face encodings and attendance logs.
- **Premium UI** — Dark glassmorphism design with smooth animations and responsive layout.

## 🚀 Getting Started

### Prerequisites

- **Python 3.13+**
- **Node.js 18+**
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate       # Windows
# source venv/bin/activate    # macOS/Linux

# Install dlib prebuilt wheel (Windows only)
pip install https://github.com/z-mahmud22/Dlib_Windows_Python3.x/raw/main/dlib-20.0.99-cp313-cp313-win_amd64.whl

# Install remaining dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables (Optional)

Create a `.env` file in the `backend/` folder:

```env
MONGO_URI=mongodb://localhost:27017/
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/students/register` | Register a new student with face image |
| `GET`  | `/api/students` | List all registered students |
| `POST` | `/api/attendance/mark` | Mark attendance via face image |
| `GET`  | `/api/attendance/today` | Get today's attendance records |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Vanilla CSS |
| Backend | Python, FastAPI |
| Database | MongoDB (pymongo) |
| AI/ML | face_recognition, dlib, OpenCV |

## 📄 License

MIT
