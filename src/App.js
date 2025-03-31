import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// importa tus componentes según tu estructura
import HomePage from './pages/homePage';
import DodiChatbot from './DodiChatbot';
import PlaneacionesPage from './pages/planeacionesPage';
import MaterialesPage from './pages/materialesPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import BackgroundParticles from './BackgroundParticles';

function App() {
  const [isPremium, setIsPremium] = useState(false);

  // ✅ Parte 1: Restaurar sesión si hay token
  useEffect(() => {
    const token = localStorage.getItem('token');
    const premium = localStorage.getItem('isPremium') === 'true';
    if (token && premium) {
      setIsPremium(true);
    }
  }, []);

  // ✅ Parte 2: Cerrar sesión tras 30 min de inactividad
  useEffect(() => {
    let timeout;

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('isPremium');
      setIsPremium(false);
      alert("Tu sesión ha expirado por inactividad.");
      window.location.href = '/';
    };

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(logout, 30 * 60 * 1000); // 30 minutos
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <Router>      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<DodiChatbot />} />
        <Route path="/planeaciones" element={<PlaneacionesPage />} />
        <Route path="/materiales" element={<MaterialesPage />} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/panel" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
