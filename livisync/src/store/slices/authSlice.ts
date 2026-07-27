import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';

interface AuthState {
  token: string | null;
  currentUser: User | null;
  loadingData: boolean;
}

const initialState: AuthState = {
  token: localStorage.getItem('livisync_token'),
  currentUser: null,
  loadingData: false,
};

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (authToken: string, { rejectWithValue }) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Session expired or invalid token');
      }
      const data = await response.json();
      const mappedUser: User = {
        id: data.id,
        email: data.email,
        name: data.profile?.name || 'New User',
        age: data.profile?.age || 18,
        gender: data.profile?.gender === 'female' ? 'female' : data.profile?.gender === 'other' ? 'other' : 'male',
        photo: data.profile?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&h=400&q=80',
        bio: data.profile?.bio || '',
        budget: data.profile?.budget || 0,
        location: data.profile?.location || '',
        role: data.profile?.role === 'admin' ? 'admin' : data.profile?.role === 'owner' ? 'owner' : 'student',
        status: data.profile?.status === 'suspended' ? 'suspended' : 'active',
        occupation: data.profile?.occupation || 'student',
        institution: data.profile?.institution || '',
        company: data.profile?.company || '',
        phone: data.profile?.phone || '',
        hostelId: data.profile?.hostel_id || undefined,
        preferences: {
          sleepSchedule: data.preferences?.sleep_schedule || 'flexible',
          cleanliness: data.preferences?.cleanliness || 'moderate',
          smoking: data.preferences?.smoking || 'no',
          pets: data.preferences?.pets || 'no',
          guestTolerance: data.preferences?.guest_tolerance || 'weekends'
        },
        blockedUsers: []
      };
      return mappedUser;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error fetching user');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ updatedUser, token }: { updatedUser: User; token: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: updatedUser.name,
          age: updatedUser.age,
          gender: updatedUser.gender,
          bio: updatedUser.bio,
          budget: updatedUser.budget,
          location: updatedUser.location,
          occupation: updatedUser.occupation,
          institution: updatedUser.institution,
          company: updatedUser.company,
          sleep_schedule: updatedUser.preferences.sleepSchedule,
          cleanliness: updatedUser.preferences.cleanliness,
          smoking: updatedUser.preferences.smoking,
          pets: updatedUser.preferences.pets,
          guest_tolerance: updatedUser.preferences.guestTolerance,
          hostel_id: updatedUser.hostelId || null,
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update profile on server');
      }
      return updatedUser;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error saving profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authSuccess: (state, action: PayloadAction<string>) => {
      localStorage.setItem('livisync_token', action.payload);
      state.token = action.payload;
    },
    logout: (state) => {
      localStorage.removeItem('livisync_token');
      localStorage.removeItem('livisync_active_user');
      state.token = null;
      state.currentUser = null;
    },
    setBlockedUsers: (state, action: PayloadAction<string[]>) => {
      if (state.currentUser) {
        state.currentUser.blockedUsers = action.payload;
        localStorage.setItem('livisync_active_user', JSON.stringify(state.currentUser));
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loadingData = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loadingData = false;
        state.currentUser = action.payload;
        localStorage.setItem('livisync_active_user', JSON.stringify(action.payload));
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loadingData = false;
        state.token = null;
        state.currentUser = null;
        localStorage.removeItem('livisync_token');
        localStorage.removeItem('livisync_active_user');
      })
      .addCase(updateProfile.pending, (state) => {
        state.loadingData = true;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.loadingData = false;
        state.currentUser = action.payload;
        localStorage.setItem('livisync_active_user', JSON.stringify(action.payload));
      })
      .addCase(updateProfile.rejected, (state) => {
        state.loadingData = false;
      });
  }
});

export const { authSuccess, logout, setBlockedUsers } = authSlice.actions;
export default authSlice.reducer;
