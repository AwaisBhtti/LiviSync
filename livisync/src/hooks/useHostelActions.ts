/**
 * useHostelActions — encapsulates add, edit, delete, and verify hostel handlers.
 * Extracted from App.tsx.
 */
import type { Hostel } from '../types';
import { useAppDispatch, useAppSelector } from '../store/store';
import { addHostel, editHostel, deleteHostel, verifyHostel, updateNearbyLocations } from '../store/slices/hostelSlice';
import { showToast } from '../store/slices/toastSlice';

export function useHostelActions() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);

  const handleAddHostel = async (newHostel: Omit<Hostel, 'id' | 'isVerified'>) => {
    if (!token) return;
    try {
      const result = await dispatch(addHostel({ newHostel, token })).unwrap();
      dispatch(showToast({ message: 'Hostel listing added successfully!', type: 'success' }));
      return result;
    } catch (err: any) {
      const errMsg = typeof err === 'string' ? err : err.message || 'Error adding hostel listing.';
      dispatch(showToast({ message: errMsg, type: 'error' }));
      throw err;
    }
  };

  const handleEditHostel = async (updatedHostel: Hostel) => {
    if (!token) return;
    try {
      const result = await dispatch(editHostel({ updatedHostel, token })).unwrap();
      dispatch(showToast({ message: 'Hostel listing updated successfully!', type: 'success' }));
      return result;
    } catch (err: any) {
      const errMsg = typeof err === 'string' ? err : err.message || 'Error updating hostel listing.';
      dispatch(showToast({ message: errMsg, type: 'error' }));
      throw err;
    }
  };

  const handleDeleteHostel = async (hostelId: string) => {
    if (!token) return;
    try {
      await dispatch(deleteHostel({ hostelId, token })).unwrap();
      dispatch(showToast({ message: 'Hostel listing deleted.', type: 'success' }));
    } catch (err: any) {
      dispatch(showToast({ message: err || 'Error deleting hostel listing.', type: 'error' }));
    }
  };

  const handleVerifyHostel = async (hostelId: string) => {
    if (!token) return;
    try {
      await dispatch(verifyHostel({ hostelId, token })).unwrap();
      dispatch(showToast({ message: 'Listing verified successfully!', type: 'success' }));
    } catch (err: any) {
      dispatch(showToast({ message: err || 'Error verifying listing.', type: 'error' }));
    }
  };

  const handleUpdateNearbyLocations = async (hostelId: string, nearbyLocations: string[]) => {
    if (!token) return;
    try {
      await dispatch(updateNearbyLocations({ hostelId, nearbyLocations, token })).unwrap();
      dispatch(showToast({ message: 'Nearby locations updated successfully!', type: 'success' }));
    } catch (err: any) {
      dispatch(showToast({ message: err || 'Error updating nearby locations.', type: 'error' }));
    }
  };

  return { handleAddHostel, handleEditHostel, handleDeleteHostel, handleVerifyHostel, handleUpdateNearbyLocations };
}
