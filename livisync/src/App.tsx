import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import type { User, Hostel, Report } from './types';
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
  toggleUserStatus,
  deleteUser,
  updateUserInList,
} from './store/slices/roommateSlice';
import {
  fetchMatches,
  sendRequest,
  acceptRequest,
  declineRequest,
  removeMatchesForUser,
} from './store/slices/matchSlice';
import {
  fetchReports,
  resolveReport,
  addLocalReport,
} from './store/slices/adminSlice';

export default function App() {
  const dispatch = useAppDispatch();

  // Select states from Redux store
  const { token, currentUser, loadingData: authLoading } = useAppSelector((state) => state.auth);
  const { hostels, loading: hostelsLoading } = useAppSelector((state) => state.hostels);
  const { users, loading: usersLoading } = useAppSelector((state) => state.roommates);
  const { matchRequests, loading: matchesLoading } = useAppSelector((state) => state.matches);
  const { reports, loading: adminLoading } = useAppSelector((state) => state.admin);

  const loadingData = authLoading || hostelsLoading || usersLoading || matchesLoading || adminLoading;

  // Sync active user session
  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser(token));
    }
  }, [token, dispatch]);

  // Fetch relevant directory data once authenticated
  useEffect(() => {
    if (token && currentUser) {
      const role = currentUser.role;
      dispatch(fetchHostels({ token, role }));
      dispatch(fetchRoommates({ token, role }));
      dispatch(fetchMatches({ token, role }));

      if (role === 'admin') {
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
      const result = await dispatch(updateProfile({ updatedUser, token })).unwrap();
      dispatch(updateUserInList(result));
    } catch (err: any) {
      alert(err || 'Error occurred saving profile.');
    }
  };


  // Handler: Send Match Request
  const handleSendRequest = (receiverId: string, message: string) => {
    if (!currentUser) return;
    dispatch(sendRequest({ receiverId, message, senderId: currentUser.id }));
  };

  // Handler: Accept Request
  const handleAcceptRequest = (reqId: string) => {
    dispatch(acceptRequest(reqId));
  };

  // Handler: Decline Request
  const handleDeclineRequest = (reqId: string) => {
    dispatch(declineRequest(reqId));
  };

  // Handler: Block User
  const handleBlockUser = (targetId: string) => {
    if (!currentUser) return;
    const updatedBlocked = currentUser.blockedUsers.includes(targetId)
      ? currentUser.blockedUsers
      : [...currentUser.blockedUsers, targetId];

    dispatch(setBlockedUsers(updatedBlocked));
    const updatedUser = { ...currentUser, blockedUsers: updatedBlocked };
    dispatch(updateUserInList(updatedUser));
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

    dispatch(addLocalReport(newReport));
    alert('Thank you. The report has been filed and sent to administrators for review.');
  };

  // Handler Admin: Toggle User Status (Suspend/Activate)
  const handleToggleUserStatus = async (userId: string) => {
    if (!token) return;
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    try {
      await dispatch(toggleUserStatus({ userId, token, currentStatus: user.status })).unwrap();
    } catch (err: any) {
      alert(err || 'Error occurred updating status.');
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
    try {
      await dispatch(deleteUser({ userId, token })).unwrap();
      dispatch(removeMatchesForUser(userId));
      alert('User deleted successfully.');
    } catch (err: any) {
      alert(err || 'Error deleting user.');
    }
  };

  const handleAddHostel = (newHostel: Hostel) => {
    dispatch(addHostel(newHostel));
  };

  const handleEditHostel = (updatedHostel: Hostel) => {
    dispatch(editHostel(updatedHostel));
  };

  const handleDeleteHostel = (hostelId: string) => {
    dispatch(deleteHostel(hostelId));
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

  if (token && !currentUser) {
    return <SpinnerLoader />;
  }

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
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/hostels" replace />} />
              <Route
                path="/hostels"
                element={
                  <HostelDirectory
                    hostels={hostels}
                    users={users}
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
                    users={users}
                    matchRequests={matchRequests}
                    onSendRequest={handleSendRequest}
                    onBlockUser={handleBlockUser}
                    onReportUser={handleReportUser}
                    hostels={hostels}
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
                  <ProfileSettings currentUser={currentUser!} onSave={handleSaveProfile} hostels={hostels} />
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
      {loadingData && <SpinnerLoader />}
    </>
  );
}
