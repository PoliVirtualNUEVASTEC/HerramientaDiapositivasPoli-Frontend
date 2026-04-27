import {
  Image as ImageIcon,
  List as ListIcon,
  Palette,
  Type,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getTemplates } from '../services/templateService';
import '../styles/addElementPanel.css';

export default function AddElementPanel({
  selectedSlideIndex,
  onAddText,
  onAddImage,
  onAddList,
  onAddTemplate,
  onApplyTemplate,
}) {
  const [activePanel, setActivePanel] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [images, setImages] = useState([]);
  const [panelTop, setPanelTop] = useState(80);
  const [templates, setTemplates] = useState([]); // ✅ NUEVO

  // 🔥 cargar templates desde supabase
  useEffect(() => {
    const loadTemplates = async () => {
      const data = await getTemplates();
      setTemplates(data || []);
    };

    loadTemplates();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImages((prev) => [...prev, url]);
  };

  // CONTROLA POSICIÓN DEL PANEL
  const handleHover = (panel, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const safeTop = Math.min(rect.top, window.innerHeight - 320);

    setPanelTop(safeTop);
    setActivePanel(panel);
  };

  return (
    <div onMouseLeave={() => setActivePanel(null)}>
      {/* SIDEBAR */}
      <div className="add-element-panel">
        <div className="add-element-tabs">
          <button
            onMouseEnter={(e) => handleHover('text', e)}
            className="tab-btn-add"
            title="AgregarTexto"
          >
            <Type size={26} />
          </button>

          <button
            onMouseEnter={(e) => handleHover('image', e)}
            className="tab-btn-add"
            title="AgregarImagen"
          >
            <ImageIcon size={26} />
          </button>

          <button
            onMouseEnter={(e) => handleHover('list', e)}
            className="tab-btn-add"
            title="AgregarLista"
          >
            <ListIcon size={26} />
          </button>

          <button
            onMouseEnter={(e) => handleHover('background', e)}
            className="tab-btn-add"
            title="AgregarFondo"
          >
            <Palette size={26} />
          </button>
        </div>
      </div>

      {/* PANEL LATERAL */}
      {activePanel && (
        <div
          className="overlay-panel"
          style={{ top: panelTop }}
          onMouseEnter={() => setActivePanel(activePanel)}
        >
          <div className="overlay-content">
            {activePanel === 'text' && <TextPanel onAddText={onAddText} />}

            {activePanel === 'image' && (
              <ImagePanel images={images} onUpload={handleImageUpload} />
            )}

            {activePanel === 'list' && (
              <ListPanel onAddList={onAddList} />
            )}

            {activePanel === 'background' && (
              <BackgroundPanel
                templates={templates}
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
                onApplyTemplate={onApplyTemplate}
                onAddTemplate={onAddTemplate}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------- PANELES -------- */

function TextPanel({ onAddText }) {
  return (
    <div className="panel-content">
      <h3>Agregar texto</h3>

      <div className="text-options">
        <div className="text-option" onClick={() => onAddText('title')}>
          <span className="text-title">Título</span>
        </div>

        <div className="text-option" onClick={() => onAddText('text')}>
          <span className="text-paragraph">Texto</span>
        </div>
      </div>
    </div>
  );
}

function ImagePanel({ images, onUpload }) {
  return (
    <div className="panel-content">
      <h3>Imágenes</h3>

      <label className="upload-area">
        <input type="file" onChange={onUpload} hidden />
        <p>Subir imagen</p>
      </label>

      <div className="image-history">
        {images.length === 0 && <p>No hay imágenes aún</p>}

        {images.map((img, i) => (
          <img key={i} src={img} alt="preview" />
        ))}
      </div>
    </div>
  );
}

function ListPanel({ onAddList }) {
  return (
    <div className="panel-content">
      <h3>Listas</h3>

      <div className="list-options">
        <div className="list-option" onClick={() => onAddList('bullet')}>
          • Lista con viñetas
        </div>

        <div className="list-option" onClick={() => onAddList('number')}>
          1. Lista numerada
        </div>

        <div className="list-option" onClick={() => onAddList('check')}>
          ✔ Lista con checks
        </div>
      </div>
    </div>
  );
}

function BackgroundPanel({
  templates,
  selectedTemplate,
  setSelectedTemplate,
  onApplyTemplate,
  onAddTemplate,
}) {
  return (
    <div className="panel-content">
      <h3>Plantillas</h3>

      {/* GRID */}
      <div className="template-grid">
        {(templates || []).map((template, index) => (
          <div
            key={index}
            className={`template-card ${
              selectedTemplate === template.url ? 'selected' : ''
            }`}
            onClick={() => setSelectedTemplate(template.url)}
          >
            <img src={template.url} alt={template.name} />
          </div>
        ))}
      </div>

      {/* BOTONES INFERIORES */}
      <div className="template-footer">
        <button
          disabled={!selectedTemplate}
          onClick={() => onApplyTemplate(selectedTemplate)}
        >
          Aplicar a slide
        </button>

        <button
          disabled={!selectedTemplate}
          onClick={() => onAddTemplate(selectedTemplate)}
        >
          Nueva diapositiva
        </button>
      </div>
    </div>
  );
}