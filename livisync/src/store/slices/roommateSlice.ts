import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';

interface RoommateState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: RoommateState = {
  users: [],
  loading: false,
  error: null,
};

export const fetchRoommates = createAsyncThunk(
  'roommates/fetchRoommates',
  async ({ token, role }: { token: string; role: string }, { rejectWithValue }) => {
    try {
      const endpoint = role === 'admin'
        ? 'http://127.0.0.1:8000/admin/users'
        : 'http://127.0.0.1:8000/users/roommates';
        
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch roommates');
      }
      const data = await response.json();
      
      if (role === 'admin') {
        // admin endpoint returns raw admin user structures
        return data as User[];
      }
      
      // Map student endpoint structures
      const mappedUsers: User[] = data.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.profile?.name || 'New User',
        age: u.profile?.age || 18,
        gender: u.profile?.gender || 'male',
        photo: u.profile?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&h=400&q=80',
        bio: u.profile?.bio || '',
        budget: u.profile?.budget || 0,
        location: u.profile?.location || '',
        role: u.profile?.role || 'student',
        status: u.profile?.status || 'active',
        occupation: u.profile?.occupation || 'student',
        institution: u.profile?.institution || '',
        company: u.profile?.company || '',
        preferences: {
          sleepSchedule: u.preferences?.sleep_schedule || 'flexible',
          cleanliness: u.preferences?.cleanliness || 'moderate',
          smoking: u.preferences?.smoking || 'no',
          pets: u.preferences?.pets || 'no',
          guestTolerance: u.preferences?.guest_tolerance || 'weekends'
        },
        blockedUsers: []
      }));
      return mappedUsers;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error fetching roommates');
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  'roommates/toggleUserStatus',
  async ({ userId, token, currentStatus }: { userId: string; token: string; currentStatus: string }, { rejectWithValue }) => {
    try {
      const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
      const response = await fetch(`http://127.0.0.1:8000/admin/users/${userId}/status`, {
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
  'roommates/deleteUser',
  async ({ userId, token }: { userId: string; token: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/admin/users/${userId}`, {
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

const roommateSlice = createSlice({
  name: 'roommates',
  initialState,
  reducers: {
    updateUserInList: (state, action: PayloadAction<User>) => {
      state.users = state.users.map((u) => u.id === action.payload.id ? action.payload : u);
    },
    setUsersState: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoommates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoommates.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchRoommates.rejected, (state, action) => {
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

export const { updateUserInList, setUsersState } = roommateSlice.actions;
export default roommateSlice.reducer;
