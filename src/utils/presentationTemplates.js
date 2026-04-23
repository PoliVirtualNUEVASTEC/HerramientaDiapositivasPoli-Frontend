export const getTemplateType = (slide, index, totalSlides) => {
  if (slide?.templateType) {
    return slide.templateType;
  }

  if (index === 0) return 'title';
  if (index === totalSlides - 1) return 'end';

  const currentElements = slide?.elements || slide?.SlideElements || [];
  const hasImage = currentElements.some((element) => element.type === 'image');

  return hasImage ? 'image' : 'standard';
};

export const normalizeSlideTemplate = (slide, index, totalSlides) => ({
  ...slide,
  templateType: getTemplateType(slide, index, totalSlides),
});

export const normalizePresentationTemplates = (presentationState) => {
  if (!presentationState) return presentationState;

  const slides = presentationState.slides ?? [];

  return {
    ...presentationState,
    slides: slides.map((slide, index) =>
      normalizeSlideTemplate(slide, index, slides.length),
    ),
  };
};

export const getSlideTemplateStyles = (slide) => {
  const background = slide?.background;

  if (background?.type === 'color') {
    return { backgroundColor: background.color };
  }

  if (background?.type === 'image') {
    return { backgroundImage: `url("${background.url}")` };
  }

  return {};
};
