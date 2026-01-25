# DYPCMR Placement Assistance

Full-stack job placement assistance platform with Django backend and React Native mobile app.

## Project Structure

```
DYPCMR-placement-assistance/
├── backend/          # Django REST Framework API
└── mobile/           # React Native / Expo mobile app
```

## Quick Start

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Mobile App Setup

```bash
cd mobile
npm install
npm start
```

## Tech Stack

- **Backend**: Django 4.2, Django REST Framework, PostgreSQL, AWS S3, FCM
- **Mobile**: React Native / Expo, TypeScript, Redux Toolkit, React Navigation
- **Auth**: JWT (SimpleJWT)
- **Hosting**: Railway/Render (backend), Expo (mobile)

## Features

### For Job Seekers
- Browse job openings
- Search and filter jobs
- Apply via in-app form, Google Forms, or email
- Receive push notifications for new jobs
- Track application history

### For Admins
- Create and manage job posts
- View all applicants (in-app + external clicks)
- Export applicants to CSV
- Send push notifications
- Role-based access control

## Documentation

- [Backend README](backend/README.md)
- [Mobile README](mobile/README.md)

## Deployment

### Backend (Railway/Render)

1. Connect GitHub repository
2. Set environment variables from `.env.example`
3. Deploy automatically on push

### Mobile (Expo)

```bash
cd mobile
npm install -g eas-cli
eas build --platform android
eas submit --platform android
```

## License

MIT
