import '../styles/home.css';
import { ArrowRight, FileText, Sparkles, Zap } from 'lucide-react';
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
              Comenzar Gratis <ArrowRight />
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
          <div className="feature-icon yellow">
            <Sparkles color="white" size={35} />
          </div>

          <h3>Generación Automática</h3>

          <p>
            Ingresa tu texto o sube un archivo y observa cómo se crean
            diapositivas profesionales automáticamente.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon green">
            <Zap color="white" size={35} />
          </div>

          <h3>Rápido y Eficiente</h3>

          <p>
            Ahorra horas de trabajo. Lo que tomaría días ahora se hace en
            minutos con nuestra tecnología.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon gradient">
            <FileText color="white" size={35} />
          </div>

          <h3>Compatibilidad Total</h3>

          <p>
            Modifica tus presentaciones directamente en la aplicacion o
            exportalos a tus formatos preferidos.
          </p>
        </div>
      </section>
    </div>
  );
}
