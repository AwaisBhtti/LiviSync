import { useEffect } from 'react';
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
  sendRequest,
  acceptRequest,
  declineRequest,
  removeMatchesForUser,
} from './store/slices/matchSlice';
import {
  fetchReports,
  resolveReport,
  addLocalReport,
  fetchUsers,
  toggleUserStatus,
  deleteUser,
} from './store/slices/adminSlice';

export default function App() {
  const dispatch = useAppDispatch();

  // Select states from Redux store
  const { token, currentUser, loadingData: authLoading } = useAppSelector((state) => state.auth);
  const { hostels, loading: hostelsLoading } = useAppSelector((state) => state.hostels);
  const { users: studentRoommates, loading: usersLoading } = useAppSelector((state) => state.roommates);
  const { matchRequests, loading: matchesLoading } = useAppSelector((state) => state.matches);
  const { users: adminUsers, reports, loading: adminLoading } = useAppSelector((state) => state.admin);

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

      if (role === 'student') {
        dispatch(fetchRoommates(token));
        dispatch(fetchMatches({ token, role }));
      } else if (role === 'admin') {
        dispatch(fetchUsers(token));
        dispatch(fetchReports(token));
        dispatch(fetchMatches({ token, role }));
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
    if (!currentUser || currentUser.role !== 'student') return;
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
      created_at: new Date().toISOString(),
    };

    dispatch(addLocalReport(newReport));
    alert('Thank you. The report has been filed and sent to administrators for review.');
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
      alert(err || 'Error adding hostel listing.');
    }
  };

  const handleEditHostel = async (updatedHostel: Hostel) => {
    if (!token) return;
    try {
      await dispatch(editHostel({ updatedHostel, token })).unwrap();
      alert('Hostel listing updated successfully!');
    } catch (err: any) {
      alert(err || 'Error updating hostel listing.');
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
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/hostels" replace />} />
              <Route
                path="/hostels"
                element={
                  <HostelDirectory
                    hostels={hostels}
                    users={displayUsers}
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
                    onAcceptRequest={handleAcceptRequest}
                    onDeclineRequest={handleDeclineRequest}
                    onBlockUser={handleBlockUser}
                  />
                }
              />
              <Route
                path="/profile"
                element={
                  currentUser?.role === 'student' ? (
                    <StudentProfile currentUser={currentUser as Student} onSave={handleSaveProfile} hostels={hostels} />
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
