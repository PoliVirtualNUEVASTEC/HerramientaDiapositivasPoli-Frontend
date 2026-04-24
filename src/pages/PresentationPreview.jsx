import { ChevronDown, FileDown, Play } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PresentationPlayer from '../components/PresentationPlayer';
import PresentationSlideCanvas from '../components/PresentationSlideCanvas';
import { usePresentationExport } from '../hooks/usePresentationExport';
import { usePresentationLoader } from '../hooks/usePresentationLoader';
import { usePresentationPlayer } from '../hooks/usePresentationPlayer';
import { usePresentationStore } from '../store/presentationStore';
import '../styles/preview.css';

export default function PresentationPreview() {
  const navigate = useNavigate();
  const { id } = useParams();
  const presentationFromStore = usePresentationStore(
    (state) => state.presentation,
  );
  const setPresentationInStore = usePresentationStore(
    (state) => state.setPresentation,
  );
  const { presentation, loading } = usePresentationLoader(
    id,
    presentationFromStore,
    setPresentationInStore,
  );
  const {
    exportToPdf,
    exportToPptx,
    exportingFormat,
    isExporting,
    registerSlideNode,
  } = usePresentationExport(presentation);
  const {
    closePresentation,
    currentSlideIndex,
    goToNextSlide,
    goToPreviousSlide,
    isPresenting,
    openPresentation,
  } = usePresentationPlayer(presentation?.slides?.length ?? 0);

  if (loading) {
    return (
      <div className="preview-error">
        <p>loading...</p>
      </div>
    );
  }

  if (!presentation) {
    return (
      <div className="preview-error">
        <p>No se encontró la presentación.</p>
        <button onClick={() => navigate('/dashboard')}>Volver</button>
      </div>
    );
  }

  const handleEdit = () => {
    navigate(`/edit/${id}`);
  };

  return (
    <div className="preview-container">
      <Navbar />

      <div className="preview-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Volver
        </button>

        <h1>{presentation.title}</h1>

        <span className="slide-count">{presentation.slides.length} slides</span>
      </div>

      <div className="preview-actions">
        <button
          type="button"
          className="present-btn"
          onClick={() => openPresentation(0)}
        >
          <Play size={16} />
          <span>Presentar</span>
        </button>

        <button className="edit-btn" onClick={handleEdit}>
          Editar presentación
        </button>

        <div className="export-menu">
          <button type="button" className="export-btn" disabled={isExporting}>
            <FileDown size={16} />
            <span>
              {exportingFormat
                ? `Exportando ${exportingFormat.toUpperCase()}...`
                : 'Exportar'}
            </span>
            <ChevronDown size={16} />
          </button>

          {!isExporting && (
            <div className="export-dropdown">
              <button
                type="button"
                className="export-dropdown-item"
                onClick={exportToPdf}
              >
                PDF
              </button>
              <button
                type="button"
                className="export-dropdown-item"
                onClick={exportToPptx}
              >
                PPTX
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="slides-wrapper">
        {presentation.slides.map((slide, index) => (
          <div key={slide.id} className="slide-container">
            <div className="slide-number">
              Slide {index + 1} — {slide.title}
            </div>

            <PresentationSlideCanvas
              ref={(node) => registerSlideNode(slide.id, node)}
              slide={slide}
            />
          </div>
        ))}
      </div>

      {isPresenting && (
        <PresentationPlayer
          currentSlideIndex={currentSlideIndex}
          onClose={closePresentation}
          onNextSlide={goToNextSlide}
          onPreviousSlide={goToPreviousSlide}
          presentationTitle={presentation.title}
          slides={presentation.slides}
        />
      )}
    </div>
  );
}
