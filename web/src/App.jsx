import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ApiProvider } from './contexts/ApiContext';
import { ThemeProvider } from './contexts/ThemeContext';
import HomePage from './pages/HomePage';
import DeckPage from './pages/DeckPage';

export default function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <ApiProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/decks/:deckId" element={<DeckPage />} />
          </Routes>
        </Router>
      </ApiProvider>
    </ThemeProvider>
  );
}
