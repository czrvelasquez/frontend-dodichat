import React from 'react';
import { Link } from 'react-router-dom';
import './homePage.css';

const HomePage = () => {
  return (
    <div className="homepage-container">
      <div className="homepage-content">
        <h1 className="homepage-title">Bienvenido a <span>DocencIA Digital</span></h1>
        <p className="homepage-subtitle">Genera planeaciones, accede a materiales y potencia tu práctica docente.</p>

        <div className="homepage-video">
        <iframe width="560" height="315" src="https://www.youtube.com/embed/6XZW5Hw2fOI?si=qCp6NRdEFczpGF_S" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>

        <div className="homepage-buttons">
          <Link to="/chat">
            <button className="homepage-button">Ir al Chat de Planeación</button>
          </Link>
          <a
            href="https://tienda.docenciadigital.com"
            target="_blank"
            rel="noopener noreferrer"
            className="homepage-button outline"
          >
            Visitar la Tienda
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
