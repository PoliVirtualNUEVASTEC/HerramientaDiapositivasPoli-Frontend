import { useEffect, useRef, useState } from 'react';
import SlideCanvas from './SlideCanvas';

const BASE_CANVAS_WIDTH = 960;
const BASE_CANVAS_HEIGHT = 540;
const MAX_EDIT_SCALE = 1.22;

const getScaleFromWidth = (width) => {
  if (!width || Number.isNaN(width)) {
    return 1;
  }

  return Math.min(width / BASE_CANVAS_WIDTH, MAX_EDIT_SCALE);
};

export default function ResponsiveEditCanvas({
  onStageHeightChange,
  ...slideCanvasProps
}) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const containerNode = containerRef.current;

    if (!containerNode) {
      return undefined;
    }

    const updateScale = () => {
      const nextScale = getScaleFromWidth(containerNode.clientWidth);
      setScale(nextScale);

      if (typeof onStageHeightChange === 'function') {
        onStageHeightChange(BASE_CANVAS_HEIGHT * nextScale);
      }
    };

    updateScale();

    const resizeObserver = new ResizeObserver(() => {
      updateScale();
    });

    resizeObserver.observe(containerNode);

    return () => {
      resizeObserver.disconnect();
    };
  }, [onStageHeightChange]);

  return (
    <div
      ref={containerRef}
      className="edit-canvas-stage"
      style={{ height: `${BASE_CANVAS_HEIGHT * scale}px` }}
    >
      <div
        className="edit-canvas-scale-layer"
        style={{ transform: `translateX(-50%) scale(${scale})` }}
      >
        <SlideCanvas {...slideCanvasProps} />
      </div>
    </div>
  );
}
