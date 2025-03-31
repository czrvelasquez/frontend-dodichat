// src/components/BackgroundParticles.jsx
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const BackgroundParticles = () => {
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: -1 }, // que esté en el fondo
        background: { color: "#0b132b" },
        particles: {
          number: { value: 50 },
          color: { value: "#5bc0be" },
          links: { enable: true, color: "#3a506b", distance: 120 },
          move: { enable: true, speed: 0.8 },
          size: { value: 2 },
        },
      }}
    />
  );
};

export default BackgroundParticles;
