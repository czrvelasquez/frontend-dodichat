import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    // ✅ Validamos el token antes de hacer fetch
    if (!token) {
      alert("No tienes sesión activa");
      navigate('/admin/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.isAdmin) {
        alert("No tienes permisos de administrador");
        navigate('/');
        return;
      }
    } catch (err) {
      console.error("Token inválido:", err);
      navigate('/admin/login');
      return;
    }

    // ✅ Si todo bien, cargamos los usuarios
    fetch("https://backend-dodichat.onrender.com/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          console.log("Respuesta de backend:", data); // 👈 Aquí ves qué llega del backend
      
          if (!Array.isArray(data)) {
            alert("La respuesta del servidor no es un array");
            console.error("Contenido recibido:", data);
            return;
          }
      
          setUsuarios(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error al cargar usuarios:", err);
          setLoading(false);
        });
  }, [navigate, token]);

  const togglePremium = async (userId, currentStatus) => {
    const nuevoEstado = !currentStatus;
    try {
      const response = await fetch(`https://backend-dodichat.onrender.com/api/admin/update-premium/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isPremium: nuevoEstado })
      });

      if (!response.ok) throw new Error("Error al actualizar el usuario.");

      setUsuarios(usuarios.map(u =>
        u._id === userId ? { ...u, isPremium: nuevoEstado } : u
      ));
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el usuario.");
    }
  };

  if (loading) return <p>Cargando usuarios...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Panel de Administración</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Estado</th>
            <th>Premium</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.estado}</td>
              <td>{user.isPremium ? 'Sí' : 'No'}</td>
              <td>
                <button onClick={() => togglePremium(user._id, user.isPremium)}>
                  {user.isPremium ? 'Quitar Premium' : 'Hacer Premium'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
