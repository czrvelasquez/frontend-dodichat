import React from 'react';

function PaymentOptions({ onClose }) {
  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h2>¿Cómo continuar?</h2>
      
      <p>Ya has usado tus dos planeaciones gratuitas. Mira este video donde te explicamos cómo puedes seguir usando la plataforma.</p>
      
      <div style={{ maxWidth: '100%', marginBottom: 20 }}>
        <iframe
          width="100%"
          height="315"
          src="https://www.youtube.com/embed/Nv6yPKdugCc?si=8NG9rmdJHXvcI-0w"
          title="Video explicativo"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      <button onClick={onClose} className="send-button">
        Volver al chat
      </button>
    </div>
  );
}

export default PaymentOptions;
