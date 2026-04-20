import face_recognition
import numpy as np
import cv2
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def enhance_image(image):
    """
    Enhance a dark/low-contrast image for better face detection.
    Applies CLAHE (Contrast Limited Adaptive Histogram Equalization)
    and brightness boost.
    """
    # Convert to LAB color space for better brightness control
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)
    
    # Apply CLAHE to the L (lightness) channel
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    enhanced_l = clahe.apply(l_channel)
    
    # Merge and convert back
    enhanced_lab = cv2.merge([enhanced_l, a_channel, b_channel])
    enhanced_bgr = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
    
    # Additional brightness and contrast boost
    alpha = 1.3  # contrast multiplier
    beta = 30    # brightness offset
    enhanced_bgr = cv2.convertScaleAbs(enhanced_bgr, alpha=alpha, beta=beta)
    
    return enhanced_bgr


def detect_faces_robust(rgb_image):
    """
    Try multiple strategies to detect faces in an image.
    Returns face_locations list and the (possibly modified) image.
    """
    # Strategy 1: Default HOG with upsample=1
    face_locations = face_recognition.face_locations(rgb_image, number_of_times_to_upsample=1, model="hog")
    if face_locations:
        logger.info(f"[Strategy 1] Found {len(face_locations)} face(s)")
        return face_locations, rgb_image
    
    # Strategy 2: HOG with upsample=2
    face_locations = face_recognition.face_locations(rgb_image, number_of_times_to_upsample=2, model="hog")
    if face_locations:
        logger.info(f"[Strategy 2] Found {len(face_locations)} face(s) with upsample=2")
        return face_locations, rgb_image
    
    # Strategy 3: Enhance image brightness/contrast, then try again
    logger.info("[Strategy 3] Trying with enhanced image...")
    bgr_image = cv2.cvtColor(rgb_image, cv2.COLOR_RGB2BGR)
    enhanced_bgr = enhance_image(bgr_image)
    enhanced_rgb = cv2.cvtColor(enhanced_bgr, cv2.COLOR_BGR2RGB)
    
    face_locations = face_recognition.face_locations(enhanced_rgb, number_of_times_to_upsample=1, model="hog")
    if face_locations:
        logger.info(f"[Strategy 3] Found {len(face_locations)} face(s) after enhancement")
        return face_locations, enhanced_rgb
    
    # Strategy 4: Scale up a small image
    height, width = rgb_image.shape[:2]
    if width < 800 or height < 600:
        scale = 2.0
        resized = cv2.resize(rgb_image, (int(width * scale), int(height * scale)), interpolation=cv2.INTER_CUBIC)
        face_locations = face_recognition.face_locations(resized, number_of_times_to_upsample=1, model="hog")
        if face_locations:
            logger.info(f"[Strategy 4] Found {len(face_locations)} face(s) after upscaling to {int(width*scale)}x{int(height*scale)}")
            return face_locations, resized
    
    # Strategy 5: Enhance + scale up combo
    enhanced_rgb_resized = cv2.resize(enhanced_rgb, (int(width * 2), int(height * 2)), interpolation=cv2.INTER_CUBIC)
    face_locations = face_recognition.face_locations(enhanced_rgb_resized, number_of_times_to_upsample=1, model="hog")
    if face_locations:
        logger.info(f"[Strategy 5] Found {len(face_locations)} face(s) after enhance + scale")
        return face_locations, enhanced_rgb_resized
    
    # Strategy 6: Use OpenCV's Haar Cascade as last resort
    logger.info("[Strategy 6] Trying OpenCV Haar Cascade as fallback...")
    gray = cv2.cvtColor(enhanced_bgr, cv2.COLOR_BGR2GRAY)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    opencv_faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(30, 30))
    
    if len(opencv_faces) > 0:
        # Convert OpenCV rectangles (x,y,w,h) to face_recognition format (top, right, bottom, left)
        face_locations = []
        for (x, y, w, h) in opencv_faces:
            # Add padding around the detected face
            pad = int(0.2 * max(w, h))
            top = max(0, y - pad)
            right = min(enhanced_rgb.shape[1], x + w + pad)
            bottom = min(enhanced_rgb.shape[0], y + h + pad)
            left = max(0, x - pad)
            face_locations.append((top, right, bottom, left))
        
        logger.info(f"[Strategy 6] OpenCV found {len(face_locations)} face(s)")
        return face_locations, enhanced_rgb
    
    logger.error("All strategies failed - no face found")
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


def match_face(captured_image_bytes: bytes, known_encodings_dict: dict) -> str:
    """
    Finds the matching student ID from a dictionary of known encodings.
    """
    nparr = np.frombuffer(captured_image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        logger.error("Failed to decode captured image")
        return None
    
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    face_locations, processed_image = detect_faces_robust(rgb_image)
    
    if not face_locations:
        return None
    
    encodings = face_recognition.face_encodings(processed_image, known_face_locations=face_locations)
    if len(encodings) == 0:
        return None
        
    captured_encoding = encodings[0]
    
    known_ids = list(known_encodings_dict.keys())
    known_encs = [np.array(enc) for enc in known_encodings_dict.values()]
    
    if not known_encs:
        return None
    
    # Compare with tolerance
    matches = face_recognition.compare_faces(known_encs, captured_encoding, tolerance=0.6)
    if True in matches:
        face_distances = face_recognition.face_distance(known_encs, captured_encoding)
        best_match_index = np.argmin(face_distances)
        if matches[best_match_index]:
            logger.info(f"Face matched! Distance: {face_distances[best_match_index]:.4f}")
            return known_ids[best_match_index]
        
    return None


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

