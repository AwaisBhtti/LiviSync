import { API_BASE_URL } from '../../config';
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
        ? `${API_BASE_URL}/admin/hostels`
        : `${API_BASE_URL}/hostels`;

      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch hostels');
      }
      const data = await response.json();
      const mappedHostels = data.map((h: any) => ({
        id: h.id,
        name: h.name,
        location: h.location,
        description: h.description || '',
        photo: h.photo || '',
        photos: h.photos || [],
        electricityBillIncluded: h.electricity_bill_included,
        hostelType: h.hostel_type || 'boys',
        hasCurfew: h.has_curfew || false,
        curfewTime: h.curfew_time || undefined,
        amenities: h.amenities ? h.amenities.map((a: any) => typeof a === 'string' ? a : (a.amenity || '')) : [],
        ownerId: h.owner_id,
        ownerName: h.owner_name || 'Unknown Owner',
        isVerified: h.is_verified,
        currentOccupants: h.current_occupants || [],
        nearbyLocations: h.nearby_locations || [],
        rooms: h.rooms ? h.rooms.map((r: any) => ({
          id: r.id,
          hostelId: r.hostel_id,
          sharingType: r.sharing_type,
          price: r.price,
          seatsAvailable: r.seats_available,
          floor: r.floor,
          hasAttachedBathroom: r.has_attached_bathroom,
          furniture: r.furniture,
          images: r.images || [],
          description: r.description || ''
        })) : []
      }));
      return mappedHostels as Hostel[];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error fetching hostels');
    }
  }
);

export const verifyHostel = createAsyncThunk(
  'hostels/verifyHostel',
  async ({ hostelId, token }: { hostelId: string; token: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/hostels/${hostelId}/verify`, {
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

export const updateNearbyLocations = createAsyncThunk(
  'hostels/updateNearbyLocations',
  async ({ hostelId, nearbyLocations, token }: { hostelId: string; nearbyLocations: string[]; token: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/hostels/${hostelId}/nearby-locations`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nearby_locations: nearbyLocations })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update nearby locations');
      }
      return { hostelId, nearbyLocations: data.nearby_locations as string[] };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error updating nearby locations');
    }
  }
);

export const addHostel = createAsyncThunk(
  'hostels/addHostel',
  async ({ newHostel, token }: { newHostel: Omit<Hostel, 'id' | 'isVerified'>; token: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/owners/hostels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newHostel.name,
          location: newHostel.location,
          description: newHostel.description,
          photo: newHostel.photo,
          photos: newHostel.photos,
          electricity_bill_included: newHostel.electricityBillIncluded,
          hostel_type: newHostel.hostelType || 'boys',
          has_curfew: newHostel.hasCurfew || false,
          curfew_time: newHostel.curfewTime || null,
          amenities: newHostel.amenities
        })
      });
      const data = await response.json();
      if (!response.ok) {
        const errMsg = Array.isArray(data.detail)
          ? data.detail.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join('\n')
          : data.detail || 'Failed to list hostel';
        throw new Error(errMsg);
      }
      return {
        id: data.id,
        name: data.name,
        location: data.location,
        description: data.description || '',
        photo: data.photo || '',
        photos: data.photos || [],
        electricityBillIncluded: data.electricity_bill_included,
        hostelType: data.hostel_type || 'boys',
        hasCurfew: data.has_curfew || false,
        curfewTime: data.curfew_time || undefined,
        amenities: data.amenities ? data.amenities.map((a: any) => typeof a === 'string' ? a : (a.amenity || '')) : [],
        ownerId: data.owner_id,
        isVerified: data.is_verified,
        currentOccupants: [],
        nearbyLocations: data.nearby_locations || [],
        rooms: []
      } as Hostel;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error listing hostel');
    }
  }
);

export const editHostel = createAsyncThunk(
  'hostels/editHostel',
  async ({ updatedHostel, token }: { updatedHostel: Hostel; token: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/owners/hostels/${updatedHostel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: updatedHostel.name,
          location: updatedHostel.location,
          description: updatedHostel.description,
          photo: updatedHostel.photo,
          photos: updatedHostel.photos,
          electricity_bill_included: updatedHostel.electricityBillIncluded,
          hostel_type: updatedHostel.hostelType || 'boys',
          has_curfew: updatedHostel.hasCurfew,
          curfew_time: updatedHostel.hasCurfew ? updatedHostel.curfewTime : null,
          amenities: updatedHostel.amenities
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update hostel listing');
      }
      return {
        id: data.id,
        name: data.name,
        location: data.location,
        description: data.description || '',
        photo: data.photo || '',
        photos: data.photos || [],
        electricityBillIncluded: data.electricity_bill_included,
        hostelType: data.hostel_type || 'boys',
        hasCurfew: data.has_curfew || false,
        curfewTime: data.curfew_time || undefined,
        amenities: data.amenities ? data.amenities.map((a: any) => typeof a === 'string' ? a : (a.amenity || '')) : [],
        ownerId: data.owner_id,
        isVerified: data.is_verified,
        currentOccupants: data.current_occupants || updatedHostel.currentOccupants || [],
        nearbyLocations: data.nearby_locations || updatedHostel.nearbyLocations || [],
        rooms: (data.rooms && data.rooms.length > 0) ? data.rooms.map((r: any) => ({
          id: r.id,
          hostelId: r.hostel_id,
          sharingType: r.sharing_type,
          price: r.price,
          seatsAvailable: r.seats_available,
          floor: r.floor,
          hasAttachedBathroom: r.has_attached_bathroom,
          furniture: r.furniture,
          images: r.images || [],
          description: r.description || ''
        })) : (updatedHostel.rooms || [])
      } as Hostel;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error updating hostel listing');
    }
  }
);

export const deleteHostel = createAsyncThunk(
  'hostels/deleteHostel',
  async ({ hostelId, token }: { hostelId: string; token: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/owners/hostels/${hostelId}`, {
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
      .addCase(updateNearbyLocations.fulfilled, (state, action) => {
        state.hostels = state.hostels.map((h) =>
          h.id === action.payload.hostelId ? { ...h, nearbyLocations: action.payload.nearbyLocations } : h
        );
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
