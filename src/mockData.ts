import type { User, Hostel, MatchRequest } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_current',
    name: 'Zayn Malik',
    age: 21,
    gender: 'male',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&h=400&q=80',
    bio: 'CS Student at NUST. Looking for a neat, quiet roommate who respects study hours and doesn\'t mind a weekend gaming session.',
    budget: 18000,
    location: 'Islamabad',
    role: 'student',
    status: 'active',
    blockedUsers: [],
    preferences: {
      sleepSchedule: 'night-owl',
      cleanliness: 'meticulous',
      smoking: 'no',
      pets: 'likes-but-no-own',
      guestTolerance: 'weekends',
    },
  },
  {
    id: 'user_1',
    name: 'Aisha Khan',
    age: 20,
    gender: 'female',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80',
    bio: 'Pre-med student. Very tidy, mostly quiet, looking for a roommate who also keeps study spaces clean and respects sleeping early.',
    budget: 22000,
    location: 'Lahore',
    role: 'student',
    status: 'active',
    blockedUsers: [],
    preferences: {
      sleepSchedule: 'early-bird',
      cleanliness: 'meticulous',
      smoking: 'no',
      pets: 'no',
      guestTolerance: 'rarely',
    },
  },
  {
    id: 'user_2',
    name: 'Hamza Ahmed',
    age: 22,
    gender: 'male',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
    bio: 'Software engineer under training. Flex sleep cycle, loves pets, super relaxed about guests coming over.',
    budget: 15000,
    location: 'Islamabad',
    role: 'student',
    status: 'active',
    blockedUsers: [],
    preferences: {
      sleepSchedule: 'flexible',
      cleanliness: 'moderate',
      smoking: 'outside-only',
      pets: 'yes',
      guestTolerance: 'anytime',
    },
  },
  {
    id: 'user_3',
    name: 'Sara Butt',
    age: 21,
    gender: 'female',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&h=400&q=80',
    bio: 'Fine Arts student at NCA. Creative, night owl, loves cats, smoke outside. Looking for someone cool with an artistic vibe.',
    budget: 20000,
    location: 'Lahore',
    role: 'student',
    status: 'active',
    blockedUsers: [],
    preferences: {
      sleepSchedule: 'night-owl',
      cleanliness: 'relaxed',
      smoking: 'outside-only',
      pets: 'yes',
      guestTolerance: 'weekends',
    },
  },
  {
    id: 'user_4',
    name: 'Bilal Shah',
    age: 23,
    gender: 'male',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80',
    bio: 'Business Administration senior. Extrovert, loves football, flexible sleep cycle. Looking for a flatmate/roommate near campus.',
    budget: 17000,
    location: 'Islamabad',
    role: 'student',
    status: 'active',
    blockedUsers: [],
    preferences: {
      sleepSchedule: 'flexible',
      cleanliness: 'moderate',
      smoking: 'no',
      pets: 'no',
      guestTolerance: 'weekends',
    },
  },
  {
    id: 'user_admin',
    name: 'Administrator',
    age: 30,
    gender: 'other',
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&h=400&q=80',
    bio: 'LiviSync System Admin',
    budget: 0,
    location: 'Islamabad',
    role: 'admin',
    status: 'active',
    blockedUsers: [],
    preferences: {
      sleepSchedule: 'flexible',
      cleanliness: 'moderate',
      smoking: 'no',
      pets: 'no',
      guestTolerance: 'rarely',
    },
  },
];

export const INITIAL_HOSTELS: Hostel[] = [
  {
    id: 'hostel_1',
    name: 'Pine Breeze Student Residency',
    location: 'H-13, Islamabad',
    price: 16500,
    description: 'A premium and secure student hostel situated adjacent to NUST H-12 gate. Offers high-speed internet, laundry services, 3-time quality meals, and power backup.',
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596277865718-20413b8f8d53?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Wi-Fi', 'AC / Heating', 'Mess Facility', '24/7 Security', 'Backup Generator', 'Laundry'],
    rooms: [
      { sharingType: 'single', available: 2 },
      { sharingType: 'double', available: 4 },
      { sharingType: 'triple', available: 0 }
    ],
    currentOccupants: ['user_2', 'user_4']
  },
  {
    id: 'hostel_2',
    name: 'The Crown Boys Hostel',
    location: 'G-11, Islamabad',
    price: 14000,
    description: 'Comfortable living with study-friendly atmosphere. Walking distance from public transport. Includes hot water, high-speed fiber internet, and dynamic cleaning schedule.',
    images: [
      'https://images.unsplash.com/photo-1620332372374-f1a8c21be40b?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Wi-Fi', '24/7 Security', 'Mess Facility', 'Hot Water', 'Parking'],
    rooms: [
      { sharingType: 'single', available: 1 },
      { sharingType: 'double', available: 2 }
    ],
    currentOccupants: []
  },
  {
    id: 'hostel_3',
    name: 'Orchard Girls Residence',
    location: 'Gulberg III, Lahore',
    price: 19500,
    description: 'An elegant, highly secure all-female hostel in the heart of Gulberg, Lahore. Close to major universities, shopping areas, and cafes. Top-tier hygiene, CCTV, and air-conditioned rooms.',
    images: [
      'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596277865718-20413b8f8d53?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Wi-Fi', 'AC / Heating', 'Mess Facility', 'CCTV Security', 'Laundry', 'Common Study Area'],
    rooms: [
      { sharingType: 'single', available: 3 },
      { sharingType: 'double', available: 5 }
    ],
    currentOccupants: ['user_1', 'user_3']
  },
  {
    id: 'hostel_4',
    name: 'Margalla View Hostel',
    location: 'E-11, Islamabad',
    price: 12000,
    description: 'Affordable, neat and clean rooms for students and young working professionals. Situated at the foothills of Margalla. Very peaceful surroundings.',
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Wi-Fi', 'CCTV Security', 'Mess Facility', 'Kitchen Access'],
    rooms: [
      { sharingType: 'double', available: 6 },
      { sharingType: 'triple', available: 2 }
    ],
    currentOccupants: []
  },
  {
    id: 'hostel_5',
    name: 'Model Town Elite Hostel',
    location: 'Model Town, Lahore',
    price: 15000,
    description: 'Located in a lush green neighborhood, offering single and shared rooms. Spacious rooftop, gym facility, and weekly cleaning.',
    images: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Wi-Fi', 'Gym', 'Laundry', 'Security', 'Rooftop Lounge'],
    rooms: [
      { sharingType: 'single', available: 0 },
      { sharingType: 'double', available: 3 },
      { sharingType: 'triple', available: 1 }
    ],
    currentOccupants: []
  }
];

export const INITIAL_MATCH_REQUESTS: MatchRequest[] = [
  {
    id: 'req_1',
    senderId: 'user_2',
    receiverId: 'user_current',
    status: 'pending',
    message: 'Hey Zayn! I saw your profile and our compatibility is pretty good. I am also in Islamabad. Would you like to team up for a double room at Pine Breeze?',
    timestamp: '2026-07-03T18:30:00Z',
  }
];
