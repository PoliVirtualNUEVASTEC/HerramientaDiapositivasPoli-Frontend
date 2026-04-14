export default function SlideCanvas({
  selectedSlide,
  getTemplate,
  onElementClick,
  selectedElement,
  onCanvasClick,
}) {
  const renderElement = (el) => {
    const isSelected = selectedElement?.id === el.id;
    const style = {
      position: 'absolute',
      left: el.positionX,
      top: el.positionY,
      width: el.width,
      height: el.height,
      fontSize: el.styles?.fontSize,
      fontWeight: el.styles?.fontWeight,
      color: el.styles?.color,
      textAlign: el.styles?.textAlign,
      lineHeight: el.styles?.lineHeight,
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
