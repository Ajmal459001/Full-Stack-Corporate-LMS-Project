from django.contrib import admin
from .models import User

@admin.register(User)
class CustomUserAdmin(admin.ModelAdmin):
    # This controls what columns you see on the main list page
    list_display = ('username', 'email', 'role', 'department', 'is_staff')
    
    # This adds a filter sidebar so you can sort by roles
    list_filter = ('role', 'is_staff', 'is_superuser')
    
    # This organizes the individual user edit page into sections
    fieldsets = (
        ('Login Credentials', {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Role & Permissions', {'fields': ('role', 'department', 'is_active', 'is_staff', 'is_superuser')}),
    )