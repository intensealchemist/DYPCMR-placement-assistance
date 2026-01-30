/**
 * API Configuration
 */

// Update this with your backend URL
// For Android emulator: use 10.0.2.2 instead of localhost
// For physical device: use your computer's local IP address
export const API_BASE_URL = 'https://dypcmr-placement-assistance.vercel.app/api';

// For iOS simulator or web, use localhost:
// export const API_BASE_URL = 'http://localhost:8000/api';

// For physical device, use your computer's IP:
// export const API_BASE_URL = 'http://192.168.1.XXX:8000/api';

export const API_ENDPOINTS = {
    // Auth
    LOGIN: 'auth/login/',
    REGISTER: 'auth/register/',
    REFRESH_TOKEN: 'auth/refresh/',

    // User
    ME: 'users/me/',
    UPDATE_FCM_TOKEN: 'users/me/fcm-token/',

    // Jobs
    JOBS: 'jobs/',
    JOB_DETAIL: (id: number) => `jobs/${id}/`,
    APPLY_TO_JOB: (id: number) => `jobs/${id}/apply/`,

    // Applications (admin)
    APPLICATIONS: 'applications/',
    JOB_APPLICATIONS: (id: number) => `applications/job/${id}/`,
    EXPORT_APPLICATIONS: 'applications/export/',
    UPLOAD_RESUME: 'applications/upload/',
    APPLICATION_CONFIRM: (id: number) => `applications/${id}/confirm/`,
};
