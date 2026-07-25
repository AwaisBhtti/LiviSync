import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Report } from '../../types';

interface AdminState {
  reports: Report[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  reports: [],
  loading: false,
  error: null,
};

export const fetchReports = createAsyncThunk(
  'admin/fetchReports',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/admin/reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      const data = await response.json();
      const mappedReports = data.map((r: any) => ({
        id: r.id,
        reporterId: r.reporter_id,
        reportedId: r.reported_id,
        reason: r.reason,
        description: r.description || '',
        status: r.status,
        timestamp: r.created_at
      }));
      return mappedReports as Report[];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error fetching reports');
    }
  }
);

export const resolveReport = createAsyncThunk(
  'admin/resolveReport',
  async ({ reportId, token }: { reportId: string; token: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/admin/reports/${reportId}/resolve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to resolve report on server');
      }
      return reportId;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error resolving report');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    addLocalReport: (state, action: PayloadAction<Report>) => {
      state.reports.push(action.payload);
    },
    setReportsState: (state, action: PayloadAction<Report[]>) => {
      state.reports = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action: PayloadAction<Report[]>) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(resolveReport.fulfilled, (state, action: PayloadAction<string>) => {
        state.reports = state.reports.map((r) => r.id === action.payload ? { ...r, status: 'resolved' as const } : r);
      });
  }
});

export const { addLocalReport, setReportsState } = adminSlice.actions;
export default adminSlice.reducer;
