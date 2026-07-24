import { useState, useEffect } from 'react';
import type { User, Hostel, MatchRequest, Report } from './types';
import { INITIAL_USERS, INITIAL_HOSTELS, INITIAL_MATCH_REQUESTS } from './mockData';
import { Navbar } from './components/Navbar';
import { HostelDirectory } from './components/HostelDirectory';
import { RoommateFinder } from './components/RoommateFinder';
import { ChatModule } from './components/ChatModule';
import { ProfileSettings } from './components/ProfileSettings';
import { AdminPanel } from './components/AdminPanel';
import { AuthScreen } from './components/AuthScreen';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  
  const [token, setToken] = useState<string | null>(localStorage.getItem('livisync_token'));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('hostels');

  // Fetch the currently authenticated user from backend
  const fetchCurrentUser = async (authToken: string) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Session expired or invalid token');
      }
      const data = await response.json();
      const mappedUser: User = {
        id: data.id,
        email: data.email,
        name: data.profile?.name || 'New User',
        age: data.profile?.age || 18,
        gender: data.profile?.gender === 'female' ? 'female' : data.profile?.gender === 'other' ? 'other' : 'male',
        photo: data.profile?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&h=400&q=80',
        bio: data.profile?.bio || '',
        budget: data.profile?.budget || 0,
        location: data.profile?.location || '',
        role: data.profile?.role === 'admin' ? 'admin' : 'student',
        status: data.profile?.status === 'suspended' ? 'suspended' : 'active',
        preferences: {
          sleepSchedule: 'flexible',
          cleanliness: 'moderate',
          smoking: 'no',
          pets: 'no',
          guestTolerance: 'weekends'
        },
        blockedUsers: []
      };
      setCurrentUser(mappedUser);
    } catch (err) {
      console.error(err);
      handleLogout();
    }
  };

  const handleAuthSuccess = (authToken: string) => {
    localStorage.setItem('livisync_token', authToken);
    setToken(authToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('livisync_token');
    setToken(null);
    setCurrentUser(null);
  };

  // Load state from localStorage or initialize
  useEffect(() => {
    const storedUsers = localStorage.getItem('livisync_users');
    const storedHostels = localStorage.getItem('livisync_hostels');
    const storedRequests = localStorage.getItem('livisync_requests');
    const storedReports = localStorage.getItem('livisync_reports');

    const initializedUsers = storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS;
    const initializedHostels = storedHostels ? JSON.parse(storedHostels) : INITIAL_HOSTELS;
    const initializedRequests = storedRequests ? JSON.parse(storedRequests) : INITIAL_MATCH_REQUESTS;
    const initializedReports = storedReports ? JSON.parse(storedReports) : [];
    
    setUsers(initializedUsers);
    setHostels(initializedHostels);
    setMatchRequests(initializedRequests);
    setReports(initializedReports);
  }, []);

  // Fetch current user details if token changes
  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    }
  }, [token]);


  // Sync state to localStorage whenever it changes
  useEffect(() => {
    if (users.length > 0) localStorage.setItem('livisync_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (hostels.length > 0) localStorage.setItem('livisync_hostels', JSON.stringify(hostels));
  }, [hostels]);

  useEffect(() => {
    if (matchRequests.length > 0) localStorage.setItem('livisync_requests', JSON.stringify(matchRequests));
  }, [matchRequests]);

  useEffect(() => {
    if (reports.length > 0) localStorage.setItem('livisync_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    if (currentUser) localStorage.setItem('livisync_active_user', JSON.stringify(currentUser));
  }, [currentUser]);



  // Handler: Save profile settings
  const handleSaveProfile = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  };

  // Handler: Book a Room
  const handleBookRoom = (hostelId: string, sharingType: 'single' | 'double' | 'triple') => {
    if (!currentUser) return;
    
    setHostels((prev) =>
      prev.map((h) => {
        if (h.id === hostelId) {
          // Check availability and book
          const updatedRooms = h.rooms.map((r) => {
            if (r.sharingType === sharingType && r.available > 0) {
              return { ...r, available: r.available - 1 };
            }
            return r;
          });

          // Add user to currentOccupants if not already there
          const currentOccupants = h.currentOccupants.includes(currentUser.id)
            ? h.currentOccupants
            : [...h.currentOccupants, currentUser.id];

          return {
            ...h,
            rooms: updatedRooms,
            currentOccupants,
          };
        }
        return h;
      })
    );

    alert(`Successfully booked a spot in the ${sharingType} sharing room!`);
  };

  // Handler: Send Match Request
  const handleSendRequest = (receiverId: string, message: string) => {
    if (!currentUser) return;

    const newRequest: MatchRequest = {
      id: `req_${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      status: 'pending',
      message,
      timestamp: new Date().toISOString(),
    };

    setMatchRequests((prev) => [...prev, newRequest]);
  };

  // Handler: Accept Request
  const handleAcceptRequest = (reqId: string) => {
    setMatchRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'accepted' as const } : r))
    );
  };

  // Handler: Decline Request
  const handleDeclineRequest = (reqId: string) => {
    setMatchRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'declined' as const } : r))
    );
  };

  // Handler: Block User
  const handleBlockUser = (targetId: string) => {
    if (!currentUser) return;
    const updatedBlocked = currentUser.blockedUsers.includes(targetId)
      ? currentUser.blockedUsers
      : [...currentUser.blockedUsers, targetId];

    const updatedUser = { ...currentUser, blockedUsers: updatedBlocked };
    setCurrentUser(updatedUser);
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? updatedUser : u))
    );
  };

  // Handler: Report User
  const handleReportUser = (reportedId: string, reason: string, description: string) => {
    if (!currentUser) return;

    const newReport: Report = {
      id: `rep_${Date.now()}`,
      reporterId: currentUser.id,
      reportedId,
      reason: reason as any,
      description,
      status: 'pending',
      timestamp: new Date().toISOString(),
    };

    setReports((prev) => [...prev, newReport]);
    alert('Thank you. The report has been filed and sent to administrators for review.');
  };

  // Handler Admin: Toggle User Status (Suspend/Activate)
  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'active' ? 'suspended' as const : 'active' as const;
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  // Handler Admin: Resolve Report
  const handleResolveReport = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved' as const } : r))
    );
  };

  // Handler Admin: Delete User Profile
  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    // Clear requests containing this user
    setMatchRequests((prev) =>
      prev.filter((r) => r.senderId !== userId && r.receiverId !== userId)
    );
  };

  if (!token) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  if (!currentUser) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p style={{ color: 'var(--muted)' }}>Loading LiviSync Application State...</p>
      </div>
    );
  }

  // Count incoming pending requests for the unread badge
  const unreadCount = matchRequests.filter(
    (r) => r.receiverId === currentUser.id && r.status === 'pending'
  ).length;

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        unreadCount={unreadCount}
      />

      <main className="main-content">
        {activeTab === 'hostels' && (
          <HostelDirectory
            hostels={hostels}
            users={users}
            currentUser={currentUser}
            onBookRoom={handleBookRoom}
          />
        )}

        {activeTab === 'roommates' && (
          <RoommateFinder
            currentUser={currentUser}
            users={users}
            matchRequests={matchRequests}
            onSendRequest={handleSendRequest}
            onBlockUser={handleBlockUser}
            onReportUser={handleReportUser}
          />
        )}

        {activeTab === 'chats' && (
          <ChatModule
            currentUser={currentUser}
            users={users}
            matchRequests={matchRequests}
            onAcceptRequest={handleAcceptRequest}
            onDeclineRequest={handleDeclineRequest}
            onBlockUser={handleBlockUser}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileSettings currentUser={currentUser} onSave={handleSaveProfile} />
        )}

        {activeTab === 'admin' && currentUser.role === 'admin' && (
          <AdminPanel
            users={users}
            reports={reports}
            hostels={hostels}
            matchRequests={matchRequests}
            onToggleUserStatus={handleToggleUserStatus}
            onResolveReport={handleResolveReport}
            onDeleteUser={handleDeleteUser}
          />
        )}
      </main>
    </div>
  );
}
