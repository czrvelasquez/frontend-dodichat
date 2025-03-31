import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // ✅ IMPORTACIÓN CORRECTA

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Error en el login");

      const data = await res.json();
      const token = data.token;

      const payload = jwtDecode(token); // ✅ DECODIFICACIÓN SEGURA

      if (!payload.isAdmin) {
        alert('No tienes permisos de administrador');
        return;
      }

      localStorage.setItem('token', token);
      navigate('/admin/panel');
    } catch (err) {
      console.error("Error en login de admin:", err);
      alert('Error al iniciar sesión como admin');
    }
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Login de Administrador</h2>
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /><br /><br />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br /><br />
      <button onClick={handleAdminLogin}>Iniciar sesión</button>
    </div>
  );
};

export default AdminLoginPage;
