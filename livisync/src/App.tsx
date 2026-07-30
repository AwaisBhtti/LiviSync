import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { Student, Owner, Admin } from './types';
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
  updateProfile,
} from './store/slices/authSlice';
import { fetchHostels } from './store/slices/hostelSlice';
import { fetchRoommates, updateUserInList } from './store/slices/roommateSlice';
import { fetchMatches } from './store/slices/matchSlice';
import { fetchReports, fetchUsers } from './store/slices/adminSlice';
import { showToast, hideToast } from './store/slices/toastSlice';
import { supabase } from './supabase';
import { API_BASE_URL } from './config';
import { AppLayout } from './components/layout/AppLayout';
import { SpinnerLoader } from './components/layout/SpinnerLoader';

// Logic hooks
import { useMatchRequests } from './hooks/useMatchRequests';
import { useUserActions } from './hooks/useUserActions';
import { useHostelActions } from './hooks/useHostelActions';
import { useAdminActions } from './hooks/useAdminActions';

export default function App() {
  const dispatch = useAppDispatch();

  // Select states from Redux store
  const { token, currentUser, loadingData: authLoading } = useAppSelector((state) => state.auth);
  const { hostels, loading: hostelsLoading } = useAppSelector((state) => state.hostels);
  const { users: studentRoommates, loading: usersLoading } = useAppSelector((state) => state.roommates);
  const { matchRequests, loading: matchesLoading } = useAppSelector((state) => state.matches);
  const { users: adminUsers, reports, loading: adminLoading } = useAppSelector((state) => state.admin);

  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const { show: toastShow, message: toastMessage, type: toastType } = useAppSelector((state) => state.toast);

  useEffect(() => {
    if (toastShow) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastShow, dispatch]);

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
  const handleSaveProfile = async (updatedUser: any) => {
    if (!token) return;
    try {
      const result = await dispatch(updateProfile({ updatedUser: updatedUser as Student, token })).unwrap();
      dispatch(updateUserInList(result));
      dispatch(showToast({ message: 'Profile saved successfully!', type: 'success' }));
    } catch (err: any) {
      dispatch(showToast({ message: err || 'Error occurred saving profile.', type: 'error' }));
    }
  };

  // Call business logic hooks
  const {
    handleSendRequest,
    handleAcceptRequest,
    handleDeclineRequest,
    handleCancelRequest,
    handleUnfriend,
  } = useMatchRequests();

  const { handleBlockUser, handleUnblockUser, handleReportUser } = useUserActions();
  const { handleAddHostel, handleEditHostel, handleDeleteHostel, handleVerifyHostel } = useHostelActions();
  const { handleToggleUserStatus, handleWarnUser, handleResolveReport, handleDeleteUser } = useAdminActions();

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
            <Route
              element={
                <AppLayout
                  currentUser={currentUser!}
                  onLogout={handleLogout}
                  unreadMessagesCount={unreadMessagesCount}
                  pendingRequestsCount={
                    currentUser && currentUser.role === 'student'
                      ? matchRequests.filter(
                          (r) => r.receiverId === currentUser.id && r.status === 'pending'
                        ).length
                      : 0
                  }
                />
              }
            >
              <Route path="/" element={<Navigate to="/hostels" replace />} />
              <Route
                path="/hostels"
                element={
                  <HostelDirectory
                    hostels={hostels}
                    currentUser={currentUser!}
                    token={token!}
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
      {toastShow && (
        <div style={toastContainerStyle(toastType)}>
          <style>{`
            @keyframes toastSlideIn {
              from { transform: translateY(1.5rem) scale(0.95); opacity: 0; }
              to { transform: translateY(0) scale(1); opacity: 1; }
            }
          `}</style>
          <span>{toastMessage}</span>
          <button
            onClick={() => dispatch(hideToast())}
            style={toastCloseStyle}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}

// Toast Styles
const toastContainerStyle = (type: 'success' | 'error' | 'info'): React.CSSProperties => {
  const borderCol = type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary)';
  return {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(16px)',
    borderLeft: `4px solid ${borderCol}`,
    padding: '1rem 1.5rem',
    borderRadius: 'var(--radius-sm, 8px)',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1.5rem',
    zIndex: 9999999,
    color: 'var(--foreground)',
    fontSize: '0.875rem',
    fontWeight: 600,
    animation: 'toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    border: '1px solid var(--border)',
  };
};

const toastCloseStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--muted)',
  fontSize: '0.85rem',
  padding: '0.25rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
