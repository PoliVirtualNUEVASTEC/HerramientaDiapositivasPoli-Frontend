import { forwardRef, useEffect, useRef, useState } from 'react';
import PresentationSlideCanvas from './PresentationSlideCanvas';

const BASE_SLIDE_WIDTH = 960;
const BASE_SLIDE_HEIGHT = 540;

const getScaleFromWidth = (width) => {
  if (!width || Number.isNaN(width)) {
    return 1;
  }

  return width / BASE_SLIDE_WIDTH;
};

const ResponsivePreviewSlide = forwardRef(function ResponsivePreviewSlide(
  { slide },
  ref,
) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const containerNode = containerRef.current;

    if (!containerNode) {
      return undefined;
    }

    const updateScale = () => {
      setScale(getScaleFromWidth(containerNode.clientWidth));
    };

    updateScale();

    const resizeObserver = new ResizeObserver(() => {
      updateScale();
    });

    resizeObserver.observe(containerNode);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="preview-slide-stage"
      style={{ height: `${BASE_SLIDE_HEIGHT * scale}px` }}
    >
      <div
        className="preview-slide-scale-layer"
        style={{ transform: `translateX(-50%) scale(${scale})` }}
      >
        <PresentationSlideCanvas ref={ref} slide={slide} />
      </div>
    </div>
  );
});

export default ResponsivePreviewSlide;
