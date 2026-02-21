import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import NotificationToast from './components/NotificationToast';
import LoadingSpinner from './components/LoadingSpinner';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HalaqahListPage from './pages/HalaqahListPage';
import HalaqahDetailPage from './pages/HalaqahDetailPage';
import CreateHalaqahPage from './pages/CreateHalaqahPage';
import SessionsPage from './pages/SessionsPage';
import SessionDetailPage from './pages/SessionDetailPage';
import ProgressPage from './pages/ProgressPage';
import ChatPage from './pages/ChatPage';
import ParentDashboardPage from './pages/ParentDashboardPage';
import ParentChildProgressPage from './pages/ParentChildProgressPage';
import TeacherStudentsPage from './pages/TeacherStudentsPage';
import TeacherStudentDetailPage from './pages/TeacherStudentDetailPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import RewardsPage from './pages/RewardsPage';
import ChallengesPage from './pages/ChallengesPage';
import AssignmentsPage from './pages/AssignmentsPage';
import LandingPage from './pages/LandingPage';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Navbar />
      <NotificationToast />
      <main className="flex-1">
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
        <Route path="/" element={user ? <DashboardPage /> : <LandingPage />} />
        <Route path="/halaqahs" element={<ProtectedRoute><HalaqahListPage /></ProtectedRoute>} />
        <Route path="/halaqahs/new" element={<ProtectedRoute roles={['teacher']}><CreateHalaqahPage /></ProtectedRoute>} />
        <Route path="/halaqahs/:id" element={<ProtectedRoute><HalaqahDetailPage /></ProtectedRoute>} />
        <Route path="/halaqahs/:halaqahId/sessions" element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
        <Route path="/halaqahs/:halaqahId/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/sessions/:id" element={<ProtectedRoute><SessionDetailPage /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
        <Route path="/parent" element={<ProtectedRoute roles={['parent']}><ParentDashboardPage /></ProtectedRoute>} />
        <Route path="/parent/child/:studentId" element={<ProtectedRoute roles={['parent']}><ParentChildProgressPage /></ProtectedRoute>} />
        <Route path="/teacher/students" element={<ProtectedRoute roles={['teacher']}><TeacherStudentsPage /></ProtectedRoute>} />
        <Route path="/teacher/students/:studentId" element={<ProtectedRoute roles={['teacher']}><TeacherStudentDetailPage /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
        <Route path="/rewards" element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} />
        <Route path="/challenges" element={<ProtectedRoute roles={['student']}><ChallengesPage /></ProtectedRoute>} />
        <Route path="/assignments" element={<ProtectedRoute roles={['teacher', 'student']}><AssignmentsPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans flex flex-col transition-colors duration-200">
          <AppRoutes />
        </div>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
