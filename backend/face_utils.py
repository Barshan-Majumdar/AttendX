import face_recognition
import numpy as np
import cv2

def get_face_encoding(image_bytes: bytes) -> list:
    """
    Extract face encoding from uploaded image bytes.
    Returns a list of floats (the encoding) or None if no face found.
    """
    # Convert image bytes to a numpy array for OpenCV
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Convert BGR (OpenCV) to RGB (face_recognition)
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    encodings = face_recognition.face_encodings(rgb_image)
    if len(encodings) == 0:
        return None
    
    # Return the first face encoding found as a list
    return encodings[0].tolist()

def match_face(captured_image_bytes: bytes, known_encodings_dict: dict) -> str:
    """
    Finds the matching student ID from a dictionary of known encodings.
    known_encodings_dict format: { 'student_id': [encoding_floats] }
    Returns student_id if matched, else None.
    """
    nparr = np.frombuffer(captured_image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    encodings = face_recognition.face_encodings(rgb_image)
    if len(encodings) == 0:
        return None
        
    captured_encoding = encodings[0]
    
    # Convert back to numpy arrays for comparison
    known_ids = list(known_encodings_dict.keys())
    known_encs = [np.array(enc) for enc in known_encodings_dict.values()]
    
    if not known_encs:
        return None
        
    matches = face_recognition.compare_faces(known_encs, captured_encoding)
    if True in matches:
        first_match_index = matches.index(True)
        return known_ids[first_match_index]
        
    return None
