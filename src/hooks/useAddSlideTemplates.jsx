import { createSlide, updateSlide } from '../services/slideService';

export function useAddSlideTemplates({
  presentationData,
  setPresentationData,
  setPresentationInStore,
  selectedSlideIndex,
  setSelectedSlideIndex,
}) {
  const addSlideWithTemplate = async (imageUrl) => {
    try {
      const newSlideData = {
        presentationId: presentationData.id,
        title: 'Nueva diapositiva',
        slideOrder: presentationData.slides.length,
        background: {
          type: 'image',
          url: imageUrl,
        },
      };

      const createdSlide = await createSlide(newSlideData);

      createdSlide.elements = [];

      const updatedPresentation = { ...presentationData };
      updatedPresentation.slides.push(createdSlide);

      setPresentationData(updatedPresentation);
      setPresentationInStore(updatedPresentation);

      setSelectedSlideIndex(updatedPresentation.slides.length - 1);
    } catch (error) {
      console.error('Error creando slide con template:', error);
    }
  };

  const applyTemplateToSlide = async (imageUrl) => {
    try {
      const slide = presentationData.slides[selectedSlideIndex];

      const updatedSlide = {
        ...slide,
        background: {
          type: 'image',
          url: imageUrl,
        },
      };

      await updateSlide(slide.id, {
        background: updatedSlide.background,
      });

      const updatedPresentation = { ...presentationData };
      updatedPresentation.slides[selectedSlideIndex] = updatedSlide;

      setPresentationData(updatedPresentation);
      setPresentationInStore(updatedPresentation);
    } catch (error) {
      console.error('Error aplicando template:', error);
    }
  };

  return {
    addSlideWithTemplate,
    applyTemplateToSlide,
  };
}