import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ApiProvider } from './contexts/ApiContext';
import { ThemeProvider, ThemeContext } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import DeckPage from './pages/DeckPage';
import StudyPage from './pages/StudyPage';
import StudySessionPage from './pages/StudySessionPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export default function App() {
  // Use theme context to get themeName and customBackground
  // We need to use a consumer because ThemeProvider is above
  return (
    <ThemeProvider>
      <CssBaseline />
      <AuthProvider>
        <ApiProvider>
          <ThemeContext.Consumer>
            {({ themeName, themes }) => (
              <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
                {themeName === 'kyoto' && themes.kyoto.customBackground?.image && (
                  <div
                    style={{
                      width: '100vw',
                      height: '100vh',
                      background: `url(${themes.kyoto.customBackground.image}) center center / cover no-repeat`,
                      filter: `blur(${themes.kyoto.customBackground.blur}px) brightness(${themes.kyoto.customBackground.brightness})`,
                      opacity: themes.kyoto.customBackground.opacity,
                      position: 'fixed',
                      inset: 0,
                      zIndex: -1
                    }}
                  />
                )}
              </div>
            )}
          </ThemeContext.Consumer>
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
              <Route
                path="/study"
                element={
                  <ProtectedRoute>
                    <StudyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/study/session/:deckId"
                element={
                  <ProtectedRoute>
                    <StudySessionPage />
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
