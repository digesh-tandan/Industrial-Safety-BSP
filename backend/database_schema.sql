-- =====================================================================
-- DATABASE SCHEMA DESIGN FOR BHILAI STEEL PLANT (BSP)
-- AI-BASED INDUSTRIAL SAFETY MONITORING & PPE COMPLIANCE SYSTEM
-- STEEL AUTHORITY OF INDIA LIMITED (SAIL)
-- Target RDBMS: MySQL 8.0+
-- =====================================================================

CREATE DATABASE IF NOT EXISTS bsp_safety_db;
USE bsp_safety_db;

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
    permission_id INT AUTO_INCREMENT PRIMARY KEY,
    permission_code VARCHAR(100) NOT NULL UNIQUE,
    permission_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Role-Permissions Mapping (Many-to-Many Link)
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
);

-- 4. Custom Users Table (Identity Management)
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    role_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- 5. Departments Table (Blast Furnace, Coke Oven, SMS, etc.)
CREATE TABLE IF NOT EXISTS departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_code VARCHAR(20) NOT NULL UNIQUE,
    department_name VARCHAR(100) NOT NULL,
    location_desc VARCHAR(255),
    is_operational BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 6. Employees Table
CREATE TABLE IF NOT EXISTS employees (
    employee_id VARCHAR(30) PRIMARY KEY, -- BSP style: BSPXXXX
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department_id INT NOT NULL,
    designation VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(15) NOT NULL,
    email_address VARCHAR(100) UNIQUE,
    aadhaar_number VARCHAR(12) UNIQUE,
    employee_status VARCHAR(20) DEFAULT 'Active', -- Active, Blocked, Inactive, Retired
    joining_date DATE NOT NULL,
    profile_image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    INDEX idx_emp_dept (department_id),
    INDEX idx_emp_status (employee_status)
);

-- 7. Department Heads Table
CREATE TABLE IF NOT EXISTS department_heads (
    dept_head_id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT NOT NULL,
    employee_id VARCHAR(30) NOT NULL,
    assigned_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

-- 8. Camera Locations Table
CREATE TABLE IF NOT EXISTS camera_locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    location_name VARCHAR(150) NOT NULL UNIQUE, -- E.g. "Blast Furnace Platform A"
    restricted_level VARCHAR(20) DEFAULT 'Standard', -- Standard, Restricted, Highly Restricted
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Cameras Table (CCTV Registry)
CREATE TABLE IF NOT EXISTS cameras (
    camera_id INT AUTO_INCREMENT PRIMARY KEY,
    camera_code VARCHAR(50) NOT NULL UNIQUE, -- E.g. CCTV-BF-A01
    camera_name VARCHAR(100) NOT NULL,
    stream_url VARCHAR(255) NOT NULL,
    location_id INT NOT NULL,
    resolution_width INT DEFAULT 1920,
    resolution_height INT DEFAULT 1080,
    fps INT DEFAULT 30,
    status VARCHAR(20) DEFAULT 'Online', -- Online, Offline, Maintenance
    last_ping TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES camera_locations(location_id),
    INDEX idx_camera_status (status)
);

-- 10. Face Images Table (360° Facial Directory)
CREATE TABLE IF NOT EXISTS face_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(30) NOT NULL,
    angle_type VARCHAR(20) NOT NULL, -- Front, Left, Right, Upper, Lower, Passport
    image_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    INDEX idx_face_emp (employee_id)
);

-- 11. Face Embeddings Table (Vector Cache for AI Model)
CREATE TABLE IF NOT EXISTS face_embeddings (
    embedding_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(30) NOT NULL,
    vector_data JSON NOT NULL, -- 128 or 512 dimension floating point array
    model_version VARCHAR(50) NOT NULL, -- E.g. Facenet-v1, ArcFace-v2
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

-- 12. Monitoring Sessions Table
CREATE TABLE IF NOT EXISTS monitoring_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    camera_id INT NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL DEFAULT NULL,
    processed_frames INT DEFAULT 0,
    average_fps FLOAT DEFAULT 0.0,
    stream_loss_count INT DEFAULT 0,
    FOREIGN KEY (camera_id) REFERENCES cameras(camera_id)
);

-- 13. Violations Table (Incidents Core Table)
CREATE TABLE IF NOT EXISTS violations (
    violation_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(30) NULL, -- Can be NULL for Unknown Person detection
    camera_id INT NOT NULL,
    violation_type VARCHAR(100) NOT NULL, -- Helmet Missing, Restricted Zone Intrusion, etc.
    severity VARCHAR(20) NOT NULL, -- Low, Medium, High, Critical
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by INT NULL,
    resolution_notes TEXT,
    resolved_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE SET NULL,
    FOREIGN KEY (camera_id) REFERENCES cameras(camera_id),
    FOREIGN KEY (resolved_by) REFERENCES users(user_id),
    INDEX idx_violation_emp (employee_id),
    INDEX idx_violation_type (violation_type),
    INDEX idx_violation_status (is_resolved),
    INDEX idx_violation_time (timestamp)
);

