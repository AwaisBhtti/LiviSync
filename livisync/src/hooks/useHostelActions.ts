/**
 * useHostelActions — encapsulates add, edit, delete, and verify hostel handlers.
 * Extracted from App.tsx.
 */
import type { Hostel } from '../types';
import { useAppDispatch, useAppSelector } from '../store/store';
import { addHostel, editHostel, deleteHostel, verifyHostel } from '../store/slices/hostelSlice';

export function useHostelActions() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);

  const handleAddHostel = async (newHostel: Omit<Hostel, 'id' | 'isVerified'>) => {
    if (!token) return;
    try {
      await dispatch(addHostel({ newHostel, token })).unwrap();
      alert('Hostel listing added successfully!');
    } catch (err: any) {
      const errMsg = typeof err === 'string' ? err : err.message || 'Error adding hostel listing.';
      alert(errMsg);
    }
  };

  const handleEditHostel = async (updatedHostel: Hostel) => {
    if (!token) return;
    try {
      await dispatch(editHostel({ updatedHostel, token })).unwrap();
      alert('Hostel listing updated successfully!');
    } catch (err: any) {
      const errMsg = typeof err === 'string' ? err : err.message || 'Error updating hostel listing.';
      alert(errMsg);
    }
  };

  const handleDeleteHostel = async (hostelId: string) => {
    if (!token) return;
    try {
      await dispatch(deleteHostel({ hostelId, token })).unwrap();
      alert('Hostel listing deleted.');
    } catch (err: any) {
      alert(err || 'Error deleting hostel listing.');
    }
  };

  const handleVerifyHostel = async (hostelId: string) => {
    if (!token) return;
    try {
      await dispatch(verifyHostel({ hostelId, token })).unwrap();
      alert('Listing verified successfully!');
    } catch (err: any) {
      alert(err || 'Error verifying listing.');
    }
  };

  return { handleAddHostel, handleEditHostel, handleDeleteHostel, handleVerifyHostel };
}
