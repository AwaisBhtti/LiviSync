/**
 * RoomListing — orchestrator for managing rooms inside a hostel.
 * Composes AddRoomForm, RoomCard items, and EditRoomModal.
 */
import { useState, useEffect } from 'react';
import type { Room, Hostel } from '../types';
import { ArrowLeft, Check } from 'lucide-react';
import { ImageLightbox } from './ImageLightbox';
import { ConfirmationModal } from './ConfirmationModal';
import { AddRoomForm } from './rooms/AddRoomForm';
import { RoomCard } from './rooms/RoomCard';
import { EditRoomModal } from './rooms/EditRoomModal';
import { apiRequest } from '../api/apiClient';

interface RoomListingProps {
  hostel: Hostel;
  onBack: () => void;
  token: string;
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const headerSectionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
  paddingBottom: '1rem',
  borderBottom: '1px solid var(--border)',
};

const contentGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1.2fr',
  gap: '1.5rem',
};

export const RoomListing = ({ hostel, onBack, token }: RoomListingProps) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
    isDanger?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/owners/hostels/${hostel.id}/rooms`);
      setRooms(
        data.map((r: any) => ({
          id: r.id,
          hostelId: r.hostel_id,
          sharingType: r.sharing_type,
          price: r.price,
          seatsAvailable: r.seats_available,
          floor: r.floor,
          hasAttachedBathroom: r.has_attached_bathroom,
          furniture: r.furniture,
          images: r.images || [],
          description: r.description || '',
        }))
      );
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [hostel.id]);

  const handleDeleteRoom = async (roomId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Room',
      message: 'Are you sure you want to delete this room from your listing?',
      confirmText: 'Delete',
      isDanger: true,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await apiRequest(`/owners/rooms/${roomId}`, {
            method: 'DELETE',
          });
          fetchRooms();
        } catch (err) {
          console.error('Error deleting room:', err);
        }
      },
    });
  };

  const handleFinish = () => {
    if (rooms.length === 0) {
      alert('Important: You must list at least one room for this hostel listing to be valid and approved.');
      return;
    }
    onBack();
  };

  return (
    <div style={containerStyle}>
      <div style={headerSectionStyle}>
        <button
          onClick={onBack}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={16} /> Back to Hostels
        </button>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Manage Rooms - {hostel.name}</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
            List rooms and configuration details for this property.
          </p>
        </div>
      </div>

      {rooms.length === 0 && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '1rem',
            borderRadius: 'var(--radius)',
            color: 'var(--destructive)',
            fontSize: '0.875rem',
          }}
        >
          <strong>Notice:</strong> You must list at least a single room. Otherwise, this hostel listing
          will remain incomplete and unapproved by administrators.
        </div>
      )}

      <div style={contentGridStyle}>
        {/* Left Side: Add Room Form */}
        <AddRoomForm hostelId={hostel.id} token={token} onRoomAdded={fetchRooms} />

        {/* Right Side: Existing Rooms List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Active Rooms</h3>

            {loading ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Loading rooms...</p>
            ) : rooms.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>No rooms listed yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onEdit={setEditingRoom}
                    onDelete={handleDeleteRoom}
                    onImageClick={setLightboxUrl}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleFinish}
            className="btn btn-primary"
            style={{
              height: '48px',
              fontSize: '1rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <Check size={18} /> Finish &amp; Save Hostel Listing
          </button>
        </div>
      </div>

      {editingRoom && (
        <EditRoomModal
          room={editingRoom}
          token={token}
          onClose={() => setEditingRoom(null)}
          onRoomUpdated={fetchRooms}
        />
      )}

      <ImageLightbox imageUrl={lightboxUrl} onClose={() => setLightboxUrl(null)} />

      {confirmModal.isOpen && (
        <ConfirmationModal
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          isDanger={confirmModal.isDanger}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        />
      )}
    </div>
  );
};
