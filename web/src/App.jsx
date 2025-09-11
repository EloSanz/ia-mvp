import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ApiProvider } from './contexts/ApiContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import DeckPage from './pages/DeckPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export default function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <AuthProvider>
        <ApiProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/decks/:deckId"
                element={
                  <ProtectedRoute>
                    <DeckPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </ApiProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
