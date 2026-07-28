import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import type { Room, Hostel } from '../types';
import { Plus, Trash2, ArrowLeft, Check, Edit2 } from 'lucide-react';

interface RoomListingProps {
  hostel: Hostel;
  onBack: () => void;
  token: string;
}

export const RoomListing = ({ hostel, onBack, token }: RoomListingProps) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [sharingType, setSharingType] = useState<'single' | 'double' | 'triple' | 'quad' | 'penta'>('single');
  const [price, setPrice] = useState('');
  const [seatsAvailable, setSeatsAvailable] = useState('1');
  const [floor, setFloor] = useState('Ground Floor');
  const [hasAttachedBathroom, setHasAttachedBathroom] = useState(false);
  const [furniture, setFurniture] = useState<'bed' | 'mattress' | 'nothing'>('nothing');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');

  // Edit Modal states
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editSharingType, setEditSharingType] = useState<'single' | 'double' | 'triple' | 'quad' | 'penta'>('single');
  const [editPrice, setEditPrice] = useState('');
  const [editSeatsAvailable, setEditSeatsAvailable] = useState('1');
  const [editFloor, setEditFloor] = useState('Ground Floor');
  const [editHasAttachedBathroom, setEditHasAttachedBathroom] = useState(false);
  const [editFurniture, setEditFurniture] = useState<'bed' | 'mattress' | 'nothing'>('nothing');
  const [editPhotoUrls, setEditPhotoUrls] = useState<string[]>([]);
  const [editUploading, setEditUploading] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [editErrorMsg, setEditErrorMsg] = useState('');

  const handleEditMultiplePhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setEditUploading(true);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch(`${API_BASE_URL}/owners/upload-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || 'Upload failed');
        }
        newUrls.push(data.url);
      } catch (err: any) {
        alert(`Failed to upload file "${file.name}": ${err.message || err}`);
      }
    }

    setEditPhotoUrls(prev => [...prev, ...newUrls]);
    setEditUploading(false);
  };

  const handleMultiplePhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch(`${API_BASE_URL}/owners/upload-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || 'Upload failed');
        }
        newUrls.push(data.url);
      } catch (err: any) {
        alert(`Failed to upload file "${file.name}": ${err.message || err}`);
      }
    }

    setPhotoUrls(prev => [...prev, ...newUrls]);
    setUploading(false);
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/owners/hostels/${hostel.id}/rooms`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRooms(data.map((r: any) => ({
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
        })));
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [hostel.id]);




  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const filteredPhotos = photoUrls.filter(url => url.trim().length > 0);

    if (filteredPhotos.length < 2) {
      setErrorMsg('You must upload at least 2 pictures for the room (including room area and bathroom).');
      return;
    }

    const capacityMap = {
      single: 1,
      double: 2,
      triple: 3,
      quad: 4,
      penta: 5
    };
    const maxCap = capacityMap[sharingType];
    const seatsNum = parseInt(seatsAvailable);
    if (seatsNum < 1 || seatsNum > maxCap) {
      setErrorMsg(`Seats available must be between 1 and ${maxCap} for a ${sharingType} sharing room.`);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/owners/hostels/${hostel.id}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sharing_type: sharingType,
          price: parseInt(price),
          seats_available: seatsNum,
          floor,
          has_attached_bathroom: hasAttachedBathroom,
          furniture,
          images: filteredPhotos,
          description: description
        })
      });

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
      fetchRooms();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to list room');
    }
  };

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditErrorMsg('');

    if (!editingRoom) return;

    const filteredPhotos = editPhotoUrls.filter(url => url.trim().length > 0);

    if (filteredPhotos.length < 2) {
      setEditErrorMsg('You must upload at least 2 pictures for the room (including room area and bathroom).');
      return;
    }

    const capacityMap = {
      single: 1,
      double: 2,
      triple: 3,
      quad: 4,
      penta: 5
    };
    const maxCap = capacityMap[editSharingType];
    const seatsNum = parseInt(editSeatsAvailable);
    if (seatsNum < 1 || seatsNum > maxCap) {
      setEditErrorMsg(`Seats available must be between 1 and ${maxCap} for a ${editSharingType} sharing room.`);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/owners/rooms/${editingRoom.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sharing_type: editSharingType,
          price: parseInt(editPrice),
          seats_available: seatsNum,
          floor: editFloor,
          has_attached_bathroom: editHasAttachedBathroom,
          furniture: editFurniture,
          images: filteredPhotos,
          description: editDescription
        })
      });

      const data = await response.json();
      if (!response.ok) {
        const errMsg = Array.isArray(data.detail)
          ? data.detail.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join('\n')
          : data.detail || 'Failed to update room';
        throw new Error(errMsg);
      }

      setEditingRoom(null);
      fetchRooms();
      alert('Room updated successfully!');
    } catch (err: any) {
      setEditErrorMsg(err.message || 'Failed to update room');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/owners/rooms/${roomId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchRooms();
      }
    } catch (err) {
      console.error('Error deleting room:', err);
    }
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
        <button onClick={onBack} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Back to Hostels
        </button>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Manage Rooms - {hostel.name}</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>List rooms and configuration details for this property.</p>
        </div>
      </div>

      {rooms.length === 0 && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: 'var(--radius)', color: 'var(--destructive)', fontSize: '0.875rem' }}>
          <strong>Notice:</strong> You must list at least a single room. Otherwise, this hostel listing will remain incomplete and unapproved by administrators.
        </div>
      )}

      <div style={contentGridStyle}>
        {/* Left Side: Add Room Form */}
        <div className="card" style={{ padding: '1.5rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Add Room Details</h3>
          
          <form onSubmit={handleAddRoom} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {errorMsg && <div style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>{errorMsg}</div>}
            {successMsg && <div style={{ color: 'var(--success)', fontSize: '0.85rem' }}>{successMsg}</div>}

            <div className="form-group">
              <label className="form-label">Sharing Status / Type</label>
              <select className="form-select" value={sharingType} onChange={(e) => {
                const newSharing = e.target.value as any;
                setSharingType(newSharing);
                const capacityMap = { single: 1, double: 2, triple: 3, quad: 4, penta: 5 };
                setSeatsAvailable(String(Math.min(parseInt(seatsAvailable) || 1, capacityMap[newSharing])));
              }}>
                <option value="single">Single Room</option>
                <option value="double">2-Sharing Room</option>
                <option value="triple">3-Sharing Room</option>
                <option value="quad">4-Sharing Room</option>
                <option value="penta">5-Sharing Room</option>
              </select>
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
                Seats / Beds Available in this Room 
                <span style={{ color: 'var(--muted)', fontSize: '0.75rem', marginLeft: '0.25rem' }}>
                  (Max {sharingType === 'single' ? 1 : sharingType === 'double' ? 2 : sharingType === 'triple' ? 3 : sharingType === 'quad' ? 4 : 5})
                </span>
              </label>
              <input
                type="number"
                className="form-input"
                required
                min={1}
                max={sharingType === 'single' ? 1 : sharingType === 'double' ? 2 : sharingType === 'triple' ? 3 : sharingType === 'quad' ? 4 : 5}
                placeholder="e.g. 2"
                value={seatsAvailable}
                onChange={(e) => setSeatsAvailable(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Floor</label>
              <select className="form-select" value={floor} onChange={(e) => setFloor(e.target.value)}>
                <option value="Basement">Basement</option>
                <option value="Ground Floor">Ground Floor</option>
                <option value="1st Floor">1st Floor</option>
                <option value="2nd Floor">2nd Floor</option>
                <option value="3rd Floor">3rd Floor</option>
                <option value="4th Floor">4th Floor</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Furniture Provided</label>
              <select className="form-select" value={furniture} onChange={(e) => setFurniture(e.target.value as any)}>
                <option value="bed">Bed</option>
                <option value="mattress">Mattress Only</option>
                <option value="nothing">Nothing</option>
              </select>
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
                Room & Washroom Photos <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>(Upload at least 2 photos)</span>
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
              {uploading && <span style={{ color: 'var(--primary)', fontSize: '0.85rem', display: 'block', marginTop: '0.25rem' }}>Uploading photos to Cloudflare R2...</span>}

              {photoUrls.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                  {photoUrls.map((url, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '80px', height: '60px' }}>
                      <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} alt="" />
                      <button
                        type="button"
                        onClick={() => setPhotoUrls(photoUrls.filter((_, i) => i !== idx))}
                        style={{
                          position: 'absolute',
                          top: '-5px',
                          right: '-5px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--danger)',
                          color: 'white',
                          border: 'none',
                          fontSize: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Plus size={16} /> List Room
            </button>
          </form>
        </div>

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
                  <div key={room.id} style={roomCardStyle}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {room.images.slice(0, 2).map((img, i) => (
                          <img key={i} src={img} style={roomThumbStyle} alt="" />
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
                              onClick={() => {
                                setEditingRoom(room);
                                setEditSharingType(room.sharingType);
                                setEditPrice(String(room.price));
                                setEditSeatsAvailable(String(room.seatsAvailable));
                                setEditFloor(room.floor);
                                setEditHasAttachedBathroom(room.hasAttachedBathroom);
                                setEditFurniture(room.furniture);
                                setEditPhotoUrls(room.images);
                                setEditDescription(room.description || '');
                                setEditErrorMsg('');
                              }}
                              style={{ ...deleteBtnStyle, color: 'var(--muted)' }}
                              title="Edit Room"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDeleteRoom(room.id)} style={deleteBtnStyle} title="Delete Room">
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
                          <strong>Furniture:</strong> <span style={{ textTransform: 'capitalize' }}>{room.furniture === 'nothing' ? 'None' : room.furniture === 'mattress' ? 'Mattress Only' : room.furniture}</span>
                        </p>
                        {room.description && (
                          <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                            "{room.description}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleFinish} className="btn btn-primary" style={{ height: '48px', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Check size={18} /> Finish & Save Hostel Listing
          </button>
        </div>
      </div>

      {editingRoom && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Edit Room Details</h3>
              <button
                type="button"
                onClick={() => setEditingRoom(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '1.25rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
              {editErrorMsg && <div style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>{editErrorMsg}</div>}

              <div className="form-group">
                <label className="form-label">Sharing Status / Type</label>
                <select className="form-select" value={editSharingType} onChange={(e) => {
                  const newSharing = e.target.value as any;
                  setEditSharingType(newSharing);
                  const capacityMap = { single: 1, double: 2, triple: 3, quad: 4, penta: 5 };
                  setEditSeatsAvailable(String(Math.min(parseInt(editSeatsAvailable) || 1, capacityMap[newSharing])));
                }}>
                  <option value="single">Single Room</option>
                  <option value="double">2-Sharing Room</option>
                  <option value="triple">3-Sharing Room</option>
                  <option value="quad">4-Sharing Room</option>
                  <option value="penta">5-Sharing Room</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Price (PKR / Month per Room)</label>
                <input
                  type="number"
                  className="form-input"
                  required
                  min={0}
                  placeholder="e.g. 18000"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Seats / Beds Available in this Room
                  <span style={{ color: 'var(--muted)', fontSize: '0.75rem', marginLeft: '0.25rem' }}>
                    (Max {editSharingType === 'single' ? 1 : editSharingType === 'double' ? 2 : editSharingType === 'triple' ? 3 : editSharingType === 'quad' ? 4 : 5})
                  </span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  required
                  min={1}
                  max={editSharingType === 'single' ? 1 : editSharingType === 'double' ? 2 : editSharingType === 'triple' ? 3 : editSharingType === 'quad' ? 4 : 5}
                  placeholder="e.g. 2"
                  value={editSeatsAvailable}
                  onChange={(e) => setEditSeatsAvailable(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Floor</label>
                <select className="form-select" value={editFloor} onChange={(e) => setEditFloor(e.target.value)}>
                  <option value="Basement">Basement</option>
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="1st Floor">1st Floor</option>
                  <option value="2nd Floor">2nd Floor</option>
                  <option value="3rd Floor">3rd Floor</option>
                  <option value="4th Floor">4th Floor</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Furniture Provided</label>
                <select className="form-select" value={editFurniture} onChange={(e) => setEditFurniture(e.target.value as any)}>
                  <option value="bed">Bed</option>
                  <option value="mattress">Mattress Only</option>
                  <option value="nothing">Nothing</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="editAttachedBathroom"
                  checked={editHasAttachedBathroom}
                  onChange={(e) => setEditHasAttachedBathroom(e.target.checked)}
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
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  style={{ minHeight: '60px', resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Room & Washroom Photos <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>(Upload at least 2 photos)</span>
                </label>
                <input
                  type="file"
                  multiple
                  key={editPhotoUrls.length === 0 ? 'empty' : 'loaded'}
                  accept="image/*"
                  onChange={handleEditMultiplePhotosUpload}
                  disabled={editUploading}
                  style={{ width: '100%', marginBottom: '0.5rem' }}
                />
                {editUploading && <span style={{ color: 'var(--primary)', fontSize: '0.85rem', display: 'block', marginTop: '0.25rem' }}>Uploading photos to Cloudflare R2...</span>}

                {editPhotoUrls.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                    {editPhotoUrls.map((url, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '80px', height: '60px' }}>
                        <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} alt="" />
                        <button
                          type="button"
                          onClick={() => setEditPhotoUrls(editPhotoUrls.filter((_, i) => i !== idx))}
                          style={{
                            position: 'absolute',
                            top: '-5px',
                            right: '-5px',
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--danger)',
                            color: 'white',
                            border: 'none',
                            fontSize: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold'
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
                <button type="button" className="btn btn-secondary" onClick={() => setEditingRoom(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.6)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '1rem',
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '2rem',
  width: '100%',
  maxWidth: '480px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
  position: 'relative',
  maxHeight: '90vh',
  overflowY: 'auto',
};

// Styles
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



const roomCardStyle: React.CSSProperties = {
  padding: '1rem',
  backgroundColor: 'var(--secondary)',
  borderRadius: 'var(--radius)',
  border: '1px solid var(--border)',
};

const roomThumbStyle: React.CSSProperties = {
  width: '60px',
  height: '60px',
  objectFit: 'cover',
  borderRadius: '4px',
};

const deleteBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--danger)',
  cursor: 'pointer',
  padding: '0.25rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
