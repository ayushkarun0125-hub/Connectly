import { Navigate, Route, Routes } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import AppLayout from '../layouts/AppLayout'
import ProtectedRoute from './ProtectedRoute'
import RoleGate from './RoleGate'
import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import SignupPage from '../pages/SignupPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import ResetPasswordPage from '../pages/ResetPasswordPage'
import DashboardPage from '../pages/DashboardPage'
import ChatPage from '../pages/ChatPage'
import JoinRoomPage from '../pages/JoinRoomPage'
import WhiteboardPage from '../pages/WhiteboardPage'
import FilesPage from '../pages/FilesPage'
import ProfilePage from '../pages/ProfilePage'
import SettingsPage from '../pages/SettingsPage'
import AdminPage from '../pages/AdminPage'
import NotesPage from '../pages/NotesPage'
import LoginPreviewPage from '../pages/LoginPreviewPage'
import RoomDirectoryPage from '../pages/RoomDirectoryPage'
import TeamPage from '../pages/TeamPage'
import RequireProfileComplete from './RequireProfileComplete'
import ProfileSetupPage from '../pages/ProfileSetupPage'

function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/login-preview" element={<LoginPreviewPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/app/profile/setup" element={<ProfileSetupPage />} />
        <Route element={<RequireProfileComplete />}>
          <Route path="/app" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="room-directory" element={<RoomDirectoryPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="rooms/join" element={<JoinRoomPage />} />
          <Route path="rooms/:roomId" element={<ChatPage />} />
          <Route path="rooms/:roomId/whiteboard" element={<WhiteboardPage />} />
          <Route path="files" element={<FilesPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route
            path="admin"
            element={(
              <RoleGate roles={['admin', 'moderator']}>
                <AdminPage />
              </RoleGate>
            )}
          />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
