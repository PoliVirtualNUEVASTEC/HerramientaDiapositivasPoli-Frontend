import { CheckCircle, Loader } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AddElementPanel from '../components/AddElementPanel';
import EditToolbar from '../components/EditToolbar';
import Navbar from '../components/Navbar';
import SlideCanvas from '../components/SlideCanvas';
import SlideSidebar from '../components/SlideSidebar';
import { usePresentationEditor } from '../hooks/usePresentationEditor';
import { usePresentationLoader } from '../hooks/usePresentationLoader';
import {useAddSlideTemplates} from '../hooks/useAddSlideTemplates';
import { usePresentationStore } from '../store/presentationStore';
import '../styles/preview.css';
import { getSlideTemplateStyles } from '../utils/presentationTemplates';
import { updateSlide } from '../services/slideService';

export default function EditPresentation() {
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
    activeToolbarButtons,
    borderRadiusValue,
    fontSizeValue,
    handleAspectRatioToggle,
    handleBackClick,
    handleBorderRadiusCycle,
    handleCanvasClick,
    handleColorChange,
    handleElementChange,
    handleElementClick,
    handleElementPosition,
    handleFontSizeChange,
    handleListTypeToggle,
    handleToolbarToggle,
    isEditingText,
    presentationData,
    selectedElement,
    selectedSlide,
    selectedSlideIndex,
    setIsEditingText,
    setPresentationState,
    setSelectedSlideIndex,
    handleAddText,
    handleAddList,
    syncStatus,
    toolbarButtons,
  } = usePresentationEditor({
    navigate,
    presentation,
    setPresentationInStore,
  });

  const { addSlideWithTemplate } = useAddSlideTemplates({
  presentationData,
  setPresentationData: setPresentationState, // 🔥 IMPORTANTE
  setPresentationInStore,
  selectedSlideIndex,
  setSelectedSlideIndex,
  });

  if (loading || !presentation) {
    return (
      <div className="preview-container">
        <Navbar />
        <div className="preview-error">
          <p>Cargando presentación...</p>
        </div>
      </div>
    );
  }

const handleApplyTemplate = async (templateUrl) => {
  if (!presentationData) return;

  const currentSlide = presentationData.slides[selectedSlideIndex];

  const updatedBackground = {
    type: 'image',
    url: templateUrl,
  };

  try {
    // 🔥 1. Guardar en backend
    await updateSlide(currentSlide.id, {
      background: updatedBackground,
    });

    // 🔥 2. Actualizar frontend SIN tocar elements
    const updatedSlides = presentationData.slides.map((slide, index) =>
      index === selectedSlideIndex
        ? {
            ...slide,
            background: updatedBackground, // 👈 SOLO esto cambia
          }
        : slide
    );

    setPresentationState({
      ...presentationData,
      slides: updatedSlides,
    });
  } catch (error) {
    console.error('Error aplicando plantilla:', error);
  }
};

  return (
    <div className="preview-container">
      <Navbar />

      <div className="preview-header">
        <button className="back-btn" onClick={handleBackClick}>
          ← Volver
        </button>

        <div className="header-title-group">
          <h1>Editar: {presentation.title}</h1>
          {syncStatus === 'saving' && (
            <div className="sync-status saving">
              <Loader size={16} className="spin" />
              <span>Guardando...</span>
            </div>
          )}
          {syncStatus === 'saved' && (
            <div className="sync-status saved">
              <CheckCircle size={16} />
              <span>Guardado</span>
            </div>
          )}
          {syncStatus === 'error' && (
            <div className="sync-status error">
              <span>Error al guardar</span>
            </div>
          )}
        </div>

        <span className="slide-count">{presentation.slides.length} slides</span>
      </div>

      <EditToolbar
        key={selectedElement?.id}
        selectedElement={selectedElement}
        toolbarButtons={toolbarButtons}
        activeToolbarButtons={activeToolbarButtons}
        onToggleButton={handleToolbarToggle}
        fontSizeValue={fontSizeValue}
        onFontSizeChange={handleFontSizeChange}
        onColorChange={handleColorChange}
        maintainAspectRatio={selectedElement?.maintainAspectRatio}
        onAspectRatioToggle={handleAspectRatioToggle}
        borderRadiusValue={borderRadiusValue}
        onBorderRadiusCycle={handleBorderRadiusCycle}
        onPositionAction={handleElementPosition}
        onListTypeToggle={handleListTypeToggle}
      />

      <div className="edit-layout">
        {presentationData && (
          <>
            <AddElementPanel
              selectedSlideIndex={selectedSlideIndex}
              onAddText={handleAddText}
              onAddImage={(url) => console.log('Imagen añadida:', url)}
              onAddList={handleAddList}
              onAddTemplate={addSlideWithTemplate}
              onApplyTemplate={handleApplyTemplate} 
            />
            <SlideSidebar
              slides={presentationData.slides}
              selectedSlideIndex={selectedSlideIndex}
              onSelectSlide={setSelectedSlideIndex}
              presentationData={presentationData}
              onPresentationChange={setPresentationState}
            />

            <main className="edit-main-preview">
              <SlideCanvas
                key={selectedSlide?.id}
                selectedSlide={selectedSlide}
                getTemplate={getSlideTemplateStyles(selectedSlide)}
                onElementClick={handleElementClick}
                selectedElement={selectedElement}
                onCanvasClick={handleCanvasClick}
                isEditingText={isEditingText}
                onElementChange={handleElementChange}
                onEditBlur={() => setIsEditingText(false)}
              />
            </main>
          </>
        )}
      </div>
    </div>
  );
}
