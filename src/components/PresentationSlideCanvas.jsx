import { forwardRef } from 'react';

const CHECKBOX_SYMBOL = '\u2610';

const getElementStyle = (element) => ({
  position: 'absolute',
  left: element.positionX,
  top: element.positionY,
  width: element.width,
  height: element.height,
  fontFamily: element.styles?.fontFamily || 'inherit',
  fontSize: element.styles?.fontSize,
  fontWeight: element.styles?.fontWeight,
  fontStyle: element.styles?.fontStyle,
  textDecoration: element.styles?.textDecoration,
  textTransform: element.styles?.textTransform,
  color: element.styles?.color,
  textAlign: element.styles?.textAlign,
  lineHeight: element.styles?.lineHeight,
  borderRadius: element.styles?.borderRadius,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'break-word',
  boxSizing: 'border-box',
});

const getListStyle = (listType) => {
  if (listType === 'ordered') return { listStyleType: 'decimal' };
  if (listType === 'checkmark') return { listStyleType: 'none' };
  return { listStyleType: 'disc' };
};

const renderElement = (element) => {
  const style = getElementStyle(element);

  if (element.type === 'title') {
    return (
      <h2 key={element.id} style={style}>
        {element.content?.text}
      </h2>
    );
  }

  if (element.type === 'text') {
    return (
      <p key={element.id} style={style}>
        {element.content?.text}
      </p>
    );
  }

  if (element.type === 'list') {
    const listType = element.content?.listType || 'unordered';
    const items = element.content?.items || [];

    return (
      <ul
        key={element.id}
        style={{
          ...style,
          ...getListStyle(listType),
          paddingLeft: listType === 'checkmark' ? 0 : 20,
        }}
      >
        {items.map((item, index) => (
          <li
            key={`${element.id}-${index}`}
            style={
              listType === 'checkmark'
                ? {
                    listStyleType: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }
                : undefined
            }
          >
            {listType === 'checkmark' && <span>{CHECKBOX_SYMBOL}</span>}
            {item}
          </li>
        ))}
      </ul>
    );
  }

  if (element.type === 'image') {
    return (
      <img
        key={element.id}
        src={element.content?.url || element.content?.image}
        alt=""
        style={{ ...style, objectFit: 'fill' }}
        crossOrigin="anonymous"
      />
    );
  }

  return null;
};

const PresentationSlideCanvas = forwardRef(function PresentationSlideCanvas(
  { slide },
  ref,
) {
  const background = slide?.background;
  const sortedElements = [...(slide?.elements ?? [])].sort(
    (firstElement, secondElement) =>
      (firstElement.zIndex || 0) - (secondElement.zIndex || 0),
  );

  return (
    <div
      ref={ref}
      className="slide-canvas"
      style={{
        backgroundColor:
          background?.type === 'color'
            ? background.color || background.value
            : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {background?.type === 'image' && (
        <img
          className="slide-canvas-background"
          src={background.url || background.image}
          alt=""
          crossOrigin="anonymous"
        />
      )}
      {sortedElements.map(renderElement)}
    </div>
  );
});

export default PresentationSlideCanvas;
