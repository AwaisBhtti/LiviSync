export interface Preferences {
  sleepSchedule: 'early-bird' | 'night-owl' | 'flexible';
  cleanliness: 'meticulous' | 'moderate' | 'relaxed';
  smoking: 'no' | 'yes' | 'outside-only';
  pets: 'no' | 'yes' | 'likes-but-no-own';
  guestTolerance: 'rarely' | 'weekends' | 'anytime';
}

export interface Student {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  photo: string;
  bio: string;
  budget: number; // monthly max budget
  location: string; // e.g. Lahore, Islamabad
  role: 'student';
  status: 'active' | 'suspended';
  preferences: Preferences;
  blockedUsers: string[]; // user IDs blocked by this user
  occupation?: 'student' | 'job';
  institution?: string;
  company?: string;
  phone?: string;
  hostelId?: string;
}

export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'owner';
  status: 'active' | 'suspended';
  age?: number;
  gender?: 'male' | 'female' | 'other';
  photo?: string;
  bio?: string;
  budget?: number;
  location?: string;
  preferences?: Preferences;
  blockedUsers?: string[];
  occupation?: 'student' | 'job';
  institution?: string;
  company?: string;
  hostelId?: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  status?: 'active' | 'suspended';
  age?: number;
  gender?: 'male' | 'female' | 'other';
  photo?: string;
  bio?: string;
  budget?: number;
  location?: string;
  preferences?: Preferences;
  blockedUsers?: string[];
  occupation?: 'student' | 'job';
  institution?: string;
  company?: string;
  phone?: string;
  hostelId?: string;
}

export type User = Student | Owner | Admin;

export interface Hostel {
  id: string;
  name: string;
  location: string;
  price: number; // monthly rent
  description: string;
  images: string[];
  amenities: string[];
  ownerId?: string;
  isVerified: boolean;
  rooms: {
    sharingType: 'single' | 'double' | 'triple';
    available: number;
  }[];
  currentOccupants?: string[];
}

export interface MatchRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
  message: string;
  created_at: string;
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
  created_at: string;
}
