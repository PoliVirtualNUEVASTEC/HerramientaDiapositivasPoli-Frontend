import {
  Image as ImageIcon,
  List as ListIcon,
  Palette,
  Type,
} from 'lucide-react';
import { useState } from 'react';

import '../styles/addElementPanel.css';

export default function AddElementPanel({ onAddText, onAddList }) {
  const [activePanel, setActivePanel] = useState(null);
  const [images, setImages] = useState([]);
  const [panelTop, setPanelTop] = useState(80);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImages((prev) => [...prev, url]);
  };

  //CONTROLA POSICIÓN DEL PANEL
  const handleHover = (panel, e) => {
    const rect = e.currentTarget.getBoundingClientRect();

    // evita que se salga por abajo
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
            className="tab-btn"
            title="AgregarTexto"
          >
            <Type size={26} />
          </button>

          <button
            onMouseEnter={(e) => handleHover('image', e)}
            className="tab-btn"
            title="AgregarImagen"
          >
            <ImageIcon size={26} />
          </button>

          <button
            onMouseEnter={(e) => handleHover('list', e)}
            className="tab-btn"
            title="AgregarLista"
          >
            <ListIcon size={26} />
          </button>

          <button
            onMouseEnter={(e) => handleHover('background', e)}
            className="tab-btn"
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
            {activePanel === 'list' && <ListPanel onAddList={onAddList} />}
            {activePanel === 'background' && <BackgroundPanel />}
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

function BackgroundPanel() {
  return (
    <div className="panel-content">
      <h3>Fondos</h3>

      <div className="template-grid">
        <div className="template-card">🌄</div>
        <div className="template-card">🌊</div>
        <div className="template-card">🌿</div>
        <div className="template-card">🌇</div>
      </div>

      <button className="btn-confirm">Aplicar</button>
    </div>
  );
}
