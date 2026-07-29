import { API_BASE_URL } from '../../config';
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { User, Report } from '../../types';

interface AdminState {
  users: User[];
  reports: Report[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  reports: [],
  loading: false,
  error: null,
};

export const fetchReports = createAsyncThunk(
  'admin/fetchReports',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports`, {
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
      const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/resolve`, {
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

export const warnUser = createAsyncThunk(
  'admin/warnUser',
  async ({ reportId, token }: { reportId: string; token: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/warn`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to send warning email');
      }
      return reportId;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error sending warning');
    }
  }
);

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      return data as User[];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error fetching users');
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  'admin/toggleUserStatus',
  async ({ userId, token, currentStatus, role }: { userId: string; token: string; currentStatus: string; role: 'student' | 'owner' }, { rejectWithValue }) => {
    try {
      const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
      const response = await fetch(`${API_BASE_URL}/admin/users/${role}/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update status on server');
      }
      return { userId, nextStatus: nextStatus as 'active' | 'suspended' };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error toggling user status');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async ({ userId, token, role }: { userId: string; token: string; role: 'student' | 'owner' }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${role}/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to delete user on server');
      }
      return userId;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error deleting user');
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
      })
      .addCase(warnUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.reports = state.reports.map((r) => r.id === action.payload ? { ...r, status: 'resolved' as const } : r);
      })
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action: PayloadAction<{ userId: string; nextStatus: 'active' | 'suspended' }>) => {
        state.users = state.users.map((u) => u.id === action.payload.userId ? { ...u, status: action.payload.nextStatus } : u);
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      });
  }
});

export const { addLocalReport, setReportsState } = adminSlice.actions;
export default adminSlice.reducer;
