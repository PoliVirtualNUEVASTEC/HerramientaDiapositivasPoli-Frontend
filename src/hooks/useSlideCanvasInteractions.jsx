import { useCallback, useEffect, useRef } from 'react';

const INITIAL_DRAG_STATE = {
  mode: 'idle',
  elementId: null,
  handle: null,
  startX: 0,
  startY: 0,
  startLeft: 0,
  startTop: 0,
  startWidth: 0,
  startHeight: 0,
  canvasRect: null,
  canvasWidth: 0,
  canvasHeight: 0,
  scaleX: 1,
  scaleY: 1,
  pointerId: null,
  target: null,
};

export function useSlideCanvasInteractions({
  isEditingText,
  onElementChange,
  selectedElement,
}) {
  const editorRef = useRef(null);
  const canvasRef = useRef(null);
  const dragRef = useRef(INITIAL_DRAG_STATE);
  const onElementChangeRef = useRef(onElementChange);
  const selectedElementRef = useRef(selectedElement);
  const cleanupPointerEventsRef = useRef(() => {});

  onElementChangeRef.current = onElementChange;
  selectedElementRef.current = selectedElement;

  const clamp = useCallback(
    (value, min, max) => Math.min(Math.max(value, min), max),
    [],
  );

  const getCanvasMetrics = useCallback(() => {
    const canvasNode = canvasRef.current;
    const canvasRect = canvasNode?.getBoundingClientRect();

    if (!canvasNode || !canvasRect) {
      return null;
    }

    const canvasWidth = canvasNode.offsetWidth || canvasRect.width;
    const canvasHeight = canvasNode.offsetHeight || canvasRect.height;

    return {
      canvasRect,
      canvasWidth,
      canvasHeight,
      scaleX: canvasRect.width / canvasWidth || 1,
      scaleY: canvasRect.height / canvasHeight || 1,
    };
  }, []);

  const getResizeBounds = useCallback(
    ({ dx, dy, handle, maintainAspectRatio }) => {
      const {
        startLeft,
        startTop,
        startWidth,
        startHeight,
        canvasWidth,
        canvasHeight,
      } = dragRef.current;
      const minWidth = 40;
      const minHeight = 30;
      let left = startLeft;
      let top = startTop;
      let width = startWidth;
      let height = startHeight;
      const maxWidth = canvasWidth;
      const maxHeight = canvasHeight;

      if (maintainAspectRatio && handle) {
        const ratio = startWidth / startHeight;
        const widthSign = handle.includes('left') ? -1 : 1;
        const heightSign = handle.includes('top') ? -1 : 1;
        const candidateWidth = startWidth + widthSign * dx;
        const candidateHeight = startHeight + heightSign * dy;
        const widthDelta = Math.abs(candidateWidth - startWidth);
        const heightDelta = Math.abs(candidateHeight - startHeight);

        if (widthDelta >= heightDelta) {
          width = clamp(candidateWidth, minWidth, maxWidth - startLeft);
          height = clamp(width / ratio, minHeight, maxHeight - startTop);
        } else {
          height = clamp(candidateHeight, minHeight, maxHeight - startTop);
          width = clamp(height * ratio, minWidth, maxWidth - startLeft);
        }

        if (handle.includes('left')) {
          left = startLeft + (startWidth - width);
        }
        if (handle.includes('top')) {
          top = startTop + (startHeight - height);
        }
      } else {
        if (handle.includes('left')) {
          left = clamp(startLeft + dx, 0, startLeft + startWidth - minWidth);
          width = startWidth + (startLeft - left);
        }
        if (handle.includes('right')) {
          width = clamp(startWidth + dx, minWidth, maxWidth - startLeft);
        }
        if (handle.includes('top')) {
          top = clamp(startTop + dy, 0, startTop + startHeight - minHeight);
          height = startHeight + (startTop - top);
        }
        if (handle.includes('bottom')) {
          height = clamp(startHeight + dy, minHeight, maxHeight - startTop);
        }
      }

      if (left + width > maxWidth) {
        width = maxWidth - left;
      }
      if (top + height > maxHeight) {
        height = maxHeight - top;
      }

      return { left, top, width, height };
    },
    [clamp],
  );

  const handlePointerMove = useCallback(
    (event) => {
      const drag = dragRef.current;
      if (drag.mode === 'idle' || !drag.canvasRect) return;

      const dx = (event.clientX - drag.startX) / drag.scaleX;
      const dy = (event.clientY - drag.startY) / drag.scaleY;

      if (drag.mode === 'pending') {
        const distance = Math.hypot(dx, dy);
        if (distance < 5) return;
        drag.mode = drag.handle ? 'resize' : 'move';
      }

      if (drag.mode === 'move') {
        const left = clamp(
          drag.startLeft + dx,
          0,
          drag.canvasWidth - drag.startWidth,
        );
        const top = clamp(
          drag.startTop + dy,
          0,
          drag.canvasHeight - drag.startHeight,
        );

        onElementChangeRef.current(drag.elementId, {
          positionX: left,
          positionY: top,
        });
      }

      if (drag.mode === 'resize') {
        const { left, top, width, height } = getResizeBounds({
          dx,
          dy,
          handle: drag.handle,
          maintainAspectRatio: selectedElementRef.current?.maintainAspectRatio,
        });

        onElementChangeRef.current(drag.elementId, {
          positionX: left,
          positionY: top,
          width,
          height,
        });
      }
    },
    [clamp, getResizeBounds],
  );

  const handlePointerUp = useCallback(() => {
    cleanupPointerEventsRef.current();
  }, []);

  const cleanupPointerEvents = useCallback(() => {
    if (dragRef.current.target && dragRef.current.pointerId !== null) {
      dragRef.current.target.releasePointerCapture?.(dragRef.current.pointerId);
    }

    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
    dragRef.current = INITIAL_DRAG_STATE;
    document.body.style.cursor = '';
  }, [handlePointerMove, handlePointerUp]);

  cleanupPointerEventsRef.current = cleanupPointerEvents;

  const handlePointerDown = useCallback(
    (event, element, handle = null) => {
      if (isEditingText) return;
      if (selectedElementRef.current?.id !== element.id) return;

      event.stopPropagation();
      const canvasMetrics = getCanvasMetrics();
      if (!canvasMetrics) return;

      dragRef.current = {
        mode: 'pending',
        elementId: element.id,
        handle,
        startX: event.clientX,
        startY: event.clientY,
        startLeft: element.positionX,
        startTop: element.positionY,
        startWidth: element.width,
        startHeight: element.height,
        canvasRect: canvasMetrics.canvasRect,
        canvasWidth: canvasMetrics.canvasWidth,
        canvasHeight: canvasMetrics.canvasHeight,
        scaleX: canvasMetrics.scaleX,
        scaleY: canvasMetrics.scaleY,
        pointerId: event.pointerId,
        target: event.currentTarget,
      };

      event.currentTarget.setPointerCapture?.(event.pointerId);
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
    },
    [getCanvasMetrics, handlePointerMove, handlePointerUp, isEditingText],
  );

  useEffect(() => {
    if (isEditingText && editorRef.current) {
      editorRef.current.focus();
      const length = editorRef.current.value.length;
      editorRef.current.setSelectionRange(length, length);
    }
  }, [isEditingText]);

  useEffect(() => cleanupPointerEvents, [cleanupPointerEvents]);

  return {
    canvasRef,
    editorRef,
    handlePointerDown,
  };
}
