import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import mockPresentation from '../assets/presentation.json';
import Navbar from '../components/Navbar';
import { sendText, uploadPDF } from '../services/presentationService';
import '../styles/dashboard.css';
import ListOfPresentations from '../components/ListofPresentations';

export default function Dashboard() {
  const navigate = useNavigate();
  const MIN_SLIDES = 4;
  const MAX_SLIDES = 20;

  const [mode, setMode] = useState('pdf');
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [numberOfSlides, setNumberOfSlides] = useState(7);
  const [slidesInputValue, setSlidesInputValue] = useState('7');

  const clampSlides = (value) =>
    Math.min(MAX_SLIDES, Math.max(MIN_SLIDES, value));

  const syncSlidesValue = (value) => {
    const nextValue = clampSlides(value);
    setNumberOfSlides(nextValue);
    setSlidesInputValue(String(nextValue));
    return nextValue;
  };

  const commitSlidesInput = () => {
    if (slidesInputValue.trim() === '') {
      setSlidesInputValue(String(numberOfSlides));
      return numberOfSlides;
    }

    return syncSlidesValue(Number(slidesInputValue));
  };

  const currentSlidesValue =
    slidesInputValue.trim() === '' ? numberOfSlides : Number(slidesInputValue);

  const validateAndSet = (selected) => {
    if (!selected) return;
    if (selected.type !== 'application/pdf') {
      toast.error('Solo se permiten archivos PDF');
      return;
    }
    if (selected.size > 3 * 1024 * 1024) {
      toast.error('El archivo supera los 3MB');
      return;
    }
    setFile(selected);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    validateAndSet(e.dataTransfer.files[0]);
  };

  // Guardar presentación y navegar al preview
  const handleSuccess = (data) => {
    // Por ahora usamos el JSON local como mock
    const presentation = {
      id: data.presentationId,
      title: data?.title || mockPresentation.title,
      createdAt: new Date(data.createdAt).toLocaleDateString('es-CO'),
    };
    navigate(`/preview/${presentation.id}`);
  };

  const handlePDF = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Debes seleccionar un archivo PDF');
      return;
    }
    try {
      setLoading(true);
      const slidesToUse = commitSlidesInput();
      const data = await uploadPDF(file, slidesToUse);
      toast.success('PDF procesado correctamente');
      handleSuccess(data);
    } catch (err) {
      toast.error(
        err.response?.data?.error || err.message || 'Error al subir PDF',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleText = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error('Debes escribir un texto');
      return;
    }
    try {
      setLoading(true);
      const slidesToUse = commitSlidesInput();
      const data = await sendText(text, slidesToUse);
      toast.success('Texto procesado correctamente');
      handleSuccess(data);
    } catch (err) {
      toast.error(
        err.response?.data?.error || err.message || 'Error al enviar texto',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-background" />
      <div className="dashboard-overlay" />
      <Navbar />

      <div className="dashboard-content">
        {/* CARD CREAR */}
        <div className="dashboard-card">
          <h1>Crear nueva presentación</h1>
          <p>
            Ingresa el texto o sube un archivo para generar tu presentación
            automáticamente
          </p>

          <div className="tabs">
            <div className="tabs-group">
              <button
                className={mode === 'text' ? 'tab-btn active' : 'tab-btn'}
                onClick={() => setMode('text')}
                type="button"
              >
                Escribir Texto
              </button>
              <button
                className={mode === 'pdf' ? 'tab-btn active' : 'tab-btn'}
                onClick={() => setMode('pdf')}
                type="button"
              >
                Subir Archivo
              </button>
            </div>

            <div className="slides-counter">
              <span className="slides-counter-label">N. diapositivas</span>
              <div className="slides-counter-controls">
                <button
                  className="slides-counter-btn"
                  type="button"
                  onClick={() => syncSlidesValue(currentSlidesValue - 1)}
                  disabled={currentSlidesValue <= MIN_SLIDES}
                  aria-label="Restar diapositivas"
                >
                  -
                </button>
                <input
                  className="slides-counter-input"
                  type="number"
                  min={MIN_SLIDES}
                  max={MAX_SLIDES}
                  value={slidesInputValue}
                  onChange={(e) => {
                    if (!/^\d*$/.test(e.target.value)) {
                      return;
                    }
                    setSlidesInputValue(e.target.value);
                  }}
                  onBlur={commitSlidesInput}
                />
                <button
                  className="slides-counter-btn"
                  type="button"
                  onClick={() => syncSlidesValue(currentSlidesValue + 1)}
                  disabled={currentSlidesValue >= MAX_SLIDES}
                  aria-label="Sumar diapositivas"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {mode === 'pdf' && (
            <form onSubmit={handlePDF}>
              <label className="upload-label">Subir archivo PDF</label>
              <div
                className={`pdf-upload ${dragging ? 'dragging' : ''}`}
                onClick={() => document.getElementById('pdfInput').click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="pdf-upload-icon">
                  <svg
                    width="56"
                    height="56"
                    viewBox="0 0 56 56"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#2d7a2d" />
                        <stop offset="100%" stopColor="#a8d55a" />
                      </linearGradient>
                    </defs>
                    <rect width="56" height="56" rx="14" fill="url(#grad)" />
                    <path
                      d="M28 36V20M28 20L21 27M28 20L35 27"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M18 38H38"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <p className="upload-title">Arrastra tu PDF aquí</p>
                <p className="upload-subtitle">o haz clic para seleccionar</p>
                <p className="upload-size">Tamaño máximo: 3MB</p>
                {file && <span className="file-name">{file.name}</span>}
                <input
                  id="pdfInput"
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) => validateAndSet(e.target.files[0])}
                />
              </div>
              <div className="btn-row">
                <button
                  className="generate-btn"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : 'Generar Presentación'}
                </button>
              </div>
            </form>
          )}

          {mode === 'text' && (
            <form onSubmit={handleText}>
              <textarea
                className="text-input"
                placeholder="Escribe o pega tu texto aquí..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="btn-row">
                <button
                  className="generate-btn"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : 'Generar Presentación'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* LISTA DE PRESENTACIONES */}
        <ListOfPresentations />
      </div>
    </div>
  );
}
