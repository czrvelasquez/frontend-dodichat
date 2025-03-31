import React from 'react';
import { Link } from 'react-router-dom';
import DodiChatbot from '../DodiChatbot';

const ChatPage = () => (
  <div>
    <DodiChatbot />
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <Link to="/planeaciones">
        <button className="nav-button" style={{ marginRight: '1rem' }}>Ir a Banco de Planeaciones</button>
      </Link>
      <Link to="/materiales">
        <button className="nav-button">Ir a Banco de Materiales</button>
      </Link>
    </div>
  </div>
);

export default ChatPage;
