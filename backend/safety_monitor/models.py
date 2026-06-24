from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

# 1. Roles Table
class Role(models.Model):
    role_name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.role_name


# 2. Permissions Table
class Permission(models.Model):
    permission_code = models.CharField(max_length=100, unique=True)
    permission_name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.permission_name


# 3. Custom Users Table (Identity Management extending standard Django user)
class User(AbstractUser):
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=150)
    updated_at = models.DateTimeField(auto_now=True)

    # Resolve reverse collision properties for groups and user permissions
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    def __str__(self):
        return f"{self.username} ({self.role})"


# 4. Departments Table
class Department(models.Model):
    department_code = models.CharField(max_length=20, unique=True) # BF, SMS, CO, etc.
    department_name = models.CharField(max_length=100)
    location_desc = models.CharField(max_length=255, blank=True, null=True)
    is_operational = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.department_name


# 5. Employees Table
class Employee(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Blocked', 'Blocked'),
        ('Inactive', 'Inactive'),
        ('Retired', 'Retired'),
    ]

    employee_id = models.CharField(max_length=30, primary_key=True) # E.g., BSP2344
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    department = models.ForeignKey(Department, on_delete=models.PROTECT, related_name='employees')
    designation = models.CharField(max_length=100)
    mobile_number = models.CharField(max_length=15)
    email_address = models.EmailField(unique=True, blank=True, null=True)
    aadhaar_number = models.CharField(max_length=12, unique=True, blank=True, null=True)
    employee_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    joining_date = models.DateField()
    profile_image_path = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['department']),
            models.Index(fields=['employee_status']),
        ]

    def __str__(self):
        return f"{self.employee_id} - {self.first_name} {self.last_name}"


# 6. Department Heads Table
class DepartmentHead(models.Model):
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='heads')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    assigned_date = models.DateField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.employee} Head of {self.department}"


# 7. Camera Locations Table
class CameraLocation(models.Model):
    RESTRICTED_LEVELS = [
        ('Standard', 'Standard'),
        ('Restricted', 'Restricted'),
        ('Highly Restricted', 'Highly Restricted'),
    ]
    location_name = models.CharField(max_length=150, unique=True)
    restricted_level = models.CharField(max_length=20, choices=RESTRICTED_LEVELS, default='Standard')
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.location_name


# 8. Cameras Table (CCTV Registry)
class Camera(models.Model):
    STATUS_CHOICES = [
        ('Online', 'Online'),
        ('Offline', 'Offline'),
        ('Maintenance', 'Maintenance'),
    ]

    camera_code = models.CharField(max_length=50, unique=True) # E.g., CCTV-BF-A01
    camera_name = models.CharField(max_length=100)
    stream_url = models.CharField(max_length=255)
    location = models.ForeignKey(CameraLocation, on_delete=models.PROTECT, related_name='cameras')
    resolution_width = models.IntegerField(default=1920)
    resolution_height = models.IntegerField(default=1080)
    fps = models.IntegerField(default=30)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Online')
    last_ping = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.camera_code} ({self.camera_name})"


# 9. Face Images Table (360° Facial Directory)
class FaceImage(models.Model):
    ANGLE_CHOICES = [
        ('Front', 'Front Face'),
        ('Left', 'Left Angle'),
        ('Right', 'Right Angle'),
        ('Upper', 'Upper Angle'),
        ('Lower', 'Lower Angle'),
        ('Passport', 'Passport Style'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='face_images')
    angle_type = models.CharField(max_length=20, choices=ANGLE_CHOICES)
    image_path = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee.employee_id} - {self.angle_type}"


# 10. Face Embeddings Table (Vector Cache for AI Model)
class FaceEmbedding(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='embeddings')
    vector_data = models.JSONField() # Holds 128 or 512 dimensions array
    model_version = models.CharField(max_length=50) # E.g. Facenet-v1, ArcFace-v2
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Embedding for {self.employee_id} ({self.model_version})"