-- 14. Violation Images Table (Incidents Evidence)
CREATE TABLE IF NOT EXISTS violation_images (
    evidence_id INT AUTO_INCREMENT PRIMARY KEY,
    violation_id INT NOT NULL,
    raw_image_path VARCHAR(255) NOT NULL,
    annotated_image_path VARCHAR(255) NOT NULL, -- Bounding boxes drawn
    bbox_metadata JSON NOT NULL, -- Coordinates of boxes: person, helmet, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (violation_id) REFERENCES violations(violation_id) ON DELETE CASCADE
);

-- 15. Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    violation_id INT NOT NULL,
    escalation_level INT DEFAULT 1, -- Level 1: Safety Officer, Level 2: Dept Head, Level 3: Management
    dispatch_channel VARCHAR(30) DEFAULT 'SMS & Web', -- Web, Email, SMS, WhatsApp
    dispatch_status VARCHAR(20) DEFAULT 'Pending', -- Pending, Sent, Failed
    escalated_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (violation_id) REFERENCES violations(violation_id) ON DELETE CASCADE,
    INDEX idx_alert_status (dispatch_status)
);

-- 16. Alert Recipients Table
CREATE TABLE IF NOT EXISTS alert_recipients (
    recipient_id INT AUTO_INCREMENT PRIMARY KEY,
    alert_id INT NOT NULL,
    user_id INT NOT NULL,
    received_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (alert_id) REFERENCES alerts(alert_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 17. Notifications Table (Dashboard Push System)
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_notification_user (user_id, is_read)
);

-- 18. Compliance Scores Table
CREATE TABLE IF NOT EXISTS compliance_scores (
    score_id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT NOT NULL,
    calculation_date DATE NOT NULL,
    total_workers INT DEFAULT 0,
    compliant_workers INT DEFAULT 0,
    violation_count INT DEFAULT 0,
    compliance_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        IF(total_workers > 0, (compliant_workers / total_workers) * 100, 100.00)
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE,
    UNIQUE KEY uq_dept_date (department_id, calculation_date)
);

-- 19. Audit Logs Table (Admin Tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action_performed VARCHAR(100) NOT NULL,
    target_table VARCHAR(50) NOT NULL,
    record_id VARCHAR(50) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 20. Login History Table
CREATE TABLE IF NOT EXISTS login_history (
    login_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    browser_agent VARCHAR(255),
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 21. Employee Activity Logs Table
CREATE TABLE IF NOT EXISTS employee_activity_logs (
    activity_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(30) NOT NULL,
    camera_id INT NOT NULL,
    zone_entered VARCHAR(100),
    entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (camera_id) REFERENCES cameras(camera_id) ON DELETE CASCADE
);

-- 22. PPE Rules Table
CREATE TABLE IF NOT EXISTS ppe_rules (
    rule_id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT NOT NULL,
    requires_helmet BOOLEAN DEFAULT TRUE,
    requires_shoes BOOLEAN DEFAULT TRUE,
    requires_vest BOOLEAN DEFAULT TRUE,
    requires_belt BOOLEAN DEFAULT FALSE,
    allowed_entry_times VARCHAR(100) DEFAULT '24x7',
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE
);

-- 23. Restricted Areas Table
CREATE TABLE IF NOT EXISTS restricted_areas (
    area_id INT AUTO_INCREMENT PRIMARY KEY,
    location_id INT NOT NULL,
    area_name VARCHAR(100) NOT NULL,
    polygon_coordinates JSON NOT NULL, -- JSON coordinates representing the hazard boundaries
    hazard_level VARCHAR(20) DEFAULT 'High', -- Medium, High, Extreme
    authorized_roles TEXT, -- Comma-separated designations permitted
    FOREIGN KEY (location_id) REFERENCES camera_locations(location_id) ON DELETE CASCADE
);

-- 24. AI Detection Logs Table (Accuracy Auditing)
CREATE TABLE IF NOT EXISTS ai_detection_logs (
    detection_log_id INT AUTO_INCREMENT PRIMARY KEY,
    camera_id INT NOT NULL,
    frame_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    persons_detected INT DEFAULT 0,
    helmets_detected INT DEFAULT 0,
    vests_detected INT DEFAULT 0,
    shoes_detected INT DEFAULT 0,
    belts_detected INT DEFAULT 0,
    processing_time_ms INT DEFAULT 0,
    FOREIGN KEY (camera_id) REFERENCES cameras(camera_id) ON DELETE CASCADE
);

-- 25. System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed Essential Roles and System Settings
INSERT INTO roles (role_name, description) VALUES
('Admin', 'Full system access and configurations control'),
('Safety Officer', 'Manage employees, view and resolve safety violations'),
('Department Head', 'Monitor department-specific safety metrics and reports'),
('Security Officer', 'Monitor real-time feeds and handle restricted intrusion alerts'),
('Management', 'View plant-wide safety metrics and analytical charts');
