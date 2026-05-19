from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('INSTRUCTOR', 'Instructor'),
        ('EMPLOYEE', 'Employee'),
    )
    
    
    role = models.CharField(db_index=True, max_length=15, choices=ROLE_CHOICES, default='EMPLOYEE')
    department = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"{self.username} - {self.role}"