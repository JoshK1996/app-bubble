#!/usr/bin/env python3

"""
Django project setup script
This script creates a basic Django project structure with a sample API app
"""

import os
import sys
import subprocess
import shutil

# Create requirements.txt file
with open('requirements.txt', 'w') as f:
    f.write('Django>=4.2.0\n')
    f.write('djangorestframework>=3.14.0\n')
    f.write('django-cors-headers>=4.0.0\n')

# Create virtual environment and install dependencies
print("Setting up Django project structure...")

# Create project structure
os.makedirs('django_project', exist_ok=True)
os.makedirs('django_project/api', exist_ok=True)

# Create manage.py
with open('django_project/manage.py', 'w') as f:
    f.write('''#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_project.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
''')

# Create django_project/__init__.py
with open('django_project/django_project/__init__.py', 'w') as f:
    f.write('')

# Create django_project/settings.py
with open('django_project/django_project/settings.py', 'w') as f:
    f.write('''"""
Django settings for django_project project.
"""

from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-sample-key-for-development-only'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'django_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'django_project.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS settings
CORS_ALLOW_ALL_ORIGINS = True
''')

# Create django_project/urls.py
with open('django_project/django_project/urls.py', 'w') as f:
    f.write('''"""
URL configuration for django_project project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
''')

# Create django_project/wsgi.py
with open('django_project/django_project/wsgi.py', 'w') as f:
    f.write('''"""
WSGI config for django_project project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_project.settings')

application = get_wsgi_application()
''')

# Create django_project/asgi.py
with open('django_project/django_project/asgi.py', 'w') as f:
    f.write('''"""
ASGI config for django_project project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_project.settings')

application = get_asgi_application()
''')

# Create api app files
os.makedirs('django_project/api', exist_ok=True)

# Create api/__init__.py
with open('django_project/api/__init__.py', 'w') as f:
    f.write('')

# Create api/models.py
with open('django_project/api/models.py', 'w') as f:
    f.write('''from django.db import models

class Item(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
''')

# Create api/serializers.py
with open('django_project/api/serializers.py', 'w') as f:
    f.write('''from rest_framework import serializers
from .models import Item

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
''')

# Create api/views.py
with open('django_project/api/views.py', 'w') as f:
    f.write('''from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from .models import Item
from .serializers import ItemSerializer

@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'items': reverse('item-list', request=request, format=format)
    })

class ItemViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    `update` and `destroy` actions.
    """
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
''')

# Create api/urls.py
with open('django_project/api/urls.py', 'w') as f:
    f.write('''from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'items', views.ItemViewSet)

urlpatterns = [
    path('', views.api_root),
    path('', include(router.urls)),
]
''')

# Create api/admin.py
with open('django_project/api/admin.py', 'w') as f:
    f.write('''from django.contrib import admin
from .models import Item

admin.site.register(Item)
''')

# Create api/apps.py
with open('django_project/api/apps.py', 'w') as f:
    f.write('''from django.apps import AppConfig

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
''')

print("Django project structure created successfully!")
