# DYPCMR Placement Assistance Backend

Django REST Framework backend for the placement assistance application.

## Setup

```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Setup database
python manage.py migrate
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgres://user:password@localhost:5432/placement_db
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_S3_REGION_NAME=us-east-1
FIREBASE_CREDENTIALS_PATH=firebase-credentials.json
```

## API Documentation

- Auth: `/api/auth/`
- Jobs: `/api/jobs/`
- Applications: `/api/applications/`
- Users: `/api/users/`
