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

  useEffect(() => {
    if (isEditingText && editorRef.current) {
      editorRef.current.focus();
      const length = editorRef.current.value.length;
      editorRef.current.setSelectionRange(length, length);
    }
  }, [isEditingText]);

  const renderElement = (el) => {
    const isSelected = selectedElement?.id === el.id;
    const style = {
      position: 'absolute',
      left: el.positionX,
      top: el.positionY,
      width: el.width,
      height: el.height,
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
      outline: isSelected ? '2px dashed #1a4d1a' : 'none',
      boxSizing: 'border-box',
    };

    const handleClick = (e) => {
      e.stopPropagation();
      if (['title', 'text', 'list'].includes(el.type)) {
        onElementClick(el);
      }
    };

    if (el.type === 'title') {
      if (isEditingText && isSelected) {
        return (
          <textarea
            key={el.id}
            ref={editorRef}
            value={el.content?.text || ''}
            onChange={(e) =>
              onElementChange(el.id, {
                content: { ...el.content, text: e.target.value },
              })
            }
            onBlur={onEditBlur}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
              ...style,
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
          />
        );
      }
      return (
        <h2
          key={el.id}
          style={{ ...style, cursor: 'pointer' }}
          onClick={handleClick}
        >
          {el.content?.text}
        </h2>
      );
    }

    if (el.type === 'text') {
      if (isEditingText && isSelected) {
        return (
          <textarea
            key={el.id}
            ref={editorRef}
            value={el.content?.text || ''}
            onChange={(e) =>
              onElementChange(el.id, {
                content: { ...el.content, text: e.target.value },
              })
            }
            onBlur={onEditBlur}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
              ...style,
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
          />
        );
      }
      return (
        <p
          key={el.id}
          style={{ ...style, cursor: 'pointer' }}
          onClick={handleClick}
        >
          {el.content?.text}
        </p>
      );
    }

    if (el.type === 'list') {
      return (
        <ul
          key={el.id}
          style={{ ...style, cursor: 'pointer' }}
          onClick={handleClick}
        >
          {el.content.items.map((item) => (
            <li key={`${el.id}-${item}`}>{item}</li>
          ))}
        </ul>
      );
    }

    if (el.type === 'image') {
      return (
        <img
          key={el.id}
          src={el.content?.url || el.content?.image}
          alt=""
          style={style}
        />
      );
    }

    return null;
  };

  return (
    <div
      className="slide-canvas"
      style={{
        ...getTemplate,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      onClick={onCanvasClick}
    >
      {selectedSlide.elements?.map((el) => renderElement(el))}
    </div>
  );
}
