import os
import sys
import time
import random
import json
import urllib.request
import urllib.error

# API Configurations
API_BASE_URL = "http://127.0.0.1:8000/api"
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": "Bearer " # Stays blank since local sandbox runs in permissive or token auth bypass for AI node
}

# BSP Camera feeds mapping
CAMERAS = [
    {"id": 1, "code": "CCTV-BF-01", "name": "Blast Furnace Platform", "dept": "BF"},
    {"id": 2, "code": "CCTV-SMS-02", "name": "SMS Ladle Sector", "dept": "SMS"},
    {"id": 3, "code": "CCTV-CO-03", "name": "Coke Oven battery", "dept": "CO"},
    {"id": 4, "code": "CCTV-PP-04", "name": "Power Plant Generator Area", "dept": "PP"},
    {"id": 5, "code": "CCTV-RM-05", "name": "Rail Mill Storage Bay", "dept": "RM"},
]

# BSP Employee registries
EMPLOYEES = [
    {"id": "BSP1021", "name": "Ravi Verma", "dept": "BF", "designation": "Operator"},
    {"id": "BSP5541", "name": "Amit Sahu", "dept": "SMS", "designation": "Maintenance Engineer"},
    {"id": "BSP8842", "name": "Neeraj Patel", "dept": "PP", "designation": "Plant Operator"},
    {"id": "BSP2344", "name": "Digesh Kumar Tandan", "dept": "IT", "designation": "Senior Developer"},
    {"id": "BSP4002", "name": "Priya Singh", "dept": "CO", "designation": "Process Operator"},
]

VIOLATIONS = [
    {"type": "Helmet Missing", "severity": "High"},
    {"type": "Safety Shoes Missing", "severity": "Medium"},
    {"type": "Safety Belt Missing", "severity": "High"},
    {"type": "Reflective Jacket Missing", "severity": "Low"},
    {"type": "Restricted Area Access", "severity": "Critical"},
]

def make_post_request(url, data, token=None):
    """
    Sends JSON payloads to the Django server using raw urllib (avoiding third-party requests module)
    """
    req = urllib.request.Request(url, method="POST")
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    
    try:
        json_data = json.dumps(data).encode("utf-8")
        with urllib.request.urlopen(req, json_data, timeout=3) as res:
            return json.loads(res.read().decode("utf-8")), None
    except urllib.error.URLError as e:
        return None, str(e)


def fetch_token():
    """
    Attempts to login to safety officer account to authorize AI submissions
    """
    login_url = f"{API_BASE_URL}/auth/login/"
    payload = {"username": "officer", "password": "officer123"}
    res, err = make_post_request(login_url, payload)
    if res and "tokens" in res:
        print("[AI PIPELINE] - Authorized successfully with security credentials.")
        return res["tokens"]["access"]
    print(f"[AI PIPELINE] - Authorization warning (running in sandbox bypass): {err}")
    return None


def run_detection_simulation():
    print("=" * 70)
    print("      SAIL - BHILAI STEEL PLANT AI SURVEILLANCE & PPE ANALYSIS NODE")
    print("=" * 70)
    print("[AI WORKER] Loading YOLOv8 PPE detection weights...")
    time.sleep(1)
    print("[AI WORKER] Loading FaceNet / ArcFace facial classification libraries...")
    time.sleep(1)
    print("[AI WORKER] OpenCV CUDA Core acceleration active (NVIDIA GeForce GPU enabled).")
    print("[AI WORKER] Dynamic CCTV Camera Grid online. Connecting to streaming services...")
    print("-" * 70)

    # Fetch token
    token = fetch_token()
    frame_count = 1000

    try:
        while True:
            frame_count += random.randint(3, 15)
            # Pick a camera stream
            cam = random.choice(CAMERAS)
            print(f"\n[STREAM] OpenCV Frame Grabbed: Camera {cam['code']} | Frame #{frame_count}")

            # Pick a worker
            worker = random.choice(EMPLOYEES)
            
            # Determine detection profile: 70% compliant, 30% violation
            is_compliant = random.random() > 0.35

            if is_compliant:
                # Fully compliant printout simulating YOLOv8 and Face Recognition logs
                print(f"[YOLOv8] Detected Person bounding-box coordinate [x:120, y:80, w:360, h:720] - Conf: 96.8%")
                print(f"[FaceRec] Facial alignment matched embedding. Employee: {worker['name']} ({worker['id']}) - Match Conf: 98.2%")
                print(f"[PPE Check] Helmet: [OK] | Safety Shoes: [OK] | Vest: [OK] | Harness: [N/A] - STATUS: SECURE")
            else:
                # Generate a violation payload
                viol = random.choice(VIOLATIONS)
                
                # Check for restricted area intrusion or standard ppe violation
                if viol['type'] == 'Restricted Area Access':
                    is_unknown = random.random() > 0.5
                    worker_id = None if is_unknown else worker['id']
                    worker_name = "Unknown Intruder" if is_unknown else worker['name']
                    print(f"[YOLOv8] WARNING! Bounding-box entered prohibited polygon: Power Plant Restricted Corridor!")
                    print(f"[FaceRec] Face scan: {'UNKNOWN PERSON' if is_unknown else worker_name} | Match Conf: 42.5%")
                    print(f"[PPE Check] STATUS: CRITICAL - HAZARDOUS INTRUSION REGISTERED")
                else:
                    worker_id = worker['id']
                    worker_name = worker['name']
                    print(f"[YOLOv8] Detected Person: {worker_name} ({worker_id})")
                    print(f"[PPE Check] STATUS: INCOMPLIANT - Missing '{viol['type'].split(' ')[0]}'")

                # Create violation JSON data
                payload = {
                    "employee": worker_id,
                    "camera": cam['id'],
                    "violation_type": viol['type'],
                    "severity": viol['severity'],
                    "is_resolved": False,
                    "notes": f"Simulated detection on {cam['name']}. YOLO confidence: {round(random.uniform(0.78, 0.95), 2)}"
                }

                # Submit to API
                if token:
                    viol_url = f"{API_BASE_URL}/violations/"
                    res, err = make_post_request(viol_url, payload, token)
                    if res:
                        print(f"[REST API] Alarm synced with central database. Violation ID: #{res.get('id')}")
                    else:
                        print(f"[REST API] Connection error: {err}")
                else:
                    print(f"[REST API] Skipping API syncing (auth token missing). Running locally.")

            time.sleep(random.uniform(4.0, 7.0)) # Frame evaluation delay
    except KeyboardInterrupt:
        print("\n[AI WORKER] CCTV Stream Grabber Daemon suspended. Exiting cleanly.")


if __name__ == "__main__":
    # Grace period to allow backend server to launch in background
    time.sleep(2)
    run_detection_simulation()
