import { Copy, MoreVertical, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  createSlide,
  deleteSlide,
  duplicateSlide,
  updateSlide,
} from '../services/slideService';
import '../styles/slideSidebar.css';

export default function SlideSidebar({
  slides,
  selectedSlideIndex,
  onSelectSlide,
  presentationData,
  setPresentationData,
  setPresentationInStore,
  setSelectedSlideIndex,
  normalizePresentationTemplates,
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);

  const updatePresentationState = (nextPresentation) => {
    const normalizedPresentation =
      normalizePresentationTemplates(nextPresentation);
    setPresentationData(normalizedPresentation);
    setPresentationInStore(normalizedPresentation);
  };

  const handleAddSlide = async (insertIndex) => {
    if (!presentationData) return;

    const newSlidePayload = {
      presentationId: presentationData.id,
      title: 'Nueva diapositiva',
      elements: [],
      slideOrder: insertIndex + 1,
    };

    try {
      const createdSlide = await createSlide(newSlidePayload);
      const newSlide = {
        ...createdSlide,
        templateType: createdSlide.templateType ?? 'standard',
      };
      const nextSlides = [...presentationData.slides];
      nextSlides.splice(insertIndex, 0, newSlide);

      const reorderedSlides = nextSlides.map((slide, index) => ({
        ...slide,
        slideOrder: index + 1,
      }));

      const nextPresentation = { ...presentationData, slides: reorderedSlides };
      updatePresentationState(nextPresentation);
      setSelectedSlideIndex(insertIndex);

      await Promise.all(
        reorderedSlides.map((slide) =>
          updateSlide(slide.id, { slideOrder: slide.slideOrder }),
        ),
      );
    } catch {
      toast.error('No se pudo crear la diapositiva');
    }
  };

  const handleDuplicateSlide = async (slide, index) => {
    if (!presentationData) return;

    try {
      // 1. Llamada al servicio
      const createdSlide = await duplicateSlide(slide.id);

      // 2. Construcción del objeto de la nueva slide (UNA SOLA VEZ)
      const newSlide = {
        ...createdSlide,
        // Mapeamos el alias del backend al nombre que usa el front
        elements: createdSlide.SlideElements || [],
        background: createdSlide.background,
        // Priorizamos el tipo de la slide original para mantener el background correcto
        templateType:
          slide.templateType || (index === 0 ? 'title' : 'standard'),
      };

      // 3. Lógica de inserción
      const nextSlides = [...presentationData.slides];
      nextSlides.splice(index + 1, 0, newSlide);

      // 4. Reordenamiento masivo
      const reorderedSlides = nextSlides.map((s, i) => ({
        ...s,
        slideOrder: i + 1,
      }));

      // 5. Actualización del estado global
      const nextPresentation = {
        ...presentationData,
        slides: reorderedSlides,
      };

      updatePresentationState(nextPresentation);

      // 6. Selección de la diapositiva copiada
      setSelectedSlideIndex(index + 1);

      // 7. Sincronización con el Backend
      await Promise.all(
        reorderedSlides.map((s) =>
          updateSlide(s.id, { slideOrder: s.slideOrder }),
        ),
      );

      toast.success('Diapositiva duplicada');
    } catch (error) {
      console.error('Error detallado en duplicación:', error);
      toast.error('No se pudo duplicar la diapositiva');
    }
  };

  const handleDeleteSlide = async (slideId, slideIndex) => {
    if (!presentationData) return;
    if (presentationData.slides.length <= 1) {
      toast.error('Debe quedar al menos una diapositiva');
      return;
    }

    try {
      await deleteSlide(slideId);
      const nextSlides = presentationData.slides.filter(
        (slide) => slide.id !== slideId,
      );
      const nextPresentation = { ...presentationData, slides: nextSlides };
      updatePresentationState(nextPresentation);

      if (selectedSlideIndex >= nextSlides.length) {
        setSelectedSlideIndex(nextSlides.length - 1);
      } else if (selectedSlideIndex === slideIndex) {
        setSelectedSlideIndex(Math.min(slideIndex, nextSlides.length - 1));
      }
      toast.success('Diapositiva eliminada');
    } catch {
      toast.error('Error eliminando la diapositiva');
    }
  };

  const moveSlide = (slides, fromIndex, toIndex) => {
    const nextSlides = [...slides];
    const [movedSlide] = nextSlides.splice(fromIndex, 1);
    nextSlides.splice(toIndex, 0, movedSlide);
    return nextSlides;
  };

  const handleReorderSlides = async (fromIndex, toIndex) => {
    if (!presentationData || fromIndex === toIndex) return;

    const nextSlides = moveSlide(presentationData.slides, fromIndex, toIndex);
    const nextPresentation = { ...presentationData, slides: nextSlides };
    updatePresentationState(nextPresentation);
    setSelectedSlideIndex(toIndex);

    try {
      const updatePromises = nextSlides.map((slide, index) =>
        updateSlide(slide.id, { slideOrder: index + 1 }),
      );
      await Promise.all(updatePromises);
      toast.success('Orden de diapositivas actualizado');
    } catch (error) {
      console.error('Error updating slides:', error);
      toast.error('No se pudo guardar el nuevo orden de diapositivas');
    }
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDrop = (index) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      return;
    }
    handleReorderSlides(draggedIndex, index);
    setDraggedIndex(null);
  };

  const handleMenuToggle = (event, index) => {
    event.stopPropagation();
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  return (
    <aside className="edit-sidebar">
      <div className="edit-sidebar-header">Diapositivas</div>
      <div className="slide-list">
        {slides.map((slide, index) => (
          <div key={slide.id} className="slide-list-block">
            <div
              className={`slide-list-item ${selectedSlideIndex === index ? 'active' : ''} ${draggedIndex === index ? 'dragging' : ''}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(index)}
              onDragEnd={() => setDraggedIndex(null)}
              onClick={() => onSelectSlide(index)}
            >
              <div className="slide-list-item-content">
                <span className="slide-item-number">{index + 1}</span>
                <div className="slide-item-text">
                  <strong>{slide.title || 'Sin título'}</strong>
                  <p>{slide.elements?.[0]?.content?.text || 'Sin contenido'}</p>
                </div>
              </div>

              <div className="slide-item-actions">
                <button
                  type="button"
                  className="slide-menu-trigger"
                  onClick={(event) => handleMenuToggle(event, index)}
                >
                  <MoreVertical size={18} />
                </button>
                {openMenuIndex === index && (
                  <div className="slide-menu-dropdown">
                    <button
                      type="button"
                      className="slide-menu-item"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDuplicateSlide(slide, index);
                        setOpenMenuIndex(null);
                      }}
                    >
                      <Copy size={14} />
                      Duplicar
                    </button>
                    <button
                      type="button"
                      className="slide-menu-item delete"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteSlide(slide.id, index);
                        setOpenMenuIndex(null);
                      }}
                    >
                      <Trash2 size={14} />
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div
              className={`slide-insert-row ${index === slides.length - 1 ? 'always-visible' : ''}`}
            >
              <button
                type="button"
                className="slide-insert-button"
                onClick={() => handleAddSlide(index + 1)}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
