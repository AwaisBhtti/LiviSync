import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import type { User, Hostel, MatchRequest, Report } from './types';
import { Navbar } from './components/Navbar';
import { HostelDirectory } from './components/HostelDirectory';
import { RoommateFinder } from './components/RoommateFinder';
import { ChatModule } from './components/ChatModule';
import { ProfileSettings } from './components/ProfileSettings';
import { AdminPanel } from './components/AdminPanel';
import { AuthScreen } from './components/AuthScreen';
import { ProtectedRoute } from './components/ProtectedRoute';
import { OwnerPortal } from './components/OwnerPortal';
import { RegisterOwner } from './components/RegisterOwner';

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
        occupation: data.profile?.occupation || 'student',
        institution: data.profile?.institution || '',
        company: data.profile?.company || '',
        preferences: {
          sleepSchedule: data.preferences?.sleep_schedule || 'flexible',
          cleanliness: data.preferences?.cleanliness || 'moderate',
          smoking: data.preferences?.smoking || 'no',
          pets: data.preferences?.pets || 'no',
          guestTolerance: data.preferences?.guest_tolerance || 'weekends'
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

  const fetchAdminData = async (authToken: string) => {
    try {
      // 1. Fetch Users
      const usersRes = await fetch('http://127.0.0.1:8000/admin/users', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      // 2. Fetch Hostels
      const hostelsRes = await fetch('http://127.0.0.1:8000/admin/hostels', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (hostelsRes.ok) {
        const hostelsData = await hostelsRes.json();
        setHostels(hostelsData);
      }

      // 3. Fetch Reports
      const reportsRes = await fetch('http://127.0.0.1:8000/admin/reports', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData);
      }

      // 4. Fetch Match Requests
      const matchesRes = await fetch('http://127.0.0.1:8000/admin/matches', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (matchesRes.ok) {
        const matchesData = await matchesRes.json();
        setMatchRequests(matchesData);
      }
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    }
  };

  const fetchStudentData = async (authToken: string) => {
    try {
      // 1. Fetch Roommates (all other students)
      const roommatesRes = await fetch('http://127.0.0.1:8000/auth/roommates', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (roommatesRes.ok) {
        const roommatesData = await roommatesRes.json();
        const mappedUsers = roommatesData.map((u: any) => ({
          id: u.id,
          email: u.email,
          name: u.profile?.name || 'New User',
          age: u.profile?.age || 18,
          gender: u.profile?.gender || 'male',
          photo: u.profile?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&h=400&q=80',
          bio: u.profile?.bio || '',
          budget: u.profile?.budget || 0,
          location: u.profile?.location || '',
          role: u.profile?.role || 'student',
          status: u.profile?.status || 'active',
          occupation: u.profile?.occupation || 'student',
          institution: u.profile?.institution || '',
          company: u.profile?.company || '',
          preferences: {
            sleepSchedule: u.preferences?.sleep_schedule || 'flexible',
            cleanliness: u.preferences?.cleanliness || 'moderate',
            smoking: u.preferences?.smoking || 'no',
            pets: u.preferences?.pets || 'no',
            guestTolerance: u.preferences?.guest_tolerance || 'weekends'
          },
          blockedUsers: []
        }));
        setUsers(mappedUsers);
      }

      // 2. Fetch Hostels
      const hostelsRes = await fetch('http://127.0.0.1:8000/auth/hostels', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (hostelsRes.ok) {
        const hostelsData = await hostelsRes.json();
        setHostels(hostelsData);
      }

      // 3. Fetch Matches
      const matchesRes = await fetch('http://127.0.0.1:8000/auth/matches', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (matchesRes.ok) {
        const matchesData = await matchesRes.json();
        const mappedMatches = matchesData.map((m: any) => ({
          id: m.id,
          senderId: m.sender_id,
          receiverId: m.receiver_id,
          status: m.status,
          message: m.message || '',
          timestamp: m.created_at
        }));
        setMatchRequests(mappedMatches);
      }
    } catch (err) {
      console.error('Error loading roommate directory data:', err);
    }
  };

  // Load state or sync active user session
  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    }
  }, [token]);

  useEffect(() => {
    if (token && currentUser) {
      if (currentUser.role === 'admin') {
        fetchAdminData(token);
      } else {
        fetchStudentData(token);
      }
    }
  }, [token, currentUser]);

  useEffect(() => {
    if (currentUser) localStorage.setItem('livisync_active_user', JSON.stringify(currentUser));
  }, [currentUser]);



  // Handler: Save profile settings
  const handleSaveProfile = async (updatedUser: User) => {
    try {
      const token = localStorage.getItem('livisync_token');
      const response = await fetch('http://127.0.0.1:8000/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: updatedUser.name,
          age: updatedUser.age,
          gender: updatedUser.gender,
          bio: updatedUser.bio,
          budget: updatedUser.budget,
          location: updatedUser.location,
          occupation: updatedUser.occupation,
          institution: updatedUser.institution,
          company: updatedUser.company,
          sleep_schedule: updatedUser.preferences.sleepSchedule,
          cleanliness: updatedUser.preferences.cleanliness,
          smoking: updatedUser.preferences.smoking,
          pets: updatedUser.preferences.pets,
          guest_tolerance: updatedUser.preferences.guestTolerance,
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update profile on server');
      }

      setCurrentUser(updatedUser);
      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
    } catch (err: any) {
      alert(err.message || 'Error occurred saving profile.');
    }
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
  const handleToggleUserStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      const token = localStorage.getItem('livisync_token');
      const response = await fetch(`http://127.0.0.1:8000/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update status on server');
      }
      
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
      );
    } catch (err: any) {
      alert(err.message || 'Error occurred updating status.');
    }
  };

  const handleVerifyHostel = async (hostelId: string) => {
    try {
      const token = localStorage.getItem('livisync_token');
      const response = await fetch(`http://127.0.0.1:8000/admin/hostels/${hostelId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to verify listing on server');
      }
      
      setHostels((prev) =>
        prev.map((h) => (h.id === hostelId ? { ...h, isVerified: true } : h))
      );
      alert('Listing verified successfully!');
    } catch (err: any) {
      alert(err.message || 'Error verifying listing.');
    }
  };

  // Handler Admin: Resolve Report
  const handleResolveReport = async (reportId: string) => {
    try {
      const token = localStorage.getItem('livisync_token');
      const response = await fetch(`http://127.0.0.1:8000/admin/reports/${reportId}/resolve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to resolve report on server');
      }
      
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved' as const } : r))
      );
      alert('Report marked as resolved!');
    } catch (err: any) {
      alert(err.message || 'Error resolving report.');
    }
  };

  // Handler Admin: Delete User Profile
  const handleDeleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('livisync_token');
      const response = await fetch(`http://127.0.0.1:8000/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to delete user on server');
      }

      setUsers((prev) => prev.filter((u) => u.id !== userId));
      // Clear requests containing this user
      setMatchRequests((prev) =>
        prev.filter((r) => r.senderId !== userId && r.receiverId !== userId)
      );
      alert('User deleted successfully.');
    } catch (err: any) {
      alert(err.message || 'Error deleting user.');
    }
  };

  const handleAddHostel = (newHostel: Hostel) => {
    setHostels((prev) => [...prev, newHostel]);
  };

  const handleEditHostel = (updatedHostel: Hostel) => {
    setHostels((prev) =>
      prev.map((h) => (h.id === updatedHostel.id ? updatedHostel : h))
    );
  };

  const handleDeleteHostel = (hostelId: string) => {
    setHostels((prev) => prev.filter((h) => h.id !== hostelId));
  };

  // Layout for protected routes
  const AppLayout = () => {
    const unreadCount = matchRequests.filter(
      (r) => r.receiverId === currentUser!.id && r.status === 'pending'
    ).length;

    return (
      <div className="app-container">
        <Navbar
          currentUser={currentUser!}
          onLogout={handleLogout}
          unreadCount={unreadCount}
        />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    );
  };

  if (token && !currentUser) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p style={{ color: 'var(--muted)' }}>Loading LiviSync Application State...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            token ? (
              <Navigate to="/hostels" replace />
            ) : (
              <AuthScreen onAuthSuccess={handleAuthSuccess} />
            )
          }
        />
        <Route
          path="/register"
          element={
            token ? (
              <Navigate to="/hostels" replace />
            ) : (
              <AuthScreen onAuthSuccess={handleAuthSuccess} />
            )
          }
        />
        <Route
          path="/register-owner/:token"
          element={
            token ? (
              <Navigate to="/hostels" replace />
            ) : (
              <RegisterOwner />
            )
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/hostels" replace />} />
            <Route
              path="/hostels"
              element={
                <HostelDirectory
                  hostels={hostels}
                  users={users}
                  currentUser={currentUser!}
                  onBookRoom={handleBookRoom}
                />
              }
            />
            <Route
              path="/roommates"
              element={
                <RoommateFinder
                  currentUser={currentUser!}
                  users={users}
                  matchRequests={matchRequests}
                  onSendRequest={handleSendRequest}
                  onBlockUser={handleBlockUser}
                  onReportUser={handleReportUser}
                />
              }
            />
            <Route
              path="/chats"
              element={
                <ChatModule
                  currentUser={currentUser!}
                  users={users}
                  matchRequests={matchRequests}
                  onAcceptRequest={handleAcceptRequest}
                  onDeclineRequest={handleDeclineRequest}
                  onBlockUser={handleBlockUser}
                />
              }
            />
            <Route
              path="/profile"
              element={
                <ProfileSettings currentUser={currentUser!} onSave={handleSaveProfile} />
              }
            />
            <Route
              path="/admin"
              element={
                currentUser?.role === 'admin' ? (
                  <AdminPanel
                    users={users}
                    reports={reports}
                    hostels={hostels}
                    matchRequests={matchRequests}
                    onToggleUserStatus={handleToggleUserStatus}
                    onResolveReport={handleResolveReport}
                    onDeleteUser={handleDeleteUser}
                    onVerifyHostel={handleVerifyHostel}
                  />
                ) : (
                  <Navigate to="/hostels" replace />
                )
              }
            />
            <Route
              path="/owner"
              element={
                currentUser?.role === 'owner' ? (
                  <OwnerPortal
                    currentUser={currentUser!}
                    hostels={hostels}
                    onAddHostel={handleAddHostel}
                    onEditHostel={handleEditHostel}
                    onDeleteHostel={handleDeleteHostel}
                  />
                ) : (
                  <Navigate to="/hostels" replace />
                )
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/hostels" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
