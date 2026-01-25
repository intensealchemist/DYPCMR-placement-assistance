"""
Firebase Cloud Messaging service for push notifications.
"""
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

# Firebase Admin SDK initialization
_firebase_app = None

def get_firebase_app():
    """Initialize Firebase Admin SDK lazily."""
    global _firebase_app
    
    if _firebase_app is not None:
        return _firebase_app
    
    credentials_path = settings.FIREBASE_CREDENTIALS_PATH
    if not credentials_path:
        logger.warning("Firebase credentials not configured. Push notifications disabled.")
        return None
    
    try:
        import firebase_admin
        from firebase_admin import credentials
        
        cred = credentials.Certificate(credentials_path)
        _firebase_app = firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin SDK initialized successfully")
        return _firebase_app
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}")
        return None


def send_job_notification(job):
    """
    Send push notification for a new job posting.
    Sends to 'jobs' topic that users can subscribe/unsubscribe from.
    """
    app = get_firebase_app()
    if app is None:
        logger.warning(f"Skipping push notification for job {job.id} - Firebase not configured")
        return False
    
    try:
        from firebase_admin import messaging
        
        message = messaging.Message(
            notification=messaging.Notification(
                title=f"New Job: {job.title}",
                body=f"{job.company} - {job.location or 'Location not specified'}",
            ),
            data={
                'job_id': str(job.id),
                'type': 'new_job',
                'click_action': 'OPEN_JOB_DETAIL',
            },
            topic='jobs',  # Users subscribe to this topic
        )
        
        response = messaging.send(message)
        logger.info(f"Push notification sent for job {job.id}: {response}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send push notification for job {job.id}: {e}")
        return False


def send_notification_to_user(user, title, body, data=None):
    """
    Send push notification to a specific user.
    """
    if not user.fcm_token:
        logger.warning(f"User {user.id} has no FCM token")
        return False
    
    app = get_firebase_app()
    if app is None:
        return False
    
    try:
        from firebase_admin import messaging
        
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data or {},
            token=user.fcm_token,
        )
        
        response = messaging.send(message)
        logger.info(f"Push notification sent to user {user.id}: {response}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send push notification to user {user.id}: {e}")
        return False


def send_notification_to_tokens(tokens, title, body, data=None):
    """
    Send push notification to multiple device tokens.
    """
    if not tokens:
        return []
    
    app = get_firebase_app()
    if app is None:
        return []
    
    try:
        from firebase_admin import messaging
        
        message = messaging.MulticastMessage(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data or {},
            tokens=tokens,
        )
        
        response = messaging.send_multicast(message)
        logger.info(f"Multicast sent: {response.success_count} success, {response.failure_count} failures")
        return response
        
    except Exception as e:
        logger.error(f"Failed to send multicast notification: {e}")
        return None
