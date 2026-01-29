import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi, User, LoginCredentials, RegisterData } from '../../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

// Async thunks
export const login = createAsyncThunk(
    'auth/login',
    async (credentials: LoginCredentials, { rejectWithValue }) => {
        try {
            const user = await authApi.login(credentials);
            return user;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || 'Login failed');
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (data: RegisterData, { rejectWithValue }) => {
        try {
            const response = await authApi.register(data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Registration failed');
        }
    }
);

export const loadUser = createAsyncThunk(
    'auth/loadUser',
    async (_, { rejectWithValue }) => {
        try {
            const userJson = await AsyncStorage.getItem('user');
            const token = await AsyncStorage.getItem('access_token');

            if (!userJson || !token) {
                throw new Error('No user data');
            }

            // Just load from storage, don't make API call on startup
            // This prevents the app from hanging if the API is unreachable
            const user = JSON.parse(userJson);
            return user;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to load user');
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async () => {
        await authApi.logout();
    }
);

export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (data: Partial<User>, { rejectWithValue }) => {
        try {
            const user = await authApi.updateProfile(data);
            return user;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to update profile');
        }
    }
);

// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Login
        builder.addCase(login.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
        });
        builder.addCase(login.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Register
        builder.addCase(register.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(register.fulfilled, (state) => {
            state.isLoading = false;
        });
        builder.addCase(register.rejected, (state, action) => {
            state.isLoading = false;
            state.error = JSON.stringify(action.payload);
        });

        // Load user
        builder.addCase(loadUser.fulfilled, (state, action: PayloadAction<User>) => {
            state.isAuthenticated = true;
            state.user = action.payload;
        });
        builder.addCase(loadUser.rejected, (state) => {
            state.isAuthenticated = false;
            state.user = null;
        });

        // Logout
        builder.addCase(logout.fulfilled, (state) => {
            state.isAuthenticated = false;
            state.user = null;
        });

        // Update profile
        builder.addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
