import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from safety_monitor.models import (
    Role, Department, Employee, CameraLocation, Camera,
    PPERule, Violation, ViolationImage, Alert, Notification, ComplianceScore
)

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds realistic enterprise database records for Bhilai Steel Plant (BSP) AI safety compliance demo.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING("Starting SAIL Bhilai Steel Plant database seeding pipeline..."))

        # 1. Create Core System Roles
        roles = {}
        for r_name in ['Admin', 'Safety Officer', 'Department Head', 'Security Officer', 'Management']:
            role, created = Role.objects.get_or_create(
                role_name=r_name,
                defaults={'description': f'Authorized {r_name} privileges and dashboard interfaces.'}
            )
            roles[r_name] = role

        # 2. Create Safety Users
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin.safety@sail-bsp.co.in',
                'full_name': 'Rajesh Sharma (Admin)',
                'role': roles['Admin'],
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created administrator user 'admin' (password: admin123)"))

        officer_user, created = User.objects.get_or_create(
            username='officer',
            defaults={
                'email': 'digesh.safety@sail-bsp.co.in',
                'full_name': 'Digesh Kumar Tandan (Safety Officer)',
                'role': roles['Safety Officer']
            }
        )
        if created:
            officer_user.set_password('officer123')
            officer_user.save()
            self.stdout.write(self.style.SUCCESS("Created safety officer user 'officer' (password: officer123)"))

        # 3. Create Departments
        depts_data = [
            ('IT', 'Information Technology Department', 'Central Server Room, Sector 1'),
            ('BF', 'Blast Furnace Department', 'Blast Furnace Platform complex'),
            ('SMS', 'Steel Melting Shop', 'SMS Platform 2 and converter wings'),
            ('PP', 'Power Plant', 'Turbine and high-voltage grid corridors'),
            ('CO', 'Coke Oven', 'Coke battery towers'),
            ('RM', 'Rail & Structural Mill', 'Mill rolling decks and transfer bay'),
            ('SD', 'Safety Department', 'Main Plant administrative zone'),
        ]
        
        depts = {}
        for code, name, loc in depts_data:
            dept, created = Department.objects.get_or_create(
                department_code=code,
                defaults={'department_name': name, 'location_desc': loc}
            )
            depts[code] = dept

        # 4. Create Camera Locations
        loc_data = [
            ('Blast Furnace Zone A', 'Highly Restricted', 'Furnace platform raw casting area'),
            ('SMS Sector 2', 'Restricted', 'Casting and ladle transport corridor'),
            ('Coke Oven Battery 5 Corridor', 'Restricted', 'Battery heating zone pathways'),
            ('Power Plant Corridor', 'Highly Restricted', 'Turbine area generator enclosure'),
            ('Rail Mill Area', 'Standard', 'Rolling mill storage dock'),
            ('Main Plant Entry', 'Standard', 'Main turnstile and registration portals'),
        ]

        locations = {}
        for name, r_lvl, desc in loc_data:
            loc, created = CameraLocation.objects.get_or_create(
                location_name=name,
                defaults={'restricted_level': r_lvl, 'description': desc}
            )
            locations[name] = loc

        # 5. Create CCTV Cameras
        cameras_data = [
            ('CCTV-BF-01', 'Blast Furnace Main Camera', 'rtsp://10.12.44.11/live/h264', 'Blast Furnace Zone A'),
            ('CCTV-SMS-02', 'SMS Ladle Area Camera', 'rtsp://10.12.44.12/live/h264', 'SMS Sector 2'),
            ('CCTV-CO-03', 'Coke Oven Battery Cam', 'rtsp://10.12.44.13/live/h264', 'Coke Oven Battery 5 Corridor'),
            ('CCTV-PP-04', 'Power Plant Generator Room', 'rtsp://10.12.44.14/live/h264', 'Power Plant Corridor'),
            ('CCTV-RM-05', 'Rail Mill Yard Feed', 'rtsp://10.12.44.15/live/h264', 'Rail Mill Area'),
            ('CCTV-ENT-06', 'Main Gate Portal Cam', 'rtsp://10.12.44.16/live/h264', 'Main Plant Entry'),
        ]

        cameras = {}
        for code, name, url, loc_name in cameras_data:
            cam, created = Camera.objects.get_or_create(
                camera_code=code,
                defaults={
                    'camera_name': name,
                    'stream_url': url,
                    'location': locations[loc_name],
                    'status': 'Online'
                }
            )
            cameras[code] = cam

        # 6. Create PPE Rules
        for dept_code, dept in depts.items():
            requires_belt = True if dept_code in ['SMS', 'BF', 'CO'] else False
            PPERule.objects.get_or_create(
                department=dept,
                defaults={
                    'requires_helmet': True,
                    'requires_shoes': True,
                    'requires_vest': True,
                    'requires_belt': requires_belt,
                    'allowed_entry_times': '24x7'
                }
            )

        # 7. Create Employees
        employees_data = [
            ('BSP2344', 'Digesh Kumar', 'Tandan', 'IT', 'Senior Developer', '9876543210', 'digesh.tandan@sail-bsp.co.in', '111122223333'),
            ('BSP1021', 'Ravi', 'Verma', 'BF', 'Blast Furnace Operator', '9876543211', 'ravi.verma@sail-bsp.co.in', '111122224444'),
            ('BSP5541', 'Amit', 'Sahu', 'SMS', 'SMS Maintenance Engineer', '9876543212', 'amit.sahu@sail-bsp.co.in', '111122225555'),
            ('BSP8842', 'Neeraj', 'Patel', 'PP', 'Power Plant Operator', '9876543213', 'neeraj.patel@sail-bsp.co.in', '111122226666'),
            ('BSP3001', 'Rajesh', 'Sharma', 'SD', 'Senior Safety Inspector', '9876543214', 'rajesh.sharma@sail-bsp.co.in', '111122227777'),
            ('BSP4002', 'Priya', 'Singh', 'CO', 'Process Operator', '9876543215', 'priya.singh@sail-bsp.co.in', '111122228888'),
        ]

        employees = []
        for emp_id, first, last, dept_code, desg, mob, mail, aadh in employees_data:
            emp, created = Employee.objects.get_or_create(
                employee_id=emp_id,
                defaults={
                    'first_name': first,
                    'last_name': last,
                    'department': depts[dept_code],
                    'designation': desg,
                    'mobile_number': mob,
                    'email_address': mail,
                    'aadhaar_number': aadh,
                    'employee_status': 'Active',
                    'joining_date': date(2022, 6, 1)
                }
            )
            employees.append(emp)

        # 8. Create Sample Historical Violations & Bounding Boxes
        violation_types = [
            ('Helmet Missing', 'High'),
            ('Safety Shoes Missing', 'Medium'),
            ('Safety Belt Missing', 'High'),
            ('Reflective Jacket Missing', 'Low'),
            ('Restricted Area Access', 'Critical'),
        ]

        today = timezone.localtime(timezone.now())

        self.stdout.write(self.style.WARNING("Populating historical violations (last 7 days)..."))
        
        # Add violation entries
        for i in range(12):
            emp = random.choice(employees)
            v_type, severity = random.choice(violation_types)
            cam = random.choice(list(cameras.values()))
            
            # Scatter timestamps across the last 7 days
            timestamp = today - timedelta(
                days=random.randint(0, 6),
                hours=random.randint(1, 23),
                minutes=random.randint(1, 59)
            )

            violation = Violation.objects.create(
                employee=emp,
                camera=cam,
                violation_type=v_type,
                severity=severity,
                timestamp=timestamp,
                is_resolved=random.choice([True, False])
            )

            # Assign resolution fields if resolved
            if violation.is_resolved:
                violation.resolved_by = officer_user
                violation.resolution_notes = "Compliance restored. Worker corrected attire."
                violation.resolved_at = violation.timestamp + timedelta(minutes=random.randint(10, 120))
                violation.save()

            # Attach evidence coordinates metadata
            bbox_mock = {
                "person": [120, 80, 480, 960],
                "head": [240, 90, 310, 160],
                "vest": [140, 280, 460, 680]
            }
            if v_type == 'Helmet Missing':
                bbox_mock["missing_gear"] = "helmet"
            elif v_type == 'Reflective Jacket Missing':
                bbox_mock["missing_gear"] = "reflective_jacket"

            ViolationImage.objects.create(
                violation=violation,
                raw_image_path=f"evidence/raw_viol_{violation.id}.jpg",
                annotated_image_path=f"evidence/annotated_viol_{violation.id}.jpg",
                bbox_metadata=bbox_mock
            )

            # Create an Alert dispatcher for unresolved high/critical issues
            if not violation.is_resolved and severity in ['High', 'Critical']:
                Alert.objects.create(
                    violation=violation,
                    escalation_level=1 if severity == 'High' else 2,
                    dispatch_status='Sent',
                    dispatch_channel='SMS & Web'
                )

        # 9. Populate Daily Compliance Scores
        self.stdout.write(self.style.WARNING("Computing compliance scorecards..."))
        for i in range(7):
            calc_date = today.date() - timedelta(days=i)
            for code, dept in depts.items():
                total_w = random.randint(15, 45)
                viol_c = random.randint(0, 4)
                comp_w = total_w - viol_c
                
                ComplianceScore.objects.get_or_create(
                    department=dept,
                    calculation_date=calc_date,
                    defaults={
                        'total_workers': total_w,
                        'compliant_workers': comp_w,
                        'violation_count': viol_c
                    }
                )

        # 10. Generate system Notifications
        for emp in employees[:3]:
            Notification.objects.create(
                user=officer_user,
                title="Critical Safety Alarm",
                message=f"Intrusion alert from Camera {random.choice(list(cameras.values())).camera_code}: worker {emp.first_name} {emp.last_name} entering hazardous zone without tether belt.",
                is_read=False
            )

        self.stdout.write(self.style.SUCCESS("SAIL Bhilai Steel Plant Safety Database Seeded Successfully!"))
