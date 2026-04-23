import { useCallback, useEffect, useState } from 'react';

export function usePresentationPlayer(totalSlides) {
  const [isPresenting, setIsPresenting] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const openPresentation = useCallback(
    async (startIndex = 0) => {
      const normalizedIndex = Math.max(
        0,
        Math.min(startIndex, Math.max(totalSlides - 1, 0)),
      );
      setCurrentSlideIndex(normalizedIndex);
      setIsPresenting(true);

      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen?.();
        }
      } catch (error) {
        console.warn('No se pudo activar fullscreen:', error);
      }
    },
    [totalSlides],
  );

  const closePresentation = useCallback(async () => {
    setIsPresenting(false);

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen?.();
      }
    } catch (error) {
      console.warn('No se pudo salir de fullscreen:', error);
    }
  }, []);

  const goToNextSlide = useCallback(() => {
    setCurrentSlideIndex((currentIndex) =>
      Math.min(currentIndex + 1, Math.max(totalSlides - 1, 0)),
    );
  }, [totalSlides]);

  const goToPreviousSlide = useCallback(() => {
    setCurrentSlideIndex((currentIndex) => Math.max(currentIndex - 1, 0));
  }, []);

  useEffect(() => {
    if (!isPresenting) return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsPresenting(false);
      }
    };

    const handleKeyDown = (event) => {
      if (
        event.key === 'ArrowRight' ||
        event.key === 'ArrowDown' ||
        event.key === 'PageDown' ||
        event.key === ' '
      ) {
        event.preventDefault();
        goToNextSlide();
      }

      if (
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowUp' ||
        event.key === 'PageUp'
      ) {
        event.preventDefault();
        goToPreviousSlide();
      }

      if (event.key === 'Home') {
        event.preventDefault();
        setCurrentSlideIndex(0);
      }

      if (event.key === 'End') {
        event.preventDefault();
        setCurrentSlideIndex(Math.max(totalSlides - 1, 0));
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        closePresentation();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [
    closePresentation,
    goToNextSlide,
    goToPreviousSlide,
    isPresenting,
    totalSlides,
  ]);

  return {
    closePresentation,
    currentSlideIndex,
    goToNextSlide,
    goToPreviousSlide,
    isPresenting,
    openPresentation,
  };
}
