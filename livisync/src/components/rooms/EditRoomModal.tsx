/**
 * EditRoomModal — modal form for editing an existing room.
 * Extracted from RoomListing.tsx.
 */
import { useState, useEffect } from 'react';
import type { Room } from '../../types';
import { uploadImage } from '../../api/hostelApi';
import { SHARING_TYPES, SHARING_TYPE_LABELS, CAPACITY_MAP, FLOORS, FURNITURE_OPTIONS } from '../../constants/roomOptions';
import type { SharingType, FurnitureType } from '../../constants/roomOptions';
import { ImageLightbox } from '../ImageLightbox';
import { modalOverlayStyle, modalContentStyle } from '../../styles/commonStyles';
import { API_BASE_URL } from '../../config';
import { CustomSelect } from '../ui/CustomSelect';

interface EditRoomModalProps {
  room: Room;
  token: string;
  onClose: () => void;
  onRoomUpdated: () => void;
}

export const EditRoomModal = ({ room, token, onClose, onRoomUpdated }: EditRoomModalProps) => {
  const [sharingType, setSharingType] = useState<SharingType>(room.sharingType);
  const [price, setPrice] = useState(String(room.price));
  const [seatsAvailable, setSeatsAvailable] = useState(String(room.seatsAvailable));
  const [floor, setFloor] = useState(room.floor);
  const [hasAttachedBathroom, setHasAttachedBathroom] = useState(room.hasAttachedBathroom);
  const [furniture, setFurniture] = useState<FurnitureType>(room.furniture);
  const [photoUrls, setPhotoUrls] = useState<string[]>(room.images);
  const [description, setDescription] = useState(room.description || '');
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Reset when room changes
  useEffect(() => {
    setSharingType(room.sharingType);
    setPrice(String(room.price));
    setSeatsAvailable(String(room.seatsAvailable));
    setFloor(room.floor);
    setHasAttachedBathroom(room.hasAttachedBathroom);
    setFurniture(room.furniture);
    setPhotoUrls(room.images);
    setDescription(room.description || '');
    setErrorMsg('');
  }, [room]);

  const maxSeats = CAPACITY_MAP[sharingType];

  const handlePhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadImage(files[i], token);
        newUrls.push(url);
      } catch (err: any) {
        alert(`Failed to upload file "${files[i].name}": ${err.message || err}`);
      }
    }
    setPhotoUrls((prev) => [...prev, ...newUrls]);
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const filteredPhotos = photoUrls.filter((url) => url.trim().length > 0);
    if (filteredPhotos.length < 2) {
      setErrorMsg('You must upload at least 2 pictures for the room (including room area and bathroom).');
      return;
    }

    const seatsNum = parseInt(seatsAvailable);
    if (seatsNum < 1 || seatsNum > maxSeats) {
      setErrorMsg(`Seats available must be between 1 and ${maxSeats} for a ${sharingType} sharing room.`);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/owners/rooms/${room.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          sharing_type: sharingType,
          price: parseInt(price),
          seats_available: seatsNum,
          floor,
          has_attached_bathroom: hasAttachedBathroom,
          furniture,
          images: filteredPhotos,
          description,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        const errMsg = Array.isArray(data.detail)
          ? data.detail.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join('\n')
          : data.detail || 'Failed to update room';
        throw new Error(errMsg);
      }
      onRoomUpdated();
      onClose();
      alert('Room updated successfully!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update room');
    }
  };

  return (
    <>
      <div style={modalOverlayStyle}>
        <div style={modalContentStyle}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '0.75rem',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Edit Room Details</h3>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '1.25rem' }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
            {errorMsg && <div style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>{errorMsg}</div>}

            <div className="form-group">
              <label className="form-label">Sharing Status / Type</label>
              <CustomSelect
                value={sharingType}
                onChange={(val) => {
                  const newSharing = val as SharingType;
                  setSharingType(newSharing);
                  setSeatsAvailable(String(Math.min(parseInt(seatsAvailable) || 1, CAPACITY_MAP[newSharing])));
                }}
                options={SHARING_TYPES.map((t) => ({
                  value: t,
                  label: SHARING_TYPE_LABELS[t],
                }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Price (PKR / Month per Room)</label>
              <input
                type="number"
                className="form-input"
                required
                min={0}
                placeholder="e.g. 18000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Seats / Beds Available{' '}
                <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>(Max {maxSeats})</span>
              </label>
              <input
                type="number"
                className="form-input"
                required
                min={1}
                max={maxSeats}
                placeholder="e.g. 2"
                value={seatsAvailable}
                onChange={(e) => setSeatsAvailable(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Floor</label>
              <CustomSelect
                value={floor}
                onChange={setFloor}
                options={FLOORS.map((f) => ({ value: f, label: f }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Furniture Provided</label>
              <CustomSelect
                value={furniture}
                onChange={(val) => setFurniture(val as FurnitureType)}
                options={FURNITURE_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                }))}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="editAttachedBathroom"
                checked={hasAttachedBathroom}
                onChange={(e) => setHasAttachedBathroom(e.target.checked)}
              />
              <label htmlFor="editAttachedBathroom" style={{ fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
                Has Attached Bathroom
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Room Description (Optional)</label>
              <textarea
                className="form-input"
                placeholder="e.g. Spacious corner room with study desk."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ minHeight: '60px', resize: 'vertical' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Room &amp; Washroom Photos{' '}
                <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>(Upload at least 2 photos)</span>
              </label>
              <input
                type="file"
                multiple
                key={photoUrls.length === 0 ? 'empty' : 'loaded'}
                accept="image/*"
                onChange={handlePhotosUpload}
                disabled={uploading}
                style={{ width: '100%', marginBottom: '0.5rem' }}
              />
              {uploading && (
                <span style={{ color: 'var(--primary)', fontSize: '0.85rem', display: 'block', marginTop: '0.25rem' }}>
                  Uploading photos to Cloudflare R2...
                </span>
              )}
              {photoUrls.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                  {photoUrls.map((url, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '80px', height: '60px' }}>
                      <img
                        src={url}
                        onClick={() => setLightboxUrl(url)}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)', cursor: 'zoom-in' }}
                        alt=""
                      />
                      <button
                        type="button"
                        onClick={() => setPhotoUrls(photoUrls.filter((_, i) => i !== idx))}
                        style={{
                          position: 'absolute', top: '-5px', right: '-5px',
                          width: '18px', height: '18px', borderRadius: '50%',
                          backgroundColor: 'var(--danger)', color: 'white',
                          border: 'none', fontSize: '10px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                Save Changes
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      <ImageLightbox imageUrl={lightboxUrl} onClose={() => setLightboxUrl(null)} />
    </>
  );
};
