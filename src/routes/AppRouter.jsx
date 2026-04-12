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
import AdminLayout from '../layouts/AdminLayout'
import AdminOverviewPage from '../pages/admin/AdminOverviewPage'
import AdminSystemPage from '../pages/admin/AdminSystemPage'
import AdminUsersPage from '../pages/admin/AdminUsersPage'
import AdminRoomsPage from '../pages/admin/AdminRoomsPage'
import AdminModerationPage from '../pages/admin/AdminModerationPage'
import AdminFilesPage from '../pages/admin/AdminFilesPage'
import AdminAnalyticsPage from '../pages/admin/AdminAnalyticsPage'
import AdminLogsPage from '../pages/admin/AdminLogsPage'
import AdminRolesPage from '../pages/admin/AdminRolesPage'
import AdminSettingsPage from '../pages/admin/AdminSettingsPage'
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
          <Route path="rooms/room_general" element={<Navigate to="/app/rooms/room_design" replace />} />
          <Route path="rooms/room_general/whiteboard" element={<Navigate to="/app/rooms/room_design/whiteboard" replace />} />
          <Route path="rooms/:roomId" element={<ChatPage />} />
          <Route path="rooms/:roomId/whiteboard" element={<WhiteboardPage />} />
          <Route path="files" element={<FilesPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route
            path="app/admin"
            element={(
              <RoleGate roles={['admin', 'moderator']}>
                <AdminLayout />
              </RoleGate>
            )}
          >
            <Route index element={<AdminOverviewPage />} />
            <Route path="system" element={<AdminSystemPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="rooms" element={<AdminRoomsPage />} />
            <Route path="moderation" element={<AdminModerationPage />} />
            <Route path="files" element={<AdminFilesPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="logs" element={<AdminLogsPage />} />
            <Route path="roles" element={<AdminRolesPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
