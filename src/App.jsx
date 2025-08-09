import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import SheetPage from './pages/SheetPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';

function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/"
                element={<ProtectedRoute><HomePage /></ProtectedRoute>}
              />
              <Route
                path="/sheet/:id"
                element={<ProtectedRoute><SheetPage /></ProtectedRoute>}
              />
            </Routes>
          </MainLayout>
        </Router>
      </ThemeProvider>
    </UserProvider>
  );
}

export default App;

