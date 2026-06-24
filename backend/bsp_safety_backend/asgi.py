import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsp_safety_backend.settings')

# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing consumer/routing modules.
django_asgi_app = get_asgi_application()

try:
    from channels.routing import ProtocolTypeRouter, URLRouter
    from channels.auth import AuthMiddlewareStack
    import safety_monitor.routing

    application = ProtocolTypeRouter({
        "http": django_asgi_app,
        "websocket": AuthMiddlewareStack(
            URLRouter(
                safety_monitor.routing.websocket_urlpatterns
            )
        ),
    })
except ImportError:
    # Fallback to pure ASGI HTTP if channels is not fully configured or installed yet
    application = ProtocolTypeRouter({
        "http": django_asgi_app,
    })
