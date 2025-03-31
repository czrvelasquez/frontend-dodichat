import React from 'react';
import { Link } from 'react-router-dom';
import WhatsAppSupportButton from '../WhatsAppSupportButton';
import './MaterialesPage.css';

const MaterialesPage = () => (
  <div className="materiales-container">
    <div className="materiales-card">
      <h2>Banco de Materiales Didácticos</h2>
      <p className="materiales-subtext">🌟 Próximamente disponible 🌟</p>
      <p className="materiales-info">Estamos preparando una colección de recursos, videos y materiales exclusivos para docentes. ¡Espéralo muy pronto!</p>

      <div className="materiales-actions">
        <Link to="/chat">
          <button className="nav-button">Ir al Chat</button>
        </Link>
        <Link to="/planeaciones">
          <button className="nav-button outline">Ir a Banco de Planeaciones</button>
        </Link>
      </div>
    </div>

    {localStorage.getItem("isPremium") === "true" && <WhatsAppSupportButton />}
  </div>
);

export default MaterialesPage;