# 11. Monitoring Sessions Table
class MonitoringSession(models.Model):
    camera = models.ForeignKey(Camera, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(blank=True, null=True)
    processed_frames = models.IntegerField(default=0)
    average_fps = models.FloatField(default=0.0)
    stream_loss_count = models.IntegerField(default=0)

    def __str__(self):
        return f"Session {self.id} on {self.camera.camera_code}"


# 12. Violations Table (Incidents Core Table)
class Violation(models.Model):
    SEVERITY_CHOICES = [
        ('Low', 'Low Severity'),
        ('Medium', 'Medium Severity'),
        ('High', 'High Severity'),
        ('Critical', 'Critical Severity'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='violations')
    camera = models.ForeignKey(Camera, on_delete=models.PROTECT)
    violation_type = models.CharField(max_length=100) # Helmet Missing, Shoes Missing, Belt Missing, Restricted Zone Intrusion
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    timestamp = models.DateTimeField(default=timezone.now)
    is_resolved = models.BooleanField(default=False)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_violations')
    resolution_notes = models.TextField(blank=True, null=True)
    resolved_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        indexes = [
            models.Index(fields=['employee']),
            models.Index(fields=['violation_type']),
            models.Index(fields=['is_resolved']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        emp_label = f"{self.employee}" if self.employee else "Unknown Worker"
        return f"{self.violation_type} by {emp_label} at {self.timestamp.strftime('%Y-%m-%d %H:%M')}"


# 13. Violation Images Table (Incidents Evidence)
class ViolationImage(models.Model):
    violation = models.ForeignKey(Violation, on_delete=models.CASCADE, related_name='evidence')
    raw_image_path = models.CharField(max_length=255)
    annotated_image_path = models.CharField(max_length=255)
    bbox_metadata = models.JSONField() # JSON object coordinates of boxes
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Evidence for Violation #{self.violation.id}"


# 14. Alerts Table
class Alert(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending Action'),
        ('Sent', 'Sent / Dispatched'),
        ('Failed', 'Dispatch Failed'),
    ]

    violation = models.ForeignKey(Violation, on_delete=models.CASCADE, related_name='alerts')
    escalation_level = models.IntegerField(default=1) # 1: Safety Officer, 2: Dept Head, 3: Management
    dispatch_channel = models.CharField(max_length=30, default='SMS & Web')
    dispatch_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    escalated_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['dispatch_status']),
        ]

    def __str__(self):
        return f"Alert Lvl {self.escalation_level} - Viol #{self.violation.id} [{self.dispatch_status}]"


# 15. Alert Recipients Table
class AlertRecipient(models.Model):
    alert = models.ForeignKey(Alert, on_delete=models.CASCADE, related_name='recipients')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    received_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Recipient {self.user.username} for Alert #{self.alert.id}"


# 16. Notifications Table (Dashboard Push System)
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=150)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'is_read']),
        ]

    def __str__(self):
        return f"Notification for {self.user.username}: {self.title}"


# 17. Compliance Scores Table (Daily calculations by department)
class ComplianceScore(models.Model):
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    calculation_date = models.DateField()
    total_workers = models.IntegerField(default=0)
    compliant_workers = models.IntegerField(default=0)
    violation_count = models.IntegerField(default=0)
    compliance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=100.00)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('department', 'calculation_date')

    def save(self, *args, **kwargs):
        if self.total_workers > 0:
            self.compliance_percentage = round((self.compliant_workers / self.total_workers) * 100, 2)
        else:
            self.compliance_percentage = 100.00
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.department.department_code} - {self.calculation_date}: {self.compliance_percentage}%"


# 18. Audit Logs Table (Admin Action Tracking)
class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action_performed = models.CharField(max_length=100)
    target_table = models.CharField(max_length=50)
    record_id = models.CharField(max_length=50)
    details = models.TextField(blank=True, null=True)
    ip_address = models.CharField(max_length=45, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.action_performed} at {self.timestamp}"


# 19. Login History Table
class LoginHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    ip_address = models.CharField(max_length=45)
    browser_agent = models.CharField(max_length=255, blank=True, null=True)
    login_time = models.DateTimeField(auto_now_add=True)
    logout_time = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} login at {self.login_time}"


# 20. Employee Activity Logs Table (Intrusion tracking)
class EmployeeActivityLog(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    camera = models.ForeignKey(Camera, on_delete=models.CASCADE)
    zone_entered = models.CharField(max_length=100, blank=True, null=True)
    entered_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.employee.employee_id} entered {self.zone_entered} at {self.entered_at}"


# 21. PPE Rules Table (Customized requirement limits)
class PPERule(models.Model):
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='ppe_rules')
    requires_helmet = models.BooleanField(default=True)
    requires_shoes = models.BooleanField(default=True)
    requires_vest = models.BooleanField(default=True)
    requires_belt = models.BooleanField(default=False)
    allowed_entry_times = models.CharField(max_length=100, default='24x7')

    def __str__(self):
        return f"PPE Rules for {self.department.department_name}"


# 22. Restricted Areas Table
class RestrictedArea(models.Model):
    HAZARD_CHOICES = [
        ('Medium', 'Medium Hazard'),
        ('High', 'High Hazard'),
        ('Extreme', 'Extreme Hazard'),
    ]

    location = models.ForeignKey(CameraLocation, on_delete=models.CASCADE, related_name='restricted_areas')
    area_name = models.CharField(max_length=100)
    polygon_coordinates = models.JSONField() # Coordinates map E.g. [[x1,y1], [x2,y2], ...]
    hazard_level = models.CharField(max_length=20, choices=HAZARD_CHOICES, default='High')
    authorized_roles = models.TextField(help_text="Comma-separated authorized designations")

    def __str__(self):
        return f"{self.area_name} ({self.location.location_name}) - {self.hazard_level}"


# 23. AI Detection Logs Table (Analytics precision checks)
class AIDetectionLog(models.Model):
    camera = models.ForeignKey(Camera, on_delete=models.CASCADE)
    frame_timestamp = models.DateTimeField(auto_now_add=True)
    persons_detected = models.IntegerField(default=0)
    helmets_detected = models.IntegerField(default=0)
    vests_detected = models.IntegerField(default=0)
    shoes_detected = models.IntegerField(default=0)
    belts_detected = models.IntegerField(default=0)
    processing_time_ms = models.IntegerField(default=0)

    def __str__(self):
        return f"Log #{self.id} for Cam {self.camera.camera_code} at {self.frame_timestamp}"


# 24. System Settings Table
class SystemSetting(models.Model):
    setting_key = models.CharField(max_length=100, unique=True)
    setting_value = models.TextField()
    description = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.setting_key
