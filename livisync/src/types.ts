export interface Preferences {
  sleepSchedule: 'early-bird' | 'night-owl' | 'flexible';
  cleanliness: 'meticulous' | 'moderate' | 'relaxed';
  smoking: 'no' | 'yes' | 'outside-only';
  pets: 'no' | 'yes' | 'likes-but-no-own';
  guestTolerance: 'rarely' | 'weekends' | 'anytime';
}

export interface User {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  photo: string;
  bio: string;
  budget: number; // monthly max budget
  location: string; // e.g. Lahore, Islamabad
  role: 'student' | 'admin';
  status: 'active' | 'suspended';
  preferences: Preferences;
  blockedUsers: string[]; // user IDs blocked by this user
}

export interface Hostel {
  id: string;
  name: string;
  location: string;
  price: number; // monthly rent
  description: string;
  images: string[];
  amenities: string[];
  rooms: {
    sharingType: 'single' | 'double' | 'triple';
    available: number;
  }[];
  currentOccupants: string[]; // user IDs currently staying
}

export interface MatchRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
  message: string;
  timestamp: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  reason: 'fake-profile' | 'harassment' | 'spam' | 'other';
  description: string;
  status: 'pending' | 'resolved';
  timestamp: string;
}
