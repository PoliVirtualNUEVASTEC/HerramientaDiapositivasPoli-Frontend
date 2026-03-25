import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { sendText, uploadPDF } from '../services/presentationService';
import { useAuthStore } from '../store/authStore';
import mockPresentation from '../assets/presentation.json';
import '../styles/dashboard.css';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [mode, setMode] = useState('pdf');
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [presentations, setPresentations] = useState([]);

  // Cargar presentaciones guardadas
  useEffect(() => {
    const saved = localStorage.getItem('presentations');
    if (saved) setPresentations(JSON.parse(saved));
  }, []);

  const savePresentations = (list) => {
    setPresentations(list);
    localStorage.setItem('presentations', JSON.stringify(list));
  };

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

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
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
      ...mockPresentation,
      id: Date.now(),
      title: data?.title || mockPresentation.title,
      createdAt: new Date().toLocaleDateString('es-CO'),
    };
    const updated = [presentation, ...presentations];
    savePresentations(updated);
    navigate(`/preview/${presentation.id}`, { state: { presentation } });
  };

  const handlePDF = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Debes seleccionar un archivo PDF'); return; }
    try {
      setLoading(true);
      const data = await uploadPDF(file);
      toast.success('PDF procesado correctamente');
      handleSuccess(data);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Error al subir PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleText = async (e) => {
    e.preventDefault();
    if (!text.trim()) { toast.error('Debes escribir un texto'); return; }
    try {
      setLoading(true);
      const data = await sendText(text);
      toast.success('Texto procesado correctamente');
      handleSuccess(data);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Error al enviar texto');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    const updated = presentations.filter((p) => p.id !== id);
    savePresentations(updated);
    toast.success('Presentación eliminada');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-overlay" />
      <Navbar />

      <div className="dashboard-content">

        {/* CARD CREAR */}
        <div className="dashboard-card">
          <h1>Crear nueva presentación</h1>
          <p>Ingresa el texto o sube un archivo para generar tu presentación automáticamente</p>

          <div className="tabs">
            <button className={mode === 'text' ? 'tab-btn active' : 'tab-btn'} onClick={() => setMode('text')}>
              Escribir Texto
            </button>
            <button className={mode === 'pdf' ? 'tab-btn active' : 'tab-btn'} onClick={() => setMode('pdf')}>
              Subir Archivo
            </button>
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
                  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#2d7a2d" />
                        <stop offset="100%" stopColor="#a8d55a" />
                      </linearGradient>
                    </defs>
                    <rect width="56" height="56" rx="14" fill="url(#grad)" />
                    <path d="M28 36V20M28 20L21 27M28 20L35 27" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18 38H38" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="upload-title">Arrastra tu PDF aquí</p>
                <p className="upload-subtitle">o haz clic para seleccionar</p>
                <p className="upload-size">Tamaño máximo: 3MB</p>
                {file && <span className="file-name">{file.name}</span>}
                <input id="pdfInput" type="file" accept="application/pdf" hidden onChange={(e) => validateAndSet(e.target.files[0])} />
              </div>
              <div className="btn-row">
                <button className="generate-btn" type="submit" disabled={loading}>
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
                <button className="generate-btn" type="submit" disabled={loading}>
                  {loading ? 'Procesando...' : 'Generar Presentación'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* LISTA DE PRESENTACIONES */}
        {presentations.length > 0 && (
          <div className="presentations-list">
            <h2>Mis presentaciones</h2>
            <div className="presentations-grid">
              {presentations.map((p) => (
                <div key={p.id} className="presentation-item">
                  <div
                    className="presentation-thumbnail"
                    onClick={() => navigate(`/preview/${p.id}`, { state: { presentation: p } })}
                  >
                    <div className="thumbnail-slides-count">{p.slides?.length || 0} slides</div>
                    <div className="thumbnail-icon">🖼️</div>
                  </div>
                  <div className="presentation-info">
                    <span className="presentation-title">{p.title}</span>
                    <span className="presentation-date">{p.createdAt}</span>
                  </div>
                  <div className="presentation-actions">
                    <button
                      className="action-btn view-btn"
                      onClick={() => navigate(`/preview/${p.id}`, { state: { presentation: p } })}
                    >
                      Ver
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(p.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}