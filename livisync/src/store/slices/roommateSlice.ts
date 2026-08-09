import { API_BASE_URL } from '../../config';
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Student } from '../../types';

interface RoommateState {
  users: Student[];
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
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/roommates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch roommates');
      }
      const data = await response.json();
      
      const mappedUsers: Student[] = data.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name || 'New User',
        age: u.age || 18,
        gender: u.gender || 'male',
        photo: u.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&h=400&q=80',
        bio: u.bio || '',
        budget: u.budget || 0,
        location: u.location || '',
        role: 'student',
        status: u.status || 'active',
        occupation: u.occupation || 'student',
        institution: u.institution || '',
        company: u.company || '',
        phone: u.phone || '',
        hostelId: u.hostel_id || undefined,
        preferences: {
          sleepSchedule: u.preferences?.sleep_schedule || 'flexible',
          cleanliness: u.preferences?.cleanliness || 'moderate',
          smoking: u.preferences?.smoking || 'no',
          pets: u.preferences?.pets || 'no',
          guestTolerance: u.preferences?.guest_tolerance || 'weekends',
          noiseTolerance: u.preferences?.noise_tolerance || 'moderate'
        },
        blockedUsers: []
      }));
      return mappedUsers;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error fetching roommates');
    }
  }
);

const roommateSlice = createSlice({
  name: 'roommates',
  initialState,
  reducers: {
    updateUserInList: (state, action: PayloadAction<Student>) => {
      state.users = state.users.map((u) => u.id === action.payload.id ? action.payload : u);
    },
    setUsersState: (state, action: PayloadAction<Student[]>) => {
      state.users = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoommates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoommates.fulfilled, (state, action: PayloadAction<Student[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchRoommates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { updateUserInList, setUsersState } = roommateSlice.actions;
export default roommateSlice.reducer;
