/**
 * Room configuration constants — shared between AddRoomForm and EditRoomModal.
 */

export type SharingType = 'single' | 'double' | 'triple' | 'quad' | 'penta';
export type FurnitureType = 'bed' | 'mattress' | 'nothing';

/** Max occupancy per sharing type */
export const CAPACITY_MAP: Record<SharingType, number> = {
  single: 1,
  double: 2,
  triple: 3,
  quad: 4,
  penta: 5,
};

/** Displayed label for each sharing type */
export const SHARING_TYPE_LABELS: Record<SharingType, string> = {
  single: 'Single Room',
  double: '2-Sharing Room',
  triple: '3-Sharing Room',
  quad: '4-Sharing Room',
  penta: '5-Sharing Room',
};

/** All sharing type keys in order */
export const SHARING_TYPES: SharingType[] = ['single', 'double', 'triple', 'quad', 'penta'];

/** Available floor options */
export const FLOORS = [
  'Basement',
  'Ground Floor',
  '1st Floor',
  '2nd Floor',
  '3rd Floor',
  '4th Floor',
] as const;

/** Available furniture options */
export const FURNITURE_OPTIONS: { value: FurnitureType; label: string }[] = [
  { value: 'bed', label: 'Bed' },
  { value: 'mattress', label: 'Mattress Only' },
  { value: 'nothing', label: 'Nothing' },
];

/** Human-readable furniture label */
export const FURNITURE_LABELS: Record<FurnitureType, string> = {
  bed: 'Furnished (Bed)',
  mattress: 'Mattress Provided',
  nothing: 'Unfurnished',
};
