import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { CaseListPage } from './pages/CaseListPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { api } from './api';
import type { User, UserRole } from './api/types';
import { mockUsers } from './api/mockClient';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!api.isTokenValid()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  if (api.isTokenValid()) {
    return <Navigate to="/cases" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers.officer);
  const [authVersion, setAuthVersion] = useState(0);

  useEffect(() => {
    const onUnauthorized = () => {
      setAuthVersion((v) => v + 1);
    };
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  useEffect(() => {
    if (api.isTokenValid()) {
      api.getCurrentUser().then(setCurrentUser).catch(() => {
        api.logout();
        setAuthVersion((v) => v + 1);
      });
    }
  }, [authVersion]);

  const handleLogin = (role: UserRole, _name: string) => {
    api.getCurrentUser(role).then((user) => {
      setCurrentUser(user);
      setAuthVersion((v) => v + 1);
    }).catch(() => {
      setCurrentUser(mockUsers[role] || mockUsers.officer);
      setAuthVersion((v) => v + 1);
    });
  };

  return (
    <BrowserRouter>
      <Routes key={authVersion}>
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