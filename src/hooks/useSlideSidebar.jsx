import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  createSlide,
  deleteSlide,
  duplicateSlide,
  updateSlide,
} from '../services/slideService';
import { normalizePresentationTemplates } from '../utils/presentationTemplates';

const DEFAULT_NEW_SLIDE_BACKGROUND =
  'https://qftsvgnhxcqdrcarvsiq.supabase.co/storage/v1/object/public/images/slides/title_slide.jpg';

const reorderSlides = (slides) =>
  slides.map((slide, index) => ({
    ...slide,
    slideOrder: index + 1,
  }));

const moveSlide = (slides, fromIndex, toIndex) => {
  const nextSlides = [...slides];
  const [movedSlide] = nextSlides.splice(fromIndex, 1);
  nextSlides.splice(toIndex, 0, movedSlide);
  return nextSlides;
};

export function useSlideSidebar({
  onPresentationChange,
  onSelectSlide,
  presentationData,
  selectedSlideIndex,
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);

  const updatePresentationState = useCallback(
    (nextPresentation) => {
      const normalizedPresentation =
        normalizePresentationTemplates(nextPresentation);
      onPresentationChange(normalizedPresentation);
    },
    [onPresentationChange],
  );

  const syncSlideOrder = useCallback(async (slides) => {
    await Promise.all(
      slides.map((slide) =>
        updateSlide(slide.id, { slideOrder: slide.slideOrder }),
      ),
    );
  }, []);

  const handleAddSlide = useCallback(
    async (insertIndex) => {
      if (!presentationData) return;

      const newSlidePayload = {
        presentationId: presentationData.id,
        title: 'Nueva diapositiva',
        background: {
          type: 'image',
          url: DEFAULT_NEW_SLIDE_BACKGROUND,
        },
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

        const reorderedSlides = reorderSlides(nextSlides);
        const nextPresentation = {
          ...presentationData,
          slides: reorderedSlides,
        };

        updatePresentationState(nextPresentation);
        onSelectSlide(insertIndex);
        await syncSlideOrder(reorderedSlides);
      } catch {
        toast.error('No se pudo crear la diapositiva');
      }
    },
    [onSelectSlide, presentationData, syncSlideOrder, updatePresentationState],
  );

  const handleDuplicateSlide = useCallback(
    async (slide, index) => {
      if (!presentationData) return;

      try {
        const createdSlide = await duplicateSlide(slide.id);
        const newSlide = {
          ...createdSlide,
          elements: createdSlide.SlideElements || [],
          background: createdSlide.background,
          templateType:
            slide.templateType || (index === 0 ? 'title' : 'standard'),
        };

        const nextSlides = [...presentationData.slides];
        nextSlides.splice(index + 1, 0, newSlide);

        const reorderedSlides = reorderSlides(nextSlides);
        const nextPresentation = {
          ...presentationData,
          slides: reorderedSlides,
        };

        updatePresentationState(nextPresentation);
        onSelectSlide(index + 1);
        await syncSlideOrder(reorderedSlides);
        toast.success('Diapositiva duplicada');
      } catch (error) {
        console.error('Error detallado en duplicación:', error);
        toast.error('No se pudo duplicar la diapositiva');
      }
    },
    [onSelectSlide, presentationData, syncSlideOrder, updatePresentationState],
  );

  const handleDeleteSlide = useCallback(
    async (slideId, slideIndex) => {
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
          onSelectSlide(nextSlides.length - 1);
        } else if (selectedSlideIndex === slideIndex) {
          onSelectSlide(Math.min(slideIndex, nextSlides.length - 1));
        }

        toast.success('Diapositiva eliminada');
      } catch {
        toast.error('Error eliminando la diapositiva');
      }
    },
    [
      onSelectSlide,
      presentationData,
      selectedSlideIndex,
      updatePresentationState,
    ],
  );

  const handleReorderSlides = useCallback(
    async (fromIndex, toIndex) => {
      if (!presentationData || fromIndex === toIndex) return;

      const reorderedSlides = reorderSlides(
        moveSlide(presentationData.slides, fromIndex, toIndex),
      );
      const nextPresentation = {
        ...presentationData,
        slides: reorderedSlides,
      };

      updatePresentationState(nextPresentation);
      onSelectSlide(toIndex);

      try {
        await syncSlideOrder(reorderedSlides);
        toast.success('Orden de diapositivas actualizado');
      } catch (error) {
        console.error('Error updating slides:', error);
        toast.error('No se pudo guardar el nuevo orden de diapositivas');
      }
    },
    [onSelectSlide, presentationData, syncSlideOrder, updatePresentationState],
  );

  const handleDragStart = useCallback((index) => {
    setDraggedIndex(index);
  }, []);

  const handleDrop = useCallback(
    (index) => {
      if (draggedIndex === null || draggedIndex === index) {
        setDraggedIndex(null);
        return;
      }

      void handleReorderSlides(draggedIndex, index);
      setDraggedIndex(null);
    },
    [draggedIndex, handleReorderSlides],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  const handleMenuToggle = useCallback((event, index) => {
    event.stopPropagation();
    setOpenMenuIndex((current) => (current === index ? null : index));
  }, []);

  const closeMenu = useCallback(() => {
    setOpenMenuIndex(null);
  }, []);

  useEffect(() => {
    if (openMenuIndex === null) return;

    const handleDocumentMouseDown = (event) => {
      if (event.target.closest('[data-slide-menu-root="true"]')) return;
      setOpenMenuIndex(null);
    };

    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () =>
      document.removeEventListener('mousedown', handleDocumentMouseDown);
  }, [openMenuIndex]);

  return {
    closeMenu,
    draggedIndex,
    handleAddSlide,
    handleDeleteSlide,
    handleDragEnd,
    handleDragStart,
    handleDrop,
    handleDuplicateSlide,
    handleMenuToggle,
    openMenuIndex,
  };
}
