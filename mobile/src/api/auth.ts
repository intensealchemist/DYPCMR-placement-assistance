import apiClient from './client';
import { API_ENDPOINTS } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    email: string;
    username: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
}

export interface User {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    phone: string;
    resume_url: string;
    role: 'user' | 'admin' | 'super_admin';
    is_admin: boolean;
    profile_complete: boolean;
}

export const authApi = {
    login: async (credentials: LoginCredentials) => {
        const response = await apiClient.post(API_ENDPOINTS.LOGIN, credentials);
        const { access, refresh } = response.data;

        // Store tokens
        await AsyncStorage.setItem('access_token', access);
        await AsyncStorage.setItem('refresh_token', refresh);

        // Fetch and store user profile
        const userResponse = await apiClient.get(API_ENDPOINTS.ME);
        await AsyncStorage.setItem('user', JSON.stringify(userResponse.data));

        return userResponse.data;
    },

    register: async (data: RegisterData) => {
        const response = await apiClient.post(API_ENDPOINTS.REGISTER, data);
        return response.data;
    },

    logout: async () => {
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await apiClient.get(API_ENDPOINTS.ME);
        await AsyncStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
    },

    updateProfile: async (data: Partial<User>) => {
        const response = await apiClient.patch(API_ENDPOINTS.ME, data);
        await AsyncStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
    },

    updateFCMToken: async (fcmToken: string) => {
        const response = await apiClient.post(API_ENDPOINTS.UPDATE_FCM_TOKEN, {
            fcm_token: fcmToken,
        });
        return response.data;
    },
};
