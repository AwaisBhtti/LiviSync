import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import type { User, Hostel, Report, Student, Owner, Admin } from './types';
import { Navbar } from './components/Navbar';
import { HostelDirectory } from './components/HostelDirectory';
import { RoommateFinder } from './components/RoommateFinder';
import { ChatModule } from './components/ChatModule';
import { StudentProfile } from './components/StudentProfile';
import { OwnerProfile } from './components/OwnerProfile';
import { AdminProfile } from './components/AdminProfile';
import { AdminPanel } from './components/AdminPanel';
import { AuthScreen } from './components/AuthScreen';
import { ProtectedRoute } from './components/ProtectedRoute';
import { OwnerPortal } from './components/OwnerPortal';
import { RegisterOwner } from './components/RegisterOwner';
import { useAppDispatch, useAppSelector } from './store/store';
import {
  fetchCurrentUser,
  authSuccess,
  logout,
  setBlockedUsers,
  updateProfile,
} from './store/slices/authSlice';
import {
  fetchHostels,
  addHostel,
  editHostel,
  deleteHostel,
  verifyHostel,
} from './store/slices/hostelSlice';
import {
  fetchRoommates,
  updateUserInList,
} from './store/slices/roommateSlice';
import {
  fetchMatches,
  acceptRequest,
  declineRequest,
  removeMatchesForUser,
  setMatchesState,
} from './store/slices/matchSlice';
import {
  fetchReports,
  resolveReport,
  addLocalReport,
  fetchUsers,
  toggleUserStatus,
  deleteUser,
  warnUser,
} from './store/slices/adminSlice';
import { supabase } from './supabase';
import { API_BASE_URL } from './config';

