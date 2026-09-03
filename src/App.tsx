import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { CaseListPage } from './pages/CaseListPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { api } from './api';
import type { User, UserRole } from './api/types';
import { mockUsers } from './api/mockClient';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('auth_token');
  if (!api.isMock && !token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('auth_token');
  if (!api.isMock && token) {
    return <Navigate to="/cases" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers.officer);

  useEffect(() => {
    api.getCurrentUser().then(setCurrentUser).catch(() => {
      setCurrentUser(mockUsers.officer);
    });
  }, []);

  const handleLogin = (role: UserRole, _name: string) => {
    api.getCurrentUser(role).then(setCurrentUser).catch(() => {
      setCurrentUser(mockUsers[role] || mockUsers.officer);
    });
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage onLogin={handleLogin} />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/cases"
          element={
            <ProtectedRoute>
              <CaseListPage user={currentUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/case/:id"
          element={
            <ProtectedRoute>
              <CaseDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/cases" replace />} />
      </Routes>
    </BrowserRouter>
  );
}