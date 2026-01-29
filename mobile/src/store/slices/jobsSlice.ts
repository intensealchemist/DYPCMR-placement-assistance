import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { jobsApi, Job, JobFilters } from '../../api/jobs';

interface JobsState {
    jobs: Job[];
    selectedJob: Job | null;
    isLoading: boolean;
    error: string | null;
    hasMore: boolean;
    nextPage: number;
}

const initialState: JobsState = {
    jobs: [],
    selectedJob: null,
    isLoading: false,
    error: null,
    hasMore: true,
    nextPage: 1,
};

// Async thunks
export const fetchJobs = createAsyncThunk(
    'jobs/fetchJobs',
    async (filters: JobFilters = {}, { rejectWithValue }) => {
        try {
            const response = await jobsApi.getJobs(filters);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to fetch jobs');
        }
    }
);

export const fetchJobDetail = createAsyncThunk(
    'jobs/fetchJobDetail',
    async (jobId: number, { rejectWithValue }) => {
        try {
            const job = await jobsApi.getJobDetail(jobId);
            return job;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to fetch job');
        }
    }
);

export const applyToJob = createAsyncThunk(
    'jobs/applyToJob',
    async ({ jobId, data }: { jobId: number; data?: any }, { rejectWithValue }) => {
        try {
            const response = await jobsApi.applyToJob(jobId, data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to apply');
        }
    }
);

export const uploadResume = createAsyncThunk(
    'jobs/uploadResume',
    async (formData: FormData, { rejectWithValue }) => {
        try {
            const response = await jobsApi.uploadResume(formData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to upload resume');
        }
    }
);

export const confirmApplication = createAsyncThunk(
    'jobs/confirmApplication',
    async (
        { applicationId, submission_status }: { applicationId: number; submission_status: 'clicked' | 'submitted' | 'abandoned' },
        { rejectWithValue }
    ) => {
        try {
            const response = await jobsApi.confirmApplication(applicationId, { submission_status });
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Failed to confirm application');
        }
    }
);

// Slice
const jobsSlice = createSlice({
    name: 'jobs',
    initialState,
    reducers: {
        clearSelectedJob: (state) => {
            state.selectedJob = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch jobs
        builder.addCase(fetchJobs.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchJobs.fulfilled, (state, action) => {
            state.isLoading = false;
            const { results, next } = action.payload;
            state.jobs = action.meta.arg.page === 1 ? results : [...state.jobs, ...results];
            state.hasMore = !!next;
            state.nextPage = action.meta.arg.page ? action.meta.arg.page + 1 : 2;
        });
        builder.addCase(fetchJobs.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Fetch job detail
        builder.addCase(fetchJobDetail.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchJobDetail.fulfilled, (state, action: PayloadAction<Job>) => {
            state.isLoading = false;
            state.selectedJob = action.payload;
        });
        builder.addCase(fetchJobDetail.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Apply to job
        builder.addCase(applyToJob.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(applyToJob.fulfilled, (state) => {
            state.isLoading = false;
        });
        builder.addCase(applyToJob.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearSelectedJob, clearError } = jobsSlice.actions;
export default jobsSlice.reducer;
