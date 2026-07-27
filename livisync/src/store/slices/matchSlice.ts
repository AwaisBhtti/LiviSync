import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { MatchRequest } from '../../types';

interface MatchState {
  matchRequests: MatchRequest[];
  loading: boolean;
  error: string | null;
}

const initialState: MatchState = {
  matchRequests: [],
  loading: false,
  error: null,
};

export const fetchMatches = createAsyncThunk(
  'matches/fetchMatches',
  async ({ token, role }: { token: string; role: string }, { rejectWithValue }) => {
    try {
      const endpoint = role === 'admin'
        ? 'http://127.0.0.1:8000/admin/matches'
        : 'http://127.0.0.1:8000/matches';
        
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }
      const data = await response.json();
      const mappedMatches = data.map((m: any) => ({
        id: m.id,
        senderId: m.sender_id,
        receiverId: m.receiver_id,
        status: m.status,
        message: m.message || '',
        timestamp: m.created_at
      }));
      return mappedMatches;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error fetching matches');
    }
  }
);

const matchSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    sendRequest: (state, action: PayloadAction<{ receiverId: string; message: string; senderId: string }>) => {
      const newRequest: MatchRequest = {
        id: `req_${Date.now()}`,
        senderId: action.payload.senderId,
        receiverId: action.payload.receiverId,
        status: 'pending',
        message: action.payload.message,
        timestamp: new Date().toISOString(),
      };
      state.matchRequests.push(newRequest);
    },
    acceptRequest: (state, action: PayloadAction<string>) => {
      state.matchRequests = state.matchRequests.map((r) => r.id === action.payload ? { ...r, status: 'accepted' } : r);
    },
    declineRequest: (state, action: PayloadAction<string>) => {
      state.matchRequests = state.matchRequests.map((r) => r.id === action.payload ? { ...r, status: 'declined' } : r);
    },
    removeMatchesForUser: (state, action: PayloadAction<string>) => {
      state.matchRequests = state.matchRequests.filter((r) => r.senderId !== action.payload && r.receiverId !== action.payload);
    },
    setMatchesState: (state, action: PayloadAction<MatchRequest[]>) => {
      state.matchRequests = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatches.fulfilled, (state, action: PayloadAction<MatchRequest[]>) => {
        state.loading = false;
        state.matchRequests = action.payload;
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { sendRequest, acceptRequest, declineRequest, removeMatchesForUser, setMatchesState } = matchSlice.actions;
export default matchSlice.reducer;
