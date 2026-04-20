import face_recognition
import numpy as np
import cv2
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


import os
from ultralytics import YOLO

# Initialize YOLO model (load once at module level to save time)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "yolov8n-face.pt")
yolo_model = None
try:
    if os.path.exists(MODEL_PATH):
        yolo_model = YOLO(MODEL_PATH)
        logger.info("YOLOv8 face detection model loaded successfully.")
    else:
        logger.warning(f"YOLOv8 model not found at {MODEL_PATH}. Face detection might fail.")
except Exception as e:
    logger.error(f"Failed to load YOLOv8 model: {e}")


def detect_faces_robust(rgb_image):
    """
    Detect faces using YOLOv8 for robust detection across multiple faces, 
    varying lighting, and angles.
    Returns face_locations list (in top, right, bottom, left format) and the image.
    """
    if yolo_model is None:
        logger.error("YOLOv8 model is not loaded.")
        return [], rgb_image
        
    try:
        # Run inference using the YOLO model
        # YOLOv8 expects an image (numpy array is fine, RGB or BGR)
        results = yolo_model(rgb_image, verbose=False)
        
        face_locations = []
        for r in results:
            boxes = r.boxes
            for box in boxes:
                # Get confidence
                conf = float(box.conf[0])
                if conf < 0.5: # 50% confidence threshold
                    continue
                    
                # Get bounding box coordinates [x1, y1, x2, y2]
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                
                # Convert to integers
                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                
                # Convert to face_recognition format: top, right, bottom, left
                top = max(0, y1)
                right = min(rgb_image.shape[1], x2)
                bottom = min(rgb_image.shape[0], y2)
                left = max(0, x1)
                
                face_locations.append((top, right, bottom, left))
                
        if face_locations:
            logger.info(f"YOLOv8 found {len(face_locations)} face(s)")
        else:
            logger.warning("YOLOv8 found no faces above the confidence threshold.")
            
        return face_locations, rgb_image
        
    except Exception as e:
        logger.error(f"YOLOv8 inference failed: {e}")
        return [], rgb_image



def get_face_encoding(image_bytes: bytes) -> list:
    """
    Extract face encoding from uploaded image bytes.
    Returns a list of floats (the encoding) or None if no face found.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        logger.error("Failed to decode image from bytes")
        return None
    
    logger.info(f"Image decoded. Shape: {image.shape}, dtype: {image.dtype}")
    
    # Convert BGR to RGB
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Use robust detection
    face_locations, processed_image = detect_faces_robust(rgb_image)
    
    if not face_locations:
        return None
    
    logger.info(f"Face locations: {face_locations}")
    
    # Get encodings from the processed image
    encodings = face_recognition.face_encodings(processed_image, known_face_locations=face_locations)
    
    if len(encodings) == 0:
        logger.error("face_encodings returned empty despite face locations being found")
        return None
    
    logger.info("Face encoding extracted successfully (128D vector)")
    return encodings[0].tolist()


def match_faces(captured_image_bytes: bytes, known_encodings_dict: dict) -> list[str]:
    """
    Finds the matching student IDs from a dictionary of known encodings.
    Returns a list of matched student IDs.
    """
    nparr = np.frombuffer(captured_image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        logger.error("Failed to decode captured image")
        return []
    
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    face_locations, processed_image = detect_faces_robust(rgb_image)
    
    if not face_locations:
        return []
    
    encodings = face_recognition.face_encodings(processed_image, known_face_locations=face_locations)
    if len(encodings) == 0:
        return []
        
    known_ids = list(known_encodings_dict.keys())
    known_encs = [np.array(enc) for enc in known_encodings_dict.values()]
    
    if not known_encs:
        return []
        
    matched_student_ids = []
    
    for captured_encoding in encodings:
        # Compare with tolerance
        matches = face_recognition.compare_faces(known_encs, captured_encoding, tolerance=0.6)
        if True in matches:
            face_distances = face_recognition.face_distance(known_encs, captured_encoding)
            best_match_index = np.argmin(face_distances)
            if matches[best_match_index]:
                logger.info(f"Face matched! Distance: {face_distances[best_match_index]:.4f}")
                matched_id = known_ids[best_match_index]
                if matched_id not in matched_student_ids:
                    matched_student_ids.append(matched_id)
            
    return matched_student_ids


def check_duplicate_face(new_encoding: list, known_encodings_dict: dict, tolerance: float = 0.5) -> str:
    """
    Check if a face encoding already exists in the database.
    Uses a stricter tolerance (0.5) than matching (0.6) to avoid false positives.
    Returns the student_id of the duplicate if found, else None.
    """
    if not known_encodings_dict:
        return None
    
    new_enc = np.array(new_encoding)
    known_ids = list(known_encodings_dict.keys())
    known_encs = [np.array(enc) for enc in known_encodings_dict.values()]
    
    matches = face_recognition.compare_faces(known_encs, new_enc, tolerance=tolerance)
    if True in matches:
        face_distances = face_recognition.face_distance(known_encs, new_enc)
        best_match_index = np.argmin(face_distances)
        if matches[best_match_index]:
            logger.warning(f"Duplicate face detected! Matches student {known_ids[best_match_index]} with distance {face_distances[best_match_index]:.4f}")
            return known_ids[best_match_index]
    
    return None