export default function App() {
  const dispatch = useAppDispatch();

  // Select states from Redux store
  const { token, currentUser, loadingData: authLoading } = useAppSelector((state) => state.auth);
  const { hostels, loading: hostelsLoading } = useAppSelector((state) => state.hostels);
  const { users: studentRoommates, loading: usersLoading } = useAppSelector((state) => state.roommates);
  const { matchRequests, loading: matchesLoading } = useAppSelector((state) => state.matches);
  const { users: adminUsers, reports, loading: adminLoading } = useAppSelector((state) => state.admin);

  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const loadingData = authLoading || hostelsLoading || usersLoading || matchesLoading || adminLoading || (token !== null && currentUser === null);

  // Sync active user session
  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser(token));
    }
  }, [token, dispatch]);

  const fetchUnreadCount = async () => {
    if (!token || !currentUser || currentUser.role !== 'student') return;
    try {
      const res = await fetch(`${API_BASE_URL}/chat/unread-count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadMessagesCount(data.count);
      }
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  // Fetch unread messages count on token/user change
  useEffect(() => {
    if (token && currentUser && currentUser.role === 'student') {
      fetchUnreadCount();
    } else {
      setUnreadMessagesCount(0);
    }
  }, [token, currentUser]);

  // Global Realtime listeners for connection requests AND incoming chat messages
  useEffect(() => {
    if (!token || !currentUser || currentUser.role !== 'student') return;

    const supabaseToken = (currentUser as Student).supabaseToken;
    if (supabaseToken) {
      supabase.realtime.setAuth(supabaseToken);
    }

    // Subscribe to match requests changes
    const matchChannel = supabase
      .channel('match-requests-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'match_requests' },
        (payload) => {
          const row = (payload.new || payload.old) as any;
          if (row && (row.sender_id === currentUser.id || row.receiver_id === currentUser.id)) {
            dispatch(fetchMatches({ token, role: currentUser.role }));
            dispatch(fetchRoommates(token));
          }
        }
      )
      .subscribe();

    // Subscribe to messages changes to update the unread notification badge dynamically
    const msgChannel = supabase
      .channel('messages-realtime-badge')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as any;
          if (newMsg && newMsg.receiver_id === currentUser.id) {
            fetchUnreadCount();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchChannel);
      supabase.removeChannel(msgChannel);
    };
  }, [token, currentUser, dispatch]);

  // Fetch relevant directory data once authenticated
  useEffect(() => {
    if (token && currentUser) {
      const role = currentUser.role;
      dispatch(fetchHostels({ token, role }));

      if (role === 'student') {
        dispatch(fetchRoommates(token));
        dispatch(fetchMatches({ token, role }));
      } else if (role === 'admin') {
        dispatch(fetchUsers(token));
        dispatch(fetchReports(token));
      }
    }
  }, [token, currentUser, dispatch]);

  const handleAuthSuccess = (authToken: string) => {
    dispatch(authSuccess(authToken));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  // Handler: Save profile settings
  const handleSaveProfile = async (updatedUser: User) => {
    if (!token) return;
    try {
      const result = await dispatch(updateProfile({ updatedUser: updatedUser as Student, token })).unwrap();
      dispatch(updateUserInList(result));
    } catch (err: any) {
      alert(err || 'Error occurred saving profile.');
    }
  };


  // Handler: Send Match Request
  const handleSendRequest = async (receiverId: string, message: string) => {
    if (!currentUser || !token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/students/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ receiver_id: receiverId, message })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to send request');
      }
      dispatch(fetchMatches({ token, role: currentUser.role }));
      alert('Match request sent successfully!');
    } catch (err: any) {
      alert(err.message || 'Error sending request');
    }
  };

  // Handler: Accept Request
  const handleAcceptRequest = async (reqId: string) => {
    if (!currentUser || !token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/students/matches/${reqId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'accepted' })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to accept request');
      }
      dispatch(acceptRequest(reqId));
      alert('Match request accepted!');
    } catch (err: any) {
      alert(err.message || 'Error accepting request');
    }
  };

  // Handler: Decline Request
  const handleDeclineRequest = async (reqId: string) => {
    if (!currentUser || !token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/students/matches/${reqId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'declined' })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to decline request');
      }
      dispatch(declineRequest(reqId));
      alert('Match request declined.');
    } catch (err: any) {
      alert(err.message || 'Error declining request');
    }
  };

  // Handler: Cancel Match Request
  const handleCancelRequest = async (reqId: string) => {
    if (!currentUser || !token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/students/matches/${reqId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to cancel request');
      }
      dispatch(setMatchesState(matchRequests.filter((r) => r.id !== reqId)));
      alert('Match request cancelled.');
    } catch (err: any) {
      alert(err.message || 'Error cancelling request');
    }
  };

  const handleUnfriend = async (reqId: string) => {
    if (!currentUser || !token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/students/matches/${reqId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to unfriend');
      }
      dispatch(setMatchesState(matchRequests.filter((r) => r.id !== reqId)));
      alert('Roommate unfriended successfully.');
    } catch (err: any) {
      alert(err.message || 'Error unfriending');
    }
  };

  // Handler: Block User
  const handleBlockUser = async (targetId: string) => {
    if (!currentUser || currentUser.role !== 'student' || !token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/students/blocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ blocked_user_id: targetId })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to block user');
      }

      const updatedBlocked = currentUser.blockedUsers.includes(targetId)
        ? currentUser.blockedUsers
        : [...currentUser.blockedUsers, targetId];

      dispatch(setBlockedUsers(updatedBlocked));
      const updatedUser = { ...currentUser, blockedUsers: updatedBlocked };
      dispatch(updateUserInList(updatedUser));
      dispatch(removeMatchesForUser(targetId));
      alert('User blocked successfully.');
    } catch (err: any) {
      alert(err.message || 'Error blocking user');
    }
  };

  // Handler: Unblock User
  const handleUnblockUser = async (targetId: string) => {
    if (!currentUser || currentUser.role !== 'student' || !token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/students/blocks/${targetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to unblock user');
      }

      const updatedBlocked = currentUser.blockedUsers.filter(id => id !== targetId);

      dispatch(setBlockedUsers(updatedBlocked));
      const updatedUser = { ...currentUser, blockedUsers: updatedBlocked };
      dispatch(updateUserInList(updatedUser));
      alert('User unblocked successfully.');
    } catch (err: any) {
      alert(err.message || 'Error unblocking user');
    }
  };

  const handleReportUser = async (reportedId: string, reason: string, description: string) => {
    if (!currentUser || !token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/students/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reported_id: reportedId,
          reason,
          description
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to submit safety report');
      }

      const newReport: Report = {
        id: `rep_${Date.now()}`,
        reporterId: currentUser.id,
        reportedId,
        reason: reason as any,
        description,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      dispatch(addLocalReport(newReport));
      
      const confirmBlock = window.confirm(
        'Thank you. The safety report has been filed and sent to administrators for review.\n\n' +
        'Would you like to block this user as well to prevent them from contacting or matching with you?'
      );
      if (confirmBlock) {
        await handleBlockUser(reportedId);
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting safety report');
    }
  };

  // Handler Admin: Toggle User Status (Suspend/Activate)
  const handleToggleUserStatus = async (userId: string) => {
    if (!token) return;
    const user = adminUsers.find((u) => u.id === userId);
    if (!user) return;

    try {
      await dispatch(toggleUserStatus({ userId, token, currentStatus: user.status, role: user.role as 'student' | 'owner' })).unwrap();
    } catch (err: any) {
      alert(err || 'Error occurred updating status.');
    }
  };

  // Handler Admin: Warn User
  const handleWarnUser = async (reportId: string) => {
    if (!token) return;
    try {
      await dispatch(warnUser({ reportId, token })).unwrap();
      alert('Warning email sent successfully and report resolved.');
    } catch (err: any) {
      alert(err || 'Error sending warning email.');
    }
  };

  const handleVerifyHostel = async (hostelId: string) => {
    if (!token) return;
    try {
      await dispatch(verifyHostel({ hostelId, token })).unwrap();
      alert('Listing verified successfully!');
    } catch (err: any) {
      alert(err || 'Error verifying listing.');
    }
  };

  // Handler Admin: Resolve Report
  const handleResolveReport = async (reportId: string) => {
    if (!token) return;
    try {
      await dispatch(resolveReport({ reportId, token })).unwrap();
      alert('Report marked as resolved!');
    } catch (err: any) {
      alert(err || 'Error resolving report.');
    }
  };

  // Handler Admin: Delete User Profile
  const handleDeleteUser = async (userId: string) => {
    if (!token) return;
    const user = adminUsers.find((u) => u.id === userId);
    if (!user) return;
    try {
      await dispatch(deleteUser({ userId, token, role: user.role as 'student' | 'owner' })).unwrap();
      dispatch(removeMatchesForUser(userId));
      alert('User deleted successfully.');
    } catch (err: any) {
      alert(err || 'Error deleting user.');
    }
  };

  const handleAddHostel = async (newHostel: Omit<Hostel, 'id' | 'isVerified'>) => {
    if (!token) return;
    try {
      await dispatch(addHostel({ newHostel, token })).unwrap();
      alert('Hostel listing added successfully!');
    } catch (err: any) {
      const errMsg = typeof err === 'string' ? err : (err.message || 'Error adding hostel listing.');
      alert(errMsg);
    }
  };

  const handleEditHostel = async (updatedHostel: Hostel) => {
    if (!token) return;
    try {
      await dispatch(editHostel({ updatedHostel, token })).unwrap();
      alert('Hostel listing updated successfully!');
    } catch (err: any) {
      const errMsg = typeof err === 'string' ? err : (err.message || 'Error updating hostel listing.');
      alert(errMsg);
    }
  };

  const handleDeleteHostel = async (hostelId: string) => {
    if (!token) return;
    try {
      await dispatch(deleteHostel({ hostelId, token })).unwrap();
      alert('Hostel listing deleted.');
    } catch (err: any) {
      alert(err || 'Error deleting hostel listing.');
    }
  };



  const SpinnerLoader = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
    }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .glowing-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(99, 102, 241, 0.1);
          border-top: 4px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
        }
      `}</style>
      <div className="glowing-spinner"></div>
      <p style={{ marginTop: '1rem', fontWeight: 600, color: 'white', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
        Loading LiviSync...
      </p>
    </div>
  );

  if (loadingData) {
    return <SpinnerLoader />;
  }

  // Define active list of users based on current role (admin uses adminUsers, students use studentRoommates)
  const displayUsers = currentUser?.role === 'admin' ? adminUsers : studentRoommates;

  return (
    <>
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
            <Route element={
              <div className="app-container">
                <Navbar
                  currentUser={currentUser!}
                  onLogout={handleLogout}
                  unreadMessagesCount={unreadMessagesCount}
                  pendingRequestsCount={
                    matchRequests.filter(
                      (r) => r.receiverId === currentUser!.id && r.status === 'pending'
                    ).length
                  }
                />
                <main className="main-content">
                  <Outlet />
                </main>
              </div>
            }>
              <Route path="/" element={<Navigate to="/hostels" replace />} />
              <Route
                path="/hostels"
                element={
                  <HostelDirectory
                    hostels={hostels}
                    currentUser={currentUser!}
                    token={token}
                  />
                }
              />
              <Route
                path="/roommates"
                element={
                  <RoommateFinder
                    currentUser={currentUser!}
                    users={displayUsers}
                    matchRequests={matchRequests}
                    onSendRequest={handleSendRequest}
                    onBlockUser={handleBlockUser}
                    onReportUser={handleReportUser}
                    hostels={hostels}
                    onCancelRequest={handleCancelRequest}
                    onAcceptRequest={handleAcceptRequest}
                    onDeclineRequest={handleDeclineRequest}
                  />
                }
              />
              <Route
                path="/chats"
                element={
                  <ChatModule
                    currentUser={currentUser!}
                    users={displayUsers}
                    matchRequests={matchRequests}
                    onBlockUser={handleBlockUser}
                    onMessagesRead={fetchUnreadCount}
                    onUnfriend={handleUnfriend}
                    onReportUser={handleReportUser}
                  />
                }
              />
              <Route
                path="/profile"
                element={
                  currentUser?.role === 'student' ? (
                    <StudentProfile
                      currentUser={currentUser as Student}
                      onSave={handleSaveProfile}
                      hostels={hostels}
                      users={studentRoommates}
                      onUnblockUser={handleUnblockUser}
                    />
                  ) : currentUser?.role === 'owner' ? (
                    <OwnerProfile currentUser={currentUser as Owner} />
                  ) : (
                    <AdminProfile currentUser={currentUser as Admin} />
                  )
                }
              />
              <Route
                path="/admin"
                element={
                  currentUser?.role === 'admin' ? (
                    <AdminPanel
                      users={adminUsers}
                      reports={reports}
                      hostels={hostels}
                      onToggleUserStatus={handleToggleUserStatus}
                      onResolveReport={handleResolveReport}
                      onDeleteUser={handleDeleteUser}
                      onVerifyHostel={handleVerifyHostel}
                      onWarnUser={handleWarnUser}
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
      {loadingData && <SpinnerLoader />}
    </>
  );
}
