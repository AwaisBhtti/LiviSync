/**
 * AddRoomForm — form to list a new room inside a hostel.
 * Extracted from RoomListing.tsx.
 */
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { uploadImage } from '../../api/hostelApi';
import { SHARING_TYPES, SHARING_TYPE_LABELS, CAPACITY_MAP, FLOORS, FURNITURE_OPTIONS } from '../../constants/roomOptions';
import type { SharingType, FurnitureType } from '../../constants/roomOptions';
import { ImageLightbox } from '../ImageLightbox';
import { API_BASE_URL } from '../../config';
import { CustomSelect } from '../ui/CustomSelect';

interface AddRoomFormProps {
  hostelId: string;
  token: string;
  onRoomAdded: () => void;
}

export const AddRoomForm = ({ hostelId, token, onRoomAdded }: AddRoomFormProps) => {
  const [sharingType, setSharingType] = useState<SharingType>('single');
  const [price, setPrice] = useState('');
  const [seatsAvailable, setSeatsAvailable] = useState('1');
  const [floor, setFloor] = useState('Ground Floor');
  const [hasAttachedBathroom, setHasAttachedBathroom] = useState(false);
  const [furniture, setFurniture] = useState<FurnitureType>('nothing');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const maxSeats = CAPACITY_MAP[sharingType];

  const handleMultiplePhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

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
      const response = await fetch(
        `${API_BASE_URL}/owners/hostels/${hostelId}/rooms`,
        {
          method: 'POST',
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
        }
      );
      const data = await response.json();
      if (!response.ok) {
        const errMsg = Array.isArray(data.detail)
          ? data.detail.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join('\n')
          : data.detail || 'Failed to list room';
        throw new Error(errMsg);
      }
      setSuccessMsg('Room listed successfully!');
      setPrice('');
      setSeatsAvailable('1');
      setFloor('Ground Floor');
      setHasAttachedBathroom(false);
      setFurniture('nothing');
      setPhotoUrls([]);
      setDescription('');
      onRoomAdded();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to list room');
    }
  };

  return (
    <>
      <div className="card" style={{ padding: '1.5rem', height: 'fit-content' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Add Room Details</h3>
        <form onSubmit={handleAddRoom} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMsg && <div style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>{errorMsg}</div>}
          {successMsg && <div style={{ color: 'var(--success)', fontSize: '0.85rem' }}>{successMsg}</div>}

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
              id="attachedBathroom"
              checked={hasAttachedBathroom}
              onChange={(e) => setHasAttachedBathroom(e.target.checked)}
            />
            <label htmlFor="attachedBathroom" style={{ fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
              Has Attached Bathroom
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Room Description (Optional)</label>
            <textarea
              className="form-input"
              placeholder="e.g. Spacious corner room with study desk and nice view."
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
            <p style={{ color: 'var(--muted)', fontSize: '0.75rem', margin: '0 0 0.5rem 0' }}>
              💡 <em>Select and upload multiple photos at once (including sleeping area and bathroom).</em>
            </p>
            <input
              type="file"
              multiple
              key={photoUrls.length === 0 ? 'empty' : 'loaded'}
              accept="image/*"
              onChange={handleMultiplePhotosUpload}
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

          <button
            type="submit"
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Plus size={16} /> List Room
          </button>
        </form>
      </div>

      <ImageLightbox imageUrl={lightboxUrl} onClose={() => setLightboxUrl(null)} />
    </>
  );
};
