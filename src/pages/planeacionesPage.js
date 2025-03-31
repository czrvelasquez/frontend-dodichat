import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Planeacionespage.css';

const PlaneacionesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialView = searchParams.get('view') || 'all';
  const [viewMode, setViewMode] = useState(initialView);

  const [planeaciones, setPlaneaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membershipLevel, setMembershipLevel] = useState('free');
  const [filtroGrado, setFiltroGrado] = useState('');
  const [filtroCampo, setFiltroCampo] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setMembershipLevel(decoded.membershipLevel || 'free');
      } catch (err) {
        console.error("Token inválido:", err);
      }
    }
  }, [token]);

  const cargarPlaneaciones = () => {
    if (membershipLevel === 'free') return;

    const queryParams = new URLSearchParams();
    if (filtroGrado) queryParams.append('gradoEscolar', filtroGrado);
    if (filtroCampo) queryParams.append('campoFormativo', filtroCampo);

    if (membershipLevel === 'plus' || viewMode === 'mine') {
      const userId = localStorage.getItem('userId');
      if (userId) queryParams.append('userId', userId);
    }

    setLoading(true);
    fetch(`https://backend-dodichat.onrender.com/api/planeaciones?${queryParams.toString()}`)
      .then(res => res.json())
      .then(data => {
        setPlaneaciones(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al cargar planeaciones:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    cargarPlaneaciones();
  }, [membershipLevel, filtroGrado, filtroCampo, viewMode]);

  const descargarPlano = async (id, tipo) => {
    try {
      const endpoint =
        tipo === 'pdf'
          ? `https://backend-dodichat.onrender.com/api/generate-pdf-from-db/${id}`
          : `https://backend-dodichat.onrender.com/api/generate-docx-from-db/${id}`;

      const response = await fetch(endpoint, { method: 'POST' });
      if (!response.ok) {
        alert("Error al descargar el archivo");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Planeacion_y_Evaluacion.${tipo}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar:", error);
      alert("Hubo un problema al descargar el archivo.");
    }
  };

  const obtenerPortada = (campoFormativo) => {
    if (campoFormativo?.toLowerCase().includes("lenguaje")) {
      return "https://iili.io/3A7GVIe.png";
    } else if (campoFormativo?.toLowerCase().includes("científico")) {
      return "https://iili.io/3A7GGp9.md.png";
    } else if (campoFormativo?.toLowerCase().includes("ética")) {
      return "https://iili.io/3A7GWhu.md.png";
    } else if (campoFormativo?.toLowerCase().includes("comunitario")) {
      return "https://i.pinimg.com/736x/8d/77/24/8d77247dbdca14ebe75883acfc681b92.jpg";
    }
    return "https://i.ibb.co/vL7vsyR/dodi.png";
  };

  return (
    <div className="page-container">
      {(membershipLevel === 'premium' || membershipLevel === 'plus') ? (
        <>
          {membershipLevel === 'premium' ? (
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setViewMode('all');
                  searchParams.set('view', 'all');
                  setSearchParams(searchParams);
                }}
                className={`nav-button ${viewMode === 'all' ? 'active' : ''}`}
              >
                Ver todas las planeaciones
              </button>
              <button
                onClick={() => {
                  setViewMode('mine');
                  searchParams.set('view', 'mine');
                  setSearchParams(searchParams);
                }}
                className={`nav-button ${viewMode === 'mine' ? 'active' : ''}`}
                style={{ marginLeft: '10px' }}
              >
                Ver solo mis planeaciones
              </button>
            </div>
          ) : (
            <div className="ad-banner">
              <p>Accede a decenas de planeaciones creadas por maestros de todo México</p>
              <div className="hover-info">
                <p>
                  Paga la diferencia de las membresías para acceder a nuestro banco completo,
                  materiales exclusivos, grabaciones de cursos y talleres.
                </p>
                <a
                  href="https://wa.me/525583882951"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-button"
                >
                  Soporte vía WhatsApp
                </a>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <button className="nav-button" onClick={() => navigate('/chat')}>
              Regresar al Chat
            </button>
            <button className="nav-button" onClick={() => navigate('/materiales')}>
              Ir al Banco de Materiales Didácticos
            </button>
          </div>

          <h2>Banco de Planeaciones Generadas</h2>

          {/* Filtros */}
          <div className="filtros-container">
            <select value={filtroGrado} onChange={e => setFiltroGrado(e.target.value)}>
              <option value="">Todos los grados</option>
              {["1 preescolar", "2 preescolar", "3 preescolar",
                "1 primaria", "2 primaria", "3 primaria", "4 primaria", "5 primaria", "6 primaria",
                "1 secundaria", "2 secundaria", "3 secundaria"].map(grado => (
                <option key={grado} value={grado}>{grado}</option>
              ))}
            </select>

            <select value={filtroCampo} onChange={e => setFiltroCampo(e.target.value)}>
              <option value="">Todos los campos formativos</option>
              <option value="Lenguaje">Lenguaje</option>
              <option value="Saberes y pensamiento científico">Saberes y pensamiento científico</option>
              <option value="Ética, naturaleza y sociedades">Ética, naturaleza y sociedades</option>
              <option value="De lo humano y lo comunitario">De lo humano y lo comunitario</option>
            </select>

            <button onClick={() => {
              setFiltroGrado('');
              setFiltroCampo('');
            }}>
              Limpiar filtros
            </button>
          </div>

          {loading ? (
            <p>Cargando planeaciones...</p>
          ) : planeaciones.length === 0 ? (
            <p>No hay planeaciones con estos filtros.</p>
          ) : (
            <div className="cards-container">
              {planeaciones.map((plan, idx) => (
                <div key={idx} className="card-planeacion">
                  <img src={obtenerPortada(plan.campoFormativo)} alt="Portada" />
                  <div className="card-content">
                    <h4>{plan.titulo || "Planeación sin título"}</h4>
                    <p><strong>Campo:</strong> {plan.campoFormativo || 'N/A'}</p>
                    <p><strong>Estrategia:</strong> {plan.estrategiaDidactica || 'N/A'}</p>
                    <p><strong>Grado:</strong> {plan.gradoEscolar || 'N/A'}</p>
                    <p><strong>Estado:</strong> {plan.estadoUsuario || 'N/A'}</p>
                    <p><strong>Autor:</strong> {plan.user?.name || "Anónimo"}</p>
                    <button className="nav-button" onClick={() => descargarPlano(plan._id, plan.fileType)}>
                      Descargar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <h2>Acceso restringido</h2>
          <p>Esta sección es exclusiva para usuarios con suscripción activa.</p>
          <div style={{ marginTop: '1rem' }}>
            <button className="nav-button" onClick={() => navigate('/chat')}>
              Volver al Chat
            </button>
            <button className="nav-button" onClick={() => navigate('/chat')}>
              Iniciar sesión / Registrarte
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaneacionesPage;
