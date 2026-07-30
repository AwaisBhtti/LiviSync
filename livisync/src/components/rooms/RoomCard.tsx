/** RoomCard — displays a single room in the active rooms list. */
import type { Room } from '../../types';
import { Edit2, Trash2 } from 'lucide-react';
import { FURNITURE_LABELS } from '../../constants/roomOptions';

interface RoomCardProps {
  room: Room;
  onEdit: (room: Room) => void;
  onDelete: (roomId: string) => void;
  onImageClick: (url: string) => void;
}

const roomCardStyle: React.CSSProperties = {
  padding: '1rem',
  backgroundColor: 'var(--secondary)',
  borderRadius: 'var(--radius)',
  border: '1px solid var(--border)',
};

const iconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '0.25rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const RoomCard = ({ room, onEdit, onDelete, onImageClick }: RoomCardProps) => (
  <div style={roomCardStyle}>
    <div style={{ display: 'flex', gap: '1rem' }}>
      {/* Thumbnail images */}
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {room.images
          .filter((img) => img.trim().length > 0)
          .slice(0, 2)
          .map((img, i) => (
            <img
              key={i}
              src={img}
              onClick={() => onImageClick(img)}
              style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', cursor: 'zoom-in' }}
              alt=""
            />
          ))}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontWeight: 600, fontSize: '0.95rem', textTransform: 'capitalize' }}>
            {room.sharingType} Sharing ({room.floor})
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => onEdit(room)}
              style={{ ...iconBtnStyle, color: 'var(--muted)' }}
              title="Edit Room"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => onDelete(room.id)}
              style={{ ...iconBtnStyle, color: 'var(--danger)' }}
              title="Delete Room"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: 'var(--muted)' }}>
          <strong>Price:</strong> PKR {room.price.toLocaleString()} / month
        </p>
        <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: 'var(--muted)' }}>
          <strong>Available Seats:</strong> {room.seatsAvailable} bed(s)
        </p>
        <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: 'var(--muted)' }}>
          <strong>Bathroom:</strong> {room.hasAttachedBathroom ? 'Attached' : 'Shared'}
        </p>
        <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: 'var(--muted)' }}>
          <strong>Furniture:</strong>{' '}
          <span style={{ textTransform: 'capitalize' }}>{FURNITURE_LABELS[room.furniture]}</span>
        </p>
        {room.description && (
          <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: 'var(--muted)', fontStyle: 'italic' }}>
            "{room.description}"
          </p>
        )}
      </div>
    </div>
  </div>
);
