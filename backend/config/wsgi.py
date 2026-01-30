"""
WSGI config for DYPCMR Placement Assistance.
"""
import logging
import os
import sys
from pathlib import Path

from django.core.management import call_command
from django.core.wsgi import get_wsgi_application

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
application = get_wsgi_application()

_BOOTSTRAP_FLAG = os.getenv('CREATE_SUPERUSER_ON_START', '').lower() in {'1', 'true', 'yes'}
if _BOOTSTRAP_FLAG:
    try:
        call_command('create_default_superuser')
    except Exception:  # pragma: no cover - avoid crashing the app on bootstrap
        logging.exception('Failed to create default superuser on startup.')
else:
    logging.getLogger(__name__).info(
        'Skipping superuser bootstrap. Set CREATE_SUPERUSER_ON_START=true to enable.'
    )

app = application
