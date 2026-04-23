import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PresentationSlideCanvas from './PresentationSlideCanvas';

const PLAYER_HORIZONTAL_PADDING = 64;
const PLAYER_VERTICAL_PADDING = 140;
const BASE_SLIDE_WIDTH = 960;
const BASE_SLIDE_HEIGHT = 540;

export default function PresentationPlayer({
  currentSlideIndex,
  onClose,
  onNextSlide,
  onPreviousSlide,
  presentationTitle,
  slides,
}) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const availableWidth = Math.max(
        window.innerWidth - PLAYER_HORIZONTAL_PADDING,
        320,
      );
      const availableHeight = Math.max(
        window.innerHeight - PLAYER_VERTICAL_PADDING,
        180,
      );

      setScale(
        Math.min(
          availableWidth / BASE_SLIDE_WIDTH,
          availableHeight / BASE_SLIDE_HEIGHT,
        ),
      );
    };

    updateScale();
    window.addEventListener('resize', updateScale);

    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const currentSlide = slides[currentSlideIndex];

  if (!currentSlide || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="presentation-player-overlay" role="dialog" aria-modal="true">
      <button
        type="button"
        className="presentation-nav-zone left"
        onClick={onPreviousSlide}
        aria-label="Diapositiva anterior"
      />
      <button
        type="button"
        className="presentation-nav-zone right"
        onClick={onNextSlide}
        aria-label="Siguiente diapositiva"
      />

      <div className="presentation-player-topbar">
        <div className="presentation-player-meta">
          <strong>{presentationTitle}</strong>
          <span>
            {currentSlideIndex + 1} / {slides.length}
          </span>
        </div>

        <button
          type="button"
          className="presentation-player-close"
          onClick={onClose}
        >
          <X size={18} />
          <span>Salir</span>
        </button>
      </div>

      <div className="presentation-player-stage">
        <div
          className="presentation-player-slide"
          style={{ transform: `scale(${scale})` }}
        >
          <PresentationSlideCanvas slide={currentSlide} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
