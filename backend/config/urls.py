"""
URL configuration for DYPCMR Placement Assistance.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static


def root(_request):
    return JsonResponse({'status': 'ok', 'service': 'DYPCMR Placement Assistance API'})


def db_status(_request):
    """Diagnostic endpoint to check database configuration"""
    from django.db import connection
    from django.core.management import call_command
    import io
    
    db_config = connection.settings_dict
    db_info = {
        'engine': db_config.get('ENGINE', 'unknown'),
        'name': db_config.get('NAME', 'unknown'),
        'host': db_config.get('HOST', 'default'),
    }
    
    # Try to run migrations
    try:
        out = io.StringIO()
        call_command('migrate', '--noinput', stdout=out)
        migration_output = out.getvalue()
        db_info['migrations'] = 'success'
        db_info['migration_output'] = migration_output
    except Exception as e:
        db_info['migrations'] = 'failed'
        db_info['error'] = str(e)
    
    return JsonResponse(db_info)

urlpatterns = [
    path('', root, name='root'),
    path('db-status/', db_status, name='db_status'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/users/', include('apps.users.urls_users')),
    path('api/jobs/', include('apps.jobs.urls')),
    path('api/applications/', include('apps.applications.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
