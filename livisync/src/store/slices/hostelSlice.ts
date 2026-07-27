import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Hostel } from '../../types';

interface HostelState {
  hostels: Hostel[];
  loading: boolean;
  error: string | null;
}

const initialState: HostelState = {
  hostels: [],
  loading: false,
  error: null,
};

export const fetchHostels = createAsyncThunk(
  'hostels/fetchHostels',
  async ({ token, role }: { token: string; role: string }, { rejectWithValue }) => {
    try {
      const endpoint = role === 'admin'
        ? 'http://127.0.0.1:8000/admin/hostels'
        : 'http://127.0.0.1:8000/hostels';

      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch hostels');
      }
      return await response.json() as Hostel[];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error fetching hostels');
    }
  }
);

export const verifyHostel = createAsyncThunk(
  'hostels/verifyHostel',
  async ({ hostelId, token }: { hostelId: string; token: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/admin/hostels/${hostelId}/verify`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to verify listing on server');
      }
      return hostelId;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error verifying hostel');
    }
  }
);

const hostelSlice = createSlice({
  name: 'hostels',
  initialState,
  reducers: {
    addHostel: (state, action: PayloadAction<Hostel>) => {
      state.hostels.push(action.payload);
    },
    editHostel: (state, action: PayloadAction<Hostel>) => {
      state.hostels = state.hostels.map((h) => h.id === action.payload.id ? action.payload : h);
    },
    deleteHostel: (state, action: PayloadAction<string>) => {
      state.hostels = state.hostels.filter((h) => h.id !== action.payload);
    },
    setHostelsState: (state, action: PayloadAction<Hostel[]>) => {
      state.hostels = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHostels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHostels.fulfilled, (state, action: PayloadAction<Hostel[]>) => {
        state.loading = false;
        state.hostels = action.payload;
      })
      .addCase(fetchHostels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyHostel.fulfilled, (state, action: PayloadAction<string>) => {
        state.hostels = state.hostels.map((h) => h.id === action.payload ? { ...h, isVerified: true } : h);
      });
  }
});

export const { addHostel, editHostel, deleteHostel, setHostelsState } = hostelSlice.actions;
export default hostelSlice.reducer;
