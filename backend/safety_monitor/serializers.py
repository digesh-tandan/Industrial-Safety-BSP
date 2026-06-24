from rest_framework import serializers
from .models import (
    Role, Permission, User, Department, Employee, DepartmentHead,
    CameraLocation, Camera, FaceImage, FaceEmbedding, MonitoringSession,
    Violation, ViolationImage, Alert, AlertRecipient, Notification,
    ComplianceScore, AuditLog, LoginHistory, EmployeeActivityLog,
    PPERule, RestrictedArea, AIDetectionLog, SystemSetting
)

# 1. Role & Permission Serializers
class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = '__all__'


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.role_name', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'role', 'role_name', 'is_active']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user


# 2. Department & Employee Serializers
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.department_name', read_only=True)
    department_code = serializers.CharField(source='department.department_code', read_only=True)
    violation_count = serializers.SerializerMethodField()
    violations_count = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = '__all__'

    def get_violation_count(self, obj):
        return obj.violations.count()

    def get_violations_count(self, obj):
        return obj.violations.count()


class DepartmentHeadSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.first_name', read_only=True)
    department_name = serializers.CharField(source='department.department_name', read_only=True)

    class Meta:
        model = DepartmentHead
        fields = '__all__'


# 3. Camera & Location Serializers
class CameraLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CameraLocation
        fields = '__all__'


class CameraSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source='location.location_name', read_only=True)
    restricted_level = serializers.CharField(source='location.restricted_level', read_only=True)

    class Meta:
        model = Camera
        fields = '__all__'


# 4. Face Registration Serializers
class FaceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = FaceImage
        fields = '__all__'


class FaceEmbeddingSerializer(serializers.ModelSerializer):
    class Meta:
        model = FaceEmbedding
        fields = '__all__'


# 5. Violations & Incidents Evidence Serializers
class ViolationImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ViolationImage
        fields = '__all__'


class ViolationSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True, allow_null=True)
    department = serializers.CharField(source='employee.department.department_name', read_only=True, allow_null=True)
    location = serializers.CharField(source='camera.location.location_name', read_only=True)
    camera_code = serializers.CharField(source='camera.camera_code', read_only=True)
    camera_location = serializers.CharField(source='camera.location.location_name', read_only=True)
    evidence = ViolationImageSerializer(many=True, read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.full_name', read_only=True)

    class Meta:
        model = Violation
        fields = '__all__'

    def get_employee_name(self, obj):
        if obj.employee:
            return f"{obj.employee.first_name} {obj.employee.last_name}"
        return "Unknown Worker"


# 6. Alerts & Escalations Serializers
class AlertSerializer(serializers.ModelSerializer):
    violation_details = ViolationSerializer(source='violation', read_only=True)

    class Meta:
        model = Alert
        fields = '__all__'


class AlertRecipientSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertRecipient
        fields = '__all__'


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


class ComplianceScoreSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.department_name', read_only=True)

    class Meta:
        model = ComplianceScore
        fields = '__all__'


# 7. Operational Rules & Logs Serializers
class PPERuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PPERule
        fields = '__all__'


class RestrictedAreaSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source='location.location_name', read_only=True)

    class Meta:
        model = RestrictedArea
        fields = '__all__'


class AIDetectionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIDetectionLog
        fields = '__all__'


class SystemSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSetting
        fields = '__all__'
