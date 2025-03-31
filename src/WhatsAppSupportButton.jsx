// components/WhatsAppSupportButton.jsx
import React from 'react';
import './WhatsAppSupportButton.scss';

const WhatsAppSupportButton = () => {
  return (
    <div className="whatsapp-support">
      <a
        href="https://wa.me/525583882951"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-link"
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/733/733585.png"
          alt="WhatsApp"
          className="whatsapp-icon"
        />
        <span className="whatsapp-text">Soporte vía WhatsApp</span>
        <span className="tooltip">Si no puedes acceder manda el WhatsApp al (55) 8388 2951</span>
      </a>
    </div>
  );
};

export default WhatsAppSupportButton;