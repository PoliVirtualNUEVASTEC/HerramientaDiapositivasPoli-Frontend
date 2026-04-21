import { useEffect, useRef } from 'react';

export default function SlideCanvas({
  selectedSlide,
  getTemplate,
  onElementClick,
  selectedElement,
  onCanvasClick,
  isEditingText,
  onElementChange,
  onEditBlur,
}) {
  const editorRef = useRef(null);
  const canvasRef = useRef(null);
  const dragRef = useRef({
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
    pointerId: null,
    target: null,
  });

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const getResizeBounds = ({ dx, dy, handle, maintainAspectRatio }) => {
    const { startLeft, startTop, startWidth, startHeight, canvasRect } =
      dragRef.current;
    const minWidth = 40;
    const minHeight = 30;
    let left = startLeft;
    let top = startTop;
    let width = startWidth;
    let height = startHeight;
    const maxWidth = canvasRect.width;
    const maxHeight = canvasRect.height;

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
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (drag.mode === 'idle' || !drag.canvasRect) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (drag.mode === 'pending') {
      const distance = Math.hypot(dx, dy);
      if (distance < 5) return;
      drag.mode = drag.handle ? 'resize' : 'move';
    }

    if (drag.mode === 'move') {
      const left = clamp(
        drag.startLeft + dx,
        0,
        drag.canvasRect.width - drag.startWidth,
      );
      const top = clamp(
        drag.startTop + dy,
        0,
        drag.canvasRect.height - drag.startHeight,
      );
      onElementChange(drag.elementId, { positionX: left, positionY: top });
    }

    if (drag.mode === 'resize') {
      const { left, top, width, height } = getResizeBounds({
        dx,
        dy,
        handle: drag.handle,
        maintainAspectRatio: selectedElement?.maintainAspectRatio,
      });
      onElementChange(drag.elementId, {
        positionX: left,
        positionY: top,
        width,
        height,
      });
    }
  };

  const cleanupPointerEvents = () => {
    if (dragRef.current.target && dragRef.current.pointerId !== null) {
      dragRef.current.target.releasePointerCapture?.(dragRef.current.pointerId);
    }
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
    dragRef.current.mode = 'idle';
    dragRef.current.elementId = null;
    dragRef.current.handle = null;
    dragRef.current.pointerId = null;
    dragRef.current.target = null;
    document.body.style.cursor = '';
  };

  const handlePointerUp = () => {
    cleanupPointerEvents();
  };

  const handlePointerDown = (event, el, handle = null) => {
    if (isEditingText) return;
    if (selectedElement?.id !== el.id) return;
    event.stopPropagation();
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    dragRef.current = {
      mode: 'pending',
      elementId: el.id,
      handle,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: el.positionX,
      startTop: el.positionY,
      startWidth: el.width,
      startHeight: el.height,
      canvasRect,
      pointerId: event.pointerId,
      target: event.currentTarget,
    };

    event.currentTarget.setPointerCapture?.(event.pointerId);
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  useEffect(() => {
    if (isEditingText && editorRef.current) {
      editorRef.current.focus();
      const length = editorRef.current.value.length;
      editorRef.current.setSelectionRange(length, length);
    }
  }, [isEditingText]);

  const renderElement = (el) => {
    const isSelected = selectedElement?.id === el.id;

    const handleClick = (e) => {
      e.stopPropagation();
      if (['title', 'text', 'list', 'image'].includes(el.type)) {
        onElementClick(el);
      }
    };

    const wrapperStyle = {
      position: 'absolute',
      left: el.positionX,
      top: el.positionY,
      width: el.width,
      height: el.height,
      outline: isSelected ? '2px dashed #1a4d1a' : 'none',
      boxSizing: 'border-box',
      cursor: isSelected && !isEditingText ? 'move' : 'default',
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'stretch',
    };

    const innerStyle = {
      width: '100%',
      height: '100%',
      fontFamily: el.styles?.fontFamily || 'inherit',
      fontSize: el.styles?.fontSize,
      fontWeight: el.styles?.fontWeight,
      fontStyle: el.styles?.fontStyle,
      textDecoration: el.styles?.textDecoration,
      textTransform: el.styles?.textTransform,
      color: el.styles?.color,
      textAlign: el.styles?.textAlign,
      lineHeight: el.styles?.lineHeight,
      whiteSpace: 'pre-wrap',
      overflowWrap: 'break-word',
      borderRadius: el.styles?.borderRadius,
      boxSizing: 'border-box',
    };

    const resizeHandles =
      isSelected && !isEditingText
        ? [
            { position: 'top-left', left: 0, top: 0, cursor: 'nwse-resize' },
            { position: 'top-right', right: 0, top: 0, cursor: 'nesw-resize' },
            {
              position: 'bottom-left',
              left: 0,
              bottom: 0,
              cursor: 'nesw-resize',
            },
            {
              position: 'bottom-right',
              right: 0,
              bottom: 0,
              cursor: 'nwse-resize',
            },
          ]
        : [];

    const renderWrapper = (content) => (
      <div
        key={el.id}
        style={wrapperStyle}
        onClick={(event) => {
          event.stopPropagation();
          handleClick(event);
        }}
        onPointerDown={(event) => handlePointerDown(event, el)}
      >
        {content}
        {resizeHandles.map((handle) => (
          <div
            key={handle.position}
            data-handle={handle.position}
            onPointerDown={(event) => {
              event.stopPropagation();
              handlePointerDown(event, el, handle.position);
            }}
            onClick={(event) => event.stopPropagation()}
            style={{
              position: 'absolute',
              width: 10,
              height: 10,
              background: 'white',
              border: '1px solid #1a4d1a',
              borderRadius: 2,
              cursor: handle.cursor,
              zIndex: 10,
              ...('left' in handle ? { left: handle.left } : {}),
              ...('right' in handle ? { right: handle.right } : {}),
              ...('top' in handle ? { top: handle.top } : {}),
              ...('bottom' in handle ? { bottom: handle.bottom } : {}),
            }}
          />
        ))}
      </div>
    );

    if (el.type === 'title') {
      if (isEditingText && isSelected) {
        return renderWrapper(
          <textarea
            ref={editorRef}
            value={el.content?.text || ''}
            onChange={(e) =>
              onElementChange(el.id, {
                content: { ...el.content, text: e.target.value },
              })
            }
            onBlur={onEditBlur}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
              ...innerStyle,
              border: 'none',
              background: 'transparent',
              outline: '2px dashed #1a4d1a',
              resize: 'none',
              padding: 0,
              margin: 0,
              textAlign: el.styles?.textAlign || 'left',
              whiteSpace: 'pre-wrap',
              overflow: 'hidden',
            }}
          />,
        );
      }
      return renderWrapper(
        <h2 style={{ ...innerStyle, cursor: 'pointer' }} onClick={handleClick}>
          {el.content?.text}
        </h2>,
      );
    }

    if (el.type === 'text') {
      if (isEditingText && isSelected) {
        return renderWrapper(
          <textarea
            ref={editorRef}
            value={el.content?.text || ''}
            onChange={(e) =>
              onElementChange(el.id, {
                content: { ...el.content, text: e.target.value },
              })
            }
            onBlur={onEditBlur}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
              ...innerStyle,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              resize: 'none',
              padding: 0,
              margin: 0,
              textAlign: el.styles?.textAlign || 'left',
              whiteSpace: 'pre-wrap',
              overflow: 'hidden',
            }}
          />,
        );
      }
      return renderWrapper(
        <p style={{ ...innerStyle, cursor: 'pointer' }} onClick={handleClick}>
          {el.content?.text}
        </p>,
      );
    }

    if (el.type === 'list') {
      return renderWrapper(
        <ul style={{ ...innerStyle, cursor: 'pointer' }} onClick={handleClick}>
          {el.content.items.map((item) => (
            <li key={`${el.id}-${item}`}>{item}</li>
          ))}
        </ul>,
      );
    }

    if (el.type === 'image') {
      return renderWrapper(
        <img
          style={{ ...innerStyle, objectFit: 'fill' }}
          src={el.content?.url || el.content?.image}
          alt=""
          draggable={false}
        />,
      );
    }

    return null;
  };

  return (
    <div
      ref={canvasRef}
      className="slide-canvas"
      style={{
        ...getTemplate,
        position: 'relative',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '600px',
      }}
      onClick={onCanvasClick}
    >
      {[
        ...(Array.isArray(selectedSlide?.elements)
          ? selectedSlide.elements
          : []),
      ]
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
        .map((el) => renderElement(el))}
    </div>
  );
}
