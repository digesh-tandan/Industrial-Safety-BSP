import os
from pathlib import Path
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-bsp-safety-secret-key-steel-authority-of-india-limited'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']

# Application definition
INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third Party Apps
    'rest_framework',
    'corsheaders',
    'channels',
    # Local Apps
    'safety_monitor',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # Must be at the top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'bsp_safety_backend.urls'

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

WSGI_APPLICATION = 'bsp_safety_backend.wsgi.application'
ASGI_APPLICATION = 'bsp_safety_backend.asgi.application'

# Database Setup with Smart Fallback (MySQL Production -> SQLite Development)
# This guarantees immediate runnability for demonstrations while providing the complete production layout.
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Optional MySQL configuration string, loaded if environmental variables exist or if specified:
MYSQL_CONFIG = {
    'ENGINE': 'django.db.backends.mysql',
    'NAME': 'bsp_safety_db',
    'USER': 'root',
    'PASSWORD': '',
    'HOST': 'localhost',
    'PORT': '3306',
}

# If explicitly running in production or mysql is available, use MySQL
if os.environ.get('USE_MYSQL') == 'True':
    DATABASES['default'] = MYSQL_CONFIG

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata' # Set to SAIL Bhilai local time
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media upload storage for employee face captures & violation snapshots
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Configure Custom User Model to extend roles
AUTH_USER_MODEL = 'safety_monitor.User'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS Configurations
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# REST Framework Configuration with JWT Auth
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# Simple JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Channels Channel Layers Configuration
# Use local memory channel layer for demonstration/setup, or Redis for production cluster.
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer"
    }
}

# If Redis is running and requested, switch channel layers
if os.environ.get('USE_REDIS') == 'True':
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {
                "hosts": [("127.0.0.1", 6379)],
            },
        },
    }

# Enterprise AI Detection Rules
YOLO_CONFIDENCE_THRESHOLD = 0.50
VIOLATION_ESCALATION_COOLDOWN_MINUTES = 10
MAX_LIVE_CAMERAS = 36
