# DYPCMR Placement Mobile App

React Native mobile application for job placement assistance.

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Configuration

Update the API base URL in `src/config/api.ts`:

```typescript
export const API_BASE_URL = __DEV__ 
  ? 'http://YOUR_LOCAL_IP:8000/api'  // Replace with your computer's local IP
  : 'https://your-backend.railway.app/api';
```

**Note**: For Android emulator to connect to localhost, use `http://10.0.2.2:8000/api`

## Features

- User authentication (Login/Register)
- Browse jobs with search and filters
- Job details with apply functionality
- Multiple apply types:
  - In-app form
  - External Google Forms
  - Email applications
- Push notifications (requires Firebase setup)
- User profile management

## Project Structure

```
mobile/
├── src/
│   ├── api/           # API client and endpoints
│   ├── config/        # Configuration files
│   ├── navigation/    # React Navigation setup
│   ├── screens/       # Screen components
│   ├── store/         # Redux store and slices
│   └── types/         # TypeScript types
├── App.tsx            # Root component
└── package.json
```

## Firebase Setup (for push notifications)

1. Create a Firebase project
2. Add Android/iOS apps in Firebase console
3. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
4. Follow Expo's Firebase setup guide
