import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProfilePage from "./pages/ProfilePage";
import JavaCompilerPage from "./pages/JavaCompilerPage";
import AIPage from "./pages/AIPage";
import Login from "./pages/Login";
import SignupPage from "./pages/SignupPage";
import LogsPage from "./pages/LogsPage";
import UsersPage from "./pages/UsersPage";
import UserWorkPage from "./pages/UserWorkPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminChatPage from "./pages/AdminChatPage";
import PendingUsersPage from "./pages/PendingUsersPage";

import UserProtectedRoute from "./components/UserProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import ChatWidget from "./components/ChatWidget";
import AIAssistantWidget from "./components/AIAssistantWidget";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

export default function App() {
  const { role, user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/logs"
          element={
            <UserProtectedRoute>
              <LogsPage />
            </UserProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <UserProtectedRoute>
              <UsersPage />
            </UserProtectedRoute>
          }
        />

        <Route
          path="/user/:id"
          element={
            <UserProtectedRoute>
              <UserWorkPage />
            </UserProtectedRoute>
          }
        />

        <Route
          path="/ai"
          element={
            <UserProtectedRoute>
              <AIPage />
            </UserProtectedRoute>
          }
        />

        <Route
          path="/compiler"
          element={
            <UserProtectedRoute>
              <JavaCompilerPage />
            </UserProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/pending"
          element={
            <AdminProtectedRoute>
              <PendingUsersPage />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/chat"
          element={
            <AdminProtectedRoute>
              <AdminChatPage />
            </AdminProtectedRoute>
          }
        />
                  <Route path="/profile" element={<ProfilePage />} />

      </Routes>
      {role === "USER" && user?.email && (
        <>
          <ChatWidget userEmail={user.email} />
          <AIAssistantWidget />
        </>
      )}
    </BrowserRouter>
  );
}
