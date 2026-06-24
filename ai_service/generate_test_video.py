import cv2
import numpy as np
import os
import random

def create_test_video(output_path="test_footage.mp4", duration_sec=300, fps=10):
    """
    Generates a 5-minute (300s) synthetic video at 10 FPS (3000 frames) representing
    a Bhilai Steel Plant factory floor background with walking workers wearing
    various PPE combinations (compliant, missing helmet, missing vest, sliders/sandals, etc.).
    """
    width, height = 800, 450
    total_frames = duration_sec * fps
    
    # Initialize Video Writer using MP4V codec
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    if not out.isOpened():
        print("[ERROR] Could not open video writer. Checking fallbacks...")
        fourcc = cv2.VideoWriter_fourcc(*'XVID')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        if not out.isOpened():
            print("[ERROR] Failed to initialize video writer.")
            return

    print(f"[GENERATOR] Compiling {duration_sec}s test video ({total_frames} frames)...")
    print(f"[GENERATOR] Target output path: {os.path.abspath(output_path)}")

    # Define worker scenarios to cycle through
    # Each profile describes: name, BGR color, ppe gear configurations, and speed
    worker_profiles = [
        # 1. Fully Compliant Worker (Ravi Verma)
        {"name": "Ravi Verma", "helmet": True, "vest": True, "shoes": True, "color": (16, 185, 129)},
        # 2. Missing Helmet (Amit Sahu)
        {"name": "Amit Sahu", "helmet": False, "vest": True, "shoes": True, "color": (245, 158, 11)},
        # 3. Missing Vest (Neeraj Patel)
        {"name": "Neeraj Patel", "helmet": True, "vest": False, "shoes": True, "color": (245, 158, 11)},
        # 4. Incompliant / No PPE (Unknown Intruder)
        {"name": "Unknown Worker", "helmet": False, "vest": False, "shoes": False, "color": (239, 68, 68)},
        # 5. Missing Shoes / Sliders (Priya Singh)
        {"name": "Priya Singh", "helmet": True, "vest": True, "shoes": False, "color": (245, 158, 11)},
        # 6. Fully Compliant (Digesh Kumar Tandan)
        {"name": "Digesh Kumar", "helmet": True, "vest": True, "shoes": True, "color": (16, 185, 129)}
    ]

    # Spawn schedule: list of workers, their start frame, and walking speed
    active_workers = []
    
    # Generate schedule across 3000 frames
    for i in range(len(worker_profiles)):
        start_frame = i * 450  # Space them out
        profile = worker_profiles[i]
        active_workers.append({
            "profile": profile,
            "x": -100,  # Start off-screen left
            "y": 230 + random.randint(-15, 15),
            "start": start_frame,
            "speed": random.randint(4, 7),
            "active": False
        })

    # Repeating loop to ensure continuous workers flow throughout 5 minutes
    for cycle in range(1, 3):
        for i, profile in enumerate(worker_profiles):
            start_frame = (len(worker_profiles) * 450 * cycle) + (i * 300)
            if start_frame < total_frames:
                active_workers.append({
                    "profile": profile,
                    "x": -100,
                    "y": 230 + random.randint(-15, 15),
                    "start": start_frame,
                    "speed": random.randint(4, 7),
                    "active": False
                })

    # Render Frame by Frame
    for frame_idx in range(total_frames):
        # 1. Draw Background (Factory floor / SCADA look)
        frame = np.ones((height, width, 3), dtype=np.uint8) * 20  # Dark background
        
        # Draw floor line
        cv2.line(frame, (0, 360), (width, 360), (60, 60, 60), 3)
        # Draw background grids
        for gx in range(0, width, 80):
            cv2.line(frame, (gx, 0), (gx, 360), (30, 30, 30), 1)
        for gy in range(0, 360, 60):
            cv2.line(frame, (0, gy), (width, gy), (30, 30, 30), 1)

        # Draw a restricted yellow/black striped warning area box
        # Representing "Blast Furnace Restricted Entry Zone"
        cv2.rectangle(frame, (500, 200), (750, 360), (10, 20, 30), -1)
        cv2.rectangle(frame, (500, 200), (750, 360), (0, 165, 255), 2)
        # Warning text
        cv2.putText(frame, "RESTRICTED AREA: CASING DECK", (510, 225), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 165, 255), 1)
        
        # 2. Update and Draw Workers
        for worker in active_workers:
            # Check if it's time to spawn the worker
            if frame_idx >= worker["start"] and not worker["active"] and worker["x"] < 0:
                worker["active"] = True
            
            if worker["active"]:
                # Walk from left to right
                worker["x"] += worker["speed"]
                
                # Deactivate if offscreen right
                if worker["x"] > width + 100:
                    worker["active"] = False
                    continue
                
                # Draw the worker silhouette (a bounding box representing a person)
                wx, wy = worker["x"], worker["y"]
                w_width, w_height = 80, 160
                
                # Draw main body trunk (Gray overalls)
                cv2.rectangle(frame, (wx, wy), (wx + w_width, wy + w_height), (90, 90, 90), -1)
                cv2.rectangle(frame, (wx, wy), (wx + w_width, wy + w_height), (150, 150, 150), 1)

                # Draw Head (Skin tone)
                head_cx = wx + w_width // 2
                head_cy = wy - 15
                cv2.circle(frame, (head_cx, head_cy), 18, (180, 220, 240), -1)

                # --- DRAW PPE GEAR ---
                profile = worker["profile"]
                
                # A. Safety Helmet (Yellow cap on top of head)
                if profile["helmet"]:
                    # Draw a solid bright yellow half-circle cap on top of head
                    cv2.ellipse(frame, (head_cx, head_cy - 4), (19, 13), 0, 180, 360, (0, 235, 255), -1)
                    # Helmet brim
                    cv2.line(frame, (head_cx - 24, head_cy - 4), (head_cx + 24, head_cy - 4), (0, 235, 255), 3)
                else:
                    # Draw normal hair (Black cap overlay)
                    cv2.ellipse(frame, (head_cx, head_cy - 6), (18, 10), 0, 180, 360, (20, 20, 20), -1)

                # B. Safety High-Vis Vest (Neon green/yellow overlay over torso)
                if profile["vest"]:
                    # Neon Green (BGR: 0, 255, 0)
                    cv2.rectangle(frame, (wx + 10, wy + 20), (wx + w_width - 10, wy + 90), (0, 255, 0), -1)
                    # Add silver reflective stripes
                    cv2.line(frame, (wx + 20, wy + 35), (wx + w_width - 20, wy + 35), (220, 220, 220), 4)
                    cv2.line(frame, (wx + 20, wy + 70), (wx + w_width - 20, wy + 70), (220, 220, 220), 4)
                
                # C. Safety Shoes (Solid black rectangles) vs Sliders/Sandals (Skin color / Brown)
                if profile["shoes"]:
                    # Left shoe BGR (0,0,0)
                    cv2.rectangle(frame, (wx + 12, wy + w_height), (wx + 32, wy + w_height + 12), (0, 0, 0), -1)
                    # Right shoe
                    cv2.rectangle(frame, (wx + w_width - 32, wy + w_height), (wx + w_width - 12, wy + w_height + 12), (0, 0, 0), -1)
                else:
                    # Sliders: Brown straps BGR (20, 50, 100) and skin color
                    cv2.rectangle(frame, (wx + 12, wy + w_height), (wx + 32, wy + w_height + 8), (20, 20, 230), -1)
                    cv2.rectangle(frame, (wx + w_width - 32, wy + w_height), (wx + w_width - 12, wy + w_height + 8), (20, 20, 230), -1)

                # Draw legs (overall pants)
                cv2.rectangle(frame, (wx + 15, wy + 90), (wx + 35, wy + w_height), (70, 70, 70), -1)
                cv2.rectangle(frame, (wx + w_width - 35, wy + 90), (wx + w_width - 15, wy + w_height), (70, 70, 70), -1)

                # Label showing name / description
                cv2.putText(frame, profile["name"], (wx, wy - 40), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1)

        # 3. Add overlay text detailing simulation frames
        cv2.putText(frame, f"BSP CAMERA SIMULATOR - FRAME: {frame_idx}/{total_frames}", (15, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)
        cv2.putText(frame, "SCENARIO: Workers entry portal tracking", (15, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 200, 200), 1)
        
        # Write Frame
        out.write(frame)

    out.release()
    print(f"[GENERATOR] Video generated successfully. Total Frames: {total_frames}")

if __name__ == "__main__":
    create_test_video(output_path="test_footage.mp4", duration_sec=300, fps=10)
