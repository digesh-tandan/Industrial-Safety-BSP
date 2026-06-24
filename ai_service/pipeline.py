import os
import sys
import cv2
import numpy as np
import time
import json
import urllib.request
import urllib.error
import base64
import argparse

# Optional imports with try/except wrappers for seamless execution
try:
    from websocket import create_connection
    HAS_WEBSOCKET = True
except ImportError:
    HAS_WEBSOCKET = False

try:
    from ultralytics import YOLO
    HAS_YOLO = True
except ImportError:
    HAS_YOLO = False

try:
    import face_recognition
    HAS_FACE_REC = True
except ImportError:
    HAS_FACE_REC = False

class BSPAISurveillancePipeline:
    def __init__(self, api_url="http://127.0.0.1:8000", ws_url="ws://127.0.0.1:8000/ws/live-stream/"):
        self.api_url = api_url.rstrip('/')
        self.ws_url = ws_url
        self.token = None
        self.known_faces = []  # List of dicts: {id, name, encoding}
        self.yolo_model = None
        self.ws = None
        self.last_alert_time = {} # Cooldown tracker per employee-violation key

        print("\n" + "="*80)
        print("    SAIL BHILAI STEEL PLANT - PRODUCTION SURVEILLANCE & AI INFERENCE PIPELINE")
        print("="*80)

        # 1. Check dependencies
        print(f"[STATUS] YOLOv8 (ultralytics): {'FOUND' if HAS_YOLO else 'NOT FOUND (Using HSV Color fallback)'}")
        print(f"[STATUS] Face Recognition:     {'FOUND' if HAS_FACE_REC else 'NOT FOUND (Using mock matcher)'}")
        print(f"[STATUS] WebSocket Client:     {'FOUND' if HAS_WEBSOCKET else 'NOT FOUND (Skipping live UI streams)'}")

        # 2. Authenticate and retrieve token
        self.authenticate()

        # 3. Load database face embeddings
        self.load_employee_embeddings()

        # 4. Initialize YOLO Model
        self.init_ai_models()

        # 5. Connect WebSocket
        self.connect_websocket()

    def authenticate(self):
        """Authenticates with Django JWT backend using Safety Officer credentials."""
        url = f"{self.api_url}/api/auth/login/"
        payload = json.dumps({"username": "officer", "password": "officer123"}).encode('utf-8')
        
        req = urllib.request.Request(
            url, 
            data=payload, 
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        
        try:
            with urllib.request.urlopen(req, timeout=5) as response:
                res = json.loads(response.read().decode('utf-8'))
                self.token = res.get("tokens", {}).get("access")
                print("[AUTH] Successfully authenticated. JWT Token obtained.")
        except Exception as e:
            print(f"[AUTH] [WARNING] Could not connect to API for authentication: {e}")
            print("[AUTH] Running in Standalone/Local-only fallback mode.")

    def load_employee_embeddings(self):
        """Downloads all active employee face embeddings from the Django backend API."""
        if not self.token:
            print("[EMBEDDINGS] Skipped downloading embeddings (API offline). Enrolling local test profiles.")
            self.known_faces = [
                {"id": "BSP1021", "name": "Ravi Verma", "encoding": np.random.randn(128)},
                {"id": "BSP2344", "name": "Digesh Kumar Tandan", "encoding": np.random.randn(128)}
            ]
            return

        url = f"{self.api_url}/api/employees/embeddings/"
        req = urllib.request.Request(url)
        req.add_header("Authorization", f"Bearer {self.token}")

        try:
            with urllib.request.urlopen(req, timeout=5) as response:
                embeddings_data = json.loads(response.read().decode('utf-8'))
                self.known_faces = []
                for emp in embeddings_data:
                    # Convert JSON vector list back to numpy float32 array
                    vector = np.array(emp["vector"], dtype=np.float32)
                    self.known_faces.append({
                        "id": emp["employee_id"],
                        "name": f"{emp['first_name']} {emp['last_name']}",
                        "encoding": vector
                    })
                print(f"[EMBEDDINGS] Loaded {len(self.known_faces)} employee profiles from database.")
        except Exception as e:
            print(f"[EMBEDDINGS] [ERROR] Could not fetch embeddings: {e}. Enrolling static stubs.")
            self.known_faces = [
                {"id": "BSP1021", "name": "Ravi Verma", "encoding": np.random.randn(128)},
                {"id": "BSP2344", "name": "Digesh Kumar Tandan", "encoding": np.random.randn(128)}
            ]

    def init_ai_models(self):
        """Loads YOLOv8 weights. Falls back to yolov8n.pt if custom PPE model is missing."""
        if not HAS_YOLO:
            print("[AI MODEL] YOLO libraries missing. Bypassing ML load.")
            return

        model_path = "yolov8n.pt"  # Standard COCO detector
        if os.path.exists("yolov8x_ppe.pt"):
            model_path = "yolov8x_ppe.pt"
            print("[AI MODEL] Found custom BSP PPE model weights.")
            
        try:
            self.yolo_model = YOLO(model_path)
            print(f"[AI MODEL] YOLOv8 model '{model_path}' loaded successfully.")
        except Exception as e:
            print(f"[AI MODEL] [ERROR] Failed to load YOLOv8 model: {e}")

    def connect_websocket(self):
        """Establishes connection to the dashboard WebSocket channel."""
        if not HAS_WEBSOCKET:
            return
        try:
            self.ws = create_connection(self.ws_url, timeout=5)
            print(f"[WEBSOCKET] Connected to overlay channel: {self.ws_url}")
        except Exception as e:
            print(f"[WEBSOCKET] [WARNING] Could not establish live WebSocket connection: {e}")

    def detect_violations_hsv(self, person_crop):
        """
        FALLBACK AUDIT: Analyzes the worker crop using HSV color spaces to detect:
        - Helmet: looking for high-intensity yellow/blue/orange in the top 15% of the frame.
        - Vest: looking for high-visibility green/orange in the middle 50% of the frame.
        Returns a dictionary of safety gear compliance state.
        """
        h, w, _ = person_crop.shape
        if h < 40 or w < 40:
            return {"helmet": "Secure", "vest": "Secure", "shoes": "Secure"} # Ignore too small crops

        # Convert to HSV color space
        hsv = cv2.cvtColor(person_crop, cv2.COLOR_BGR2HSV)

        # 1. Helmet check (top 15% of the height)
        head_region = hsv[0:int(h*0.18), 0:w]
        # Yellow safety hardhat range
        lower_yellow = np.array([15, 80, 80])
        upper_yellow = np.array([35, 255, 255])
        yellow_mask = cv2.inRange(head_region, lower_yellow, upper_yellow)
        
        # Blue safety hardhat range
        lower_blue = np.array([90, 50, 50])
        upper_blue = np.array([130, 255, 255])
        blue_mask = cv2.inRange(head_region, lower_blue, upper_blue)
        
        yellow_pixels = cv2.countNonZero(yellow_mask)
        blue_pixels = cv2.countNonZero(blue_mask)
        
        helmet_status = "Secure"
        if yellow_pixels < 25 and blue_pixels < 25:
            helmet_status = "Missing"

        # 2. Safety Vest check (middle 50% of height)
        torso_region = hsv[int(h*0.2):int(h*0.7), 0:w]
        # Neon high-vis green/yellow range
        lower_green = np.array([30, 40, 40])
        upper_green = np.array([85, 255, 255])
        green_mask = cv2.inRange(torso_region, lower_green, upper_green)

        # Orange vest range
        lower_orange = np.array([0, 80, 80])
        upper_orange = np.array([18, 255, 255])
        orange_mask = cv2.inRange(torso_region, lower_orange, upper_orange)

        green_pixels = cv2.countNonZero(green_mask)
        orange_pixels = cv2.countNonZero(orange_mask)

        vest_status = "Secure"
        if green_pixels < 50 and orange_pixels < 50:
            vest_status = "Missing"

        return {"helmet": helmet_status, "vest": vest_status, "shoes": "Secure"}

    def recognize_face(self, frame, bbox):
        """
        Crops head region, runs facial feature extraction and compares with DB.
        """
        x1, y1, x2, y2 = bbox
        # Define face region (approx. top 25% of the person bbox)
        h = y2 - y1
        face_y2 = y1 + int(h * 0.25)
        face_crop = frame[y1:face_y2, x1:x2]

        if face_crop.size == 0:
            return "Unknown Intruder", 0.0

        if not HAS_FACE_REC:
            # Fallback matching if dlib/face_recognition not installed:
            # For real-world systems, we default to unknown since we don't mock faces.
            return "Unknown Worker", 0.0

        try:
            # Convert BGR (OpenCV) to RGB (face_recognition)
            rgb_face = cv2.cvtColor(face_crop, cv2.COLOR_BGR2RGB)
            face_encodings = face_recognition.face_encodings(rgb_face)
            
            if len(face_encodings) == 0:
                return "Unknown Intruder", 0.0

            face_encoding = face_encodings[0]
            
            best_match = "Unknown Intruder"
            min_dist = 1.0

            for emp in self.known_faces:
                # Calculate Euclidean Distance
                dist = np.linalg.norm(emp["encoding"] - face_encoding)
                if dist < min_dist:
                    min_dist = dist
                    best_match = emp["name"]

            # 0.6 is the standard face_recognition threshold
            if min_dist < 0.6:
                confidence = 1.0 - min_dist
                return best_match, confidence
            
            return "Unknown Intruder", 0.0
        except Exception as e:
            # Graceful error bypass
            return "Unknown Intruder", 0.0

    def report_violation(self, employee_id, camera_id, violation_type, severity):
        """Sends a REST API request to report a safety violation with cooldown handling."""
        if not self.token:
            return

        # Cooldown check: prevent flooding alerts for same worker and same violation within 3 minutes
        cooldown_key = f"{employee_id}_{violation_type}"
        last_time = self.last_alert_time.get(cooldown_key, 0)
        if time.time() - last_time < 180:
            return

        url = f"{self.api_url}/api/violations/"
        payload = json.dumps({
            "employee": employee_id,
            "camera": camera_id,
            "violation_type": violation_type,
            "severity": severity,
            "is_resolved": False
        }).encode('utf-8')

        req = urllib.request.Request(
            url, 
            data=payload,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f"Bearer {self.token}"
            },
            method='POST'
        )

        try:
            with urllib.request.urlopen(req, timeout=3) as res:
                self.last_alert_time[cooldown_key] = time.time()
                print(f"[REST API] Safety alarm logged successfully: {violation_type} by {employee_id}")
        except Exception as e:
            print(f"[REST API] Failed to log violation alert: {e}")

    def process_stream(self, source=0, camera_id=1, camera_code="CCTV-BF-01"):
        """Captures frames, processes detections, and broadcasts base64 stream overlays."""
        print(f"\n[STREAM] Opening video capture channel. Source: {source}")
        cap = cv2.VideoCapture(source)
        
        if not cap.isOpened():
            print(f"[STREAM] [ERROR] Could not open video feed source: {source}")
            return

        print("[STREAM] Video channel successfully connected. Hit ESC to stop.")
        
        frame_idx = 0
        try:
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    # End of file or camera drop
                    if isinstance(source, str) and not source.isdigit():
                        # Loop video files if offline
                        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                        continue
                    else:
                        print("[STREAM] Feed dropped. Reconnecting...")
                        time.sleep(2)
                        cap = cv2.VideoCapture(source)
                        continue

                frame_idx += 1
                h, w, _ = frame.shape
                
                # Perform detections at 8 frames per second to prevent network saturation
                if frame_idx % 3 != 0:
                    continue

                detections = []
                persons_coords = []

                # --- 1. PERSON DETECTION ---
                if HAS_YOLO and self.yolo_model is not None:
                    # Run real inference
                    results = self.yolo_model.predict(frame, verbose=False, conf=0.45)
                    for result in results:
                        boxes = result.boxes
                        for box in boxes:
                            cls = int(box.cls[0])
                            # In standard COCO, class 0 is 'person'
                            if cls == 0:
                                xyxy = box.xyxy[0].tolist()
                                persons_coords.append([int(c) for c in xyxy])
                else:
                    # OpenCV cascade detector fallback if YOLO not installed
                    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
                    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
                    for (x, y, fw, fh) in faces:
                        # Extrapolate person box from face box coordinates
                        px = max(0, x - fw)
                        py = max(0, y - fh)
                        pw = fw * 3
                        ph = fh * 8
                        persons_coords.append([px, py, min(w, px+pw), min(h, py+ph)])

                # --- 2. PPE AUDITING & IDENTITY CLASSIFICATION ---
                for idx, (x1, y1, x2, y2) in enumerate(persons_coords):
                    crop = frame[y1:y2, x1:x2]
                    if crop.size == 0:
                        continue

                    # Face Recognition
                    name, conf = self.recognize_face(frame, (x1, y1, x2, y2))
                    # Map name to employee ID for API reporting
                    emp_id = None
                    for emp in self.known_faces:
                        if emp["name"] in name:
                            emp_id = emp["id"]

                    # Check PPE Compliance
                    compliance = self.detect_violations_hsv(crop)
                    
                    # Log alerts on infractions
                    has_violation = False
                    violation_type = None
                    
                    if compliance["helmet"] == "Missing":
                        has_violation = True
                        violation_type = "Helmet Missing"
                        self.report_violation(emp_id, camera_id, "Helmet Missing", "High")
                    elif compliance["vest"] == "Missing":
                        has_violation = True
                        violation_type = "Reflective Jacket Missing"
                        self.report_violation(emp_id, camera_id, "Reflective Jacket Missing", "Medium")

                    # Construct SVG Box overlay format
                    color = "#ef4444" if has_violation else "#10b981"
                    detections.append({
                        "id": idx,
                        "label": f"{name} ({emp_id or 'Unknown'})" if emp_id else "Unknown Worker",
                        "helmet": f"Helmet: {'Missing' if compliance['helmet'] == 'Missing' else 'Ok'}",
                        "shoes": "Shoes: Ok",
                        "vest": f"Vest: {'Missing' if compliance['vest'] == 'Missing' else 'Ok'}",
                        "harness": "N/A",
                        "x": x1,
                        "y": y1,
                        "width": x2 - x1,
                        "height": y2 - y1,
                        "color": color
                    })

                    # Draw local overlay boxes for CV preview
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255) if has_violation else (0, 255, 0), 2)
                    cv2.putText(frame, f"{name}", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

                # --- 3. BROADCAST VIA WEBSOCKET ---
                if self.ws and self.ws.connected:
                    # Compress frame to JPEG
                    _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 60])
                    # Encode to Base64 data url
                    base64_frame = f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"
                    
                    payload = {
                        "camera_code": camera_code,
                        "frame": base64_frame,
                        "detections": detections
                    }
                    try:
                        self.ws.send(json.dumps(payload))
                    except Exception as ws_err:
                        print(f"[WS] Send failed, re-establishing socket: {ws_err}")
                        self.connect_websocket()

                # Local CV diagnostic preview window
                cv2.imshow(f"SAIL BSP - Real Time Inference Feed: {camera_code}", frame)
                if cv2.waitKey(1) & 0xFF == 27: # ESC to abort
                    break

        except KeyboardInterrupt:
            print("\n[STREAM] Feed processing aborted by user.")
        finally:
            cap.release()
            cv2.destroyAllWindows()
            if self.ws:
                self.ws.close()
            print("[STREAM] Camera hardware resources released.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="BSP Safety CCTV Pipeline")
    parser.add_argument("--source", default="0", help="Camera source: 0 (webcam), RTSP stream URL, or video file path")
    parser.add_argument("--camera-id", type=int, default=1, help="Camera Database ID")
    parser.add_argument("--camera-code", default="CCTV-BF-01", help="Camera identifier code")
    args = parser.parse_args()

    # If source is digit, cast to int for OpenCV webcam select
    src = args.source
    if src.isdigit():
        src = int(src)

    pipeline = BSPAISurveillancePipeline()
    pipeline.process_stream(source=src, camera_id=args.camera_id, camera_code=args.camera_code)
