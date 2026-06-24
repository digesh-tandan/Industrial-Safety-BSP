from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    Role, User, Department, Employee, DepartmentHead,
    CameraLocation, Camera, FaceImage, FaceEmbedding,
    Violation, ViolationImage, Alert, PPERule, RestrictedArea, ComplianceScore
)

# Customize UserAdmin to support custom fields in the Admin UI
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['username', 'email', 'full_name', 'role', 'is_active', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role', 'full_name')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('role', 'full_name', 'email')}),
    )

# Register models in Admin UI
admin.site.register(User, CustomUserAdmin)
admin.site.register(Role)
admin.site.register(Department)
admin.site.register(Employee)
admin.site.register(DepartmentHead)
admin.site.register(CameraLocation)
admin.site.register(Camera)
admin.site.register(FaceImage)
admin.site.register(FaceEmbedding)
admin.site.register(Violation)
admin.site.register(ViolationImage)
admin.site.register(Alert)
admin.site.register(PPERule)
admin.site.register(RestrictedArea)
admin.site.register(ComplianceScore)
