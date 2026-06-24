# BSP AI Safety & PPE Compliance Portal
### Real-Time Surveillance & Safety Violation Alert System for Bhilai Steel Plant (SAIL)

An advanced edge-to-cloud computer vision and surveillance analytics platform designed for the **Bhilai Steel Plant (BSP)** under **Steel Authority of India Limited (SAIL)**. The system processes live CCTV camera feeds to perform real-time PPE compliance audits (helmet, vest, shoe detection) and facial identification, triggering instant visual alerts and managing violation workflows.

---

## 🚀 Key Features

* **Real-Time AI Surveillance:** Employs **YOLOv8** for high-speed object detection of PPE items (Safety Helmets, High-Vis Vests, Safety Shoes) and **FaceNet/ArcFace** for worker identification.
* **Live SCADA-Style Dashboard:** An interactive React SPA featuring a dark mode SCADA-style UI, real-time KPI indicators, live video stream grids, active alert popups, and department scorecards.
* **WebSocket Live Streams:** Low-latency live detection streams broadcasted from Django ASGI Channels to frontend clients.
* **Entity Management & RBAC:** Comprehensive Role-Based Access Control (RBAC) supporting Safety Officers, Department Heads, System Admins, and Security Personnel.
* **Automated Safety Reports:** On-demand generation and export of PDF and Excel safety audit logs.
* **Vercel Offline Fallback Mode:** The frontend is configured to run fully offline when deployed to Vercel without requiring a local Django server connection, using pre-seeded local safety datasets.

---

## 🛠️ Technology Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React (Vite), Tailwind CSS, React Icons | High-performance component rendering & modern UI aesthetics. |
| **Backend** | Django, Django REST Framework | Secure, modular REST APIs with robust ORM database interfaces. |
| **Real-Time Websockets** | Django Channels (ASGI), Redis | Asynchronous, concurrent WebSocket streams for video frames. |
| **AI Surveillance Engine** | Python, Ultralytics YOLOv8, OpenCV | GPU-accelerated deep learning inference pipeline. |
| **Database** | MySQL (Production) / SQLite (Local) | Reliable transactional storage for logs and configurations. |

---

## 📂 Project Structure

```
Industrial_Safety_SAIL/
├── frontend/             # Vite + React SPA dashboard
│   ├── src/
│   │   ├── context/      # DashboardContext & Auth state with Vercel fallbacks
│   │   ├── pages/        # Dashboard, Analytics, Employees, Violations, Reports
│   │   └── components/   # Camera grid overlays, Sidebar, Theme Toggle
│   └── package.json
│
├── backend/              # Django REST API server
│   ├── bsp_safety_backend/ # Core project config & ASGI channels
│   ├── safety_monitor/     # DB models, custom commands, APIs & auth views
│   └── requirements.txt
│
├── ai_service/           # OpenCV + YOLOv8 inference scripts
│   ├── pipeline.py       # Core frame processing and API push pipeline
│   └── simulation.py     # Live stream mock camera feed generator
│
└── README.md             # Project documentation manual
```

---

## ⚙️ Quick Start Guide (Local Setup)

### 1. Database & Backend Server Setup
1. **Navigate to the Backend Folder:**
   ```bash
   cd backend
   ```
2. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Run Migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
4. **Seed the SAIL/BSP Database:**
   Seeds default departments, cameras, safety rules, and employees.
   ```bash
   python manage.py seed_bsp_data
   ```
5. **Start the ASGI Web Server:**
   ```bash
   uvicorn bsp_safety_backend.asgi:application --host 127.0.0.1 --port 8000
   ```

### 2. Frontend React Setup
1. **Navigate to the Frontend Folder:**
   ```bash
   cd ../frontend
   ```
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Run Vite Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

### 3. AI Service & Video Simulator Setup
1. **Navigate to the AI Service Folder:**
   ```bash
   cd ../ai_service
   ```
2. **Install Dependencies:**
   ```bash
   pip install ultralytics opencv-python numpy requests
   ```
3. **Run Live Mock Video Feed Simulation:**
   Translates video frame bounding boxes and pushes simulated camera feed packets to the ASGI WebSocket channel.
   ```bash
   python simulation.py
   ```

---

## ☁️ Vercel Deployment & Offline Fallback

This portal can be deployed strictly as a frontend application on **Vercel** via GitHub integration.

### 🔒 Logging In on Vercel (Offline Mode)
When deployed to Vercel, the application dynamically detects if the local backend server (`127.0.0.1:8000`) is offline. To bypass connection errors and demonstrate the portal's complete features, use the default credentials to log in:

* **Safety Officer Console:**
  * **Username:** `officer`
  * **Password:** `officer123`
* **Admin Management Console:**
  * **Username:** `admin`
  * **Password:** `admin123`

Once logged in, the UI will fall back to local pre-seeded datasets, letting you inspect alerts, interact with charts, add mock employees, and resolve compliance violations.
