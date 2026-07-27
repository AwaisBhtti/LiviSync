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

export const addHostel = createAsyncThunk(
  'hostels/addHostel',
  async ({ newHostel, token }: { newHostel: Omit<Hostel, 'id' | 'isVerified'>; token: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/owners/hostels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newHostel)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to list hostel');
      }
      return data as Hostel;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error listing hostel');
    }
  }
);

export const editHostel = createAsyncThunk(
  'hostels/editHostel',
  async ({ updatedHostel, token }: { updatedHostel: Hostel; token: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/owners/hostels/${updatedHostel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedHostel)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update hostel listing');
      }
      return updatedHostel;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error updating hostel listing');
    }
  }
);

export const deleteHostel = createAsyncThunk(
  'hostels/deleteHostel',
  async ({ hostelId, token }: { hostelId: string; token: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/owners/hostels/${hostelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to delete hostel listing');
      }
      return hostelId;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error deleting hostel listing');
    }
  }
);

const hostelSlice = createSlice({
  name: 'hostels',
  initialState,
  reducers: {
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
      })
      .addCase(addHostel.fulfilled, (state, action: PayloadAction<Hostel>) => {
        state.hostels.push(action.payload);
      })
      .addCase(editHostel.fulfilled, (state, action: PayloadAction<Hostel>) => {
        state.hostels = state.hostels.map((h) => h.id === action.payload.id ? action.payload : h);
      })
      .addCase(deleteHostel.fulfilled, (state, action: PayloadAction<string>) => {
        state.hostels = state.hostels.filter((h) => h.id !== action.payload);
      });
  }
});

export const { setHostelsState } = hostelSlice.actions;
export default hostelSlice.reducer;
