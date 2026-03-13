import '../styles/home.css';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="home-container">
      <Navbar />
      {/* Hero */}
      <section className="hero">
        <div className="hero-overlay" />

        <div className="hero-content">
          <h1>
            Crea Presentaciones Profesionales
            <br />
            en Segundos
          </h1>

          <p className="hero-subtitle">
            Transforma tus textos o PDFs en presentaciones visualmente
            atractivas
            <br />
            <span>con el poder de la inteligencia artificial</span>
          </p>

          <div className="hero-buttons">
            <button
              type="button"
              className="primary-btn"
              onClick={() => navigate('/dashboard')}
            >
              Comenzar Gratis →
            </button>

            <button type="button" className="secondary-btn">
              Registrarse
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="feature-card">
          <div className="feature-icon yellow">🧠</div>

          <h3>Generación Automática</h3>

          <p>
            Ingresa tu texto o sube un archivo y observa cómo se crean
            diapositivas profesionales automáticamente.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon green">⚡</div>

          <h3>Rápido y Eficiente</h3>

          <p>
            Ahorra horas de trabajo. Lo que tomaría días ahora se hace en
            minutos con nuestra tecnología.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon gradient">📄</div>

          <h3>Compatibilidad Total</h3>

          <p>
            Sube archivos de texto, PDF o escribe directamente. Soportamos todos
            los formatos populares.
          </p>
        </div>
      </section>
    </div>
  );
}
