const RESIZE_HANDLES = [
  {
    position: 'top-left',
    placement: { left: 0, top: 0 },
    cursor: 'nwse-resize',
  },
  {
    position: 'top-right',
    placement: { right: 0, top: 0 },
    cursor: 'nesw-resize',
  },
  {
    position: 'bottom-left',
    placement: { left: 0, bottom: 0 },
    cursor: 'nesw-resize',
  },
  {
    position: 'bottom-right',
    placement: { right: 0, bottom: 0 },
    cursor: 'nwse-resize',
  },
];

const CHECKBOX_SYMBOL = '\u2610';
const BULLET_SYMBOL = '\u2022';

const getWrapperStyle = ({ element, isSelected, isEditingText }) => ({
  position: 'absolute',
  left: element.positionX,
  top: element.positionY,
  width: element.width,
  height: element.height,
  outline: isSelected ? '2px dashed #1a4d1a' : 'none',
  boxSizing: 'border-box',
  cursor: isSelected && !isEditingText ? 'move' : 'default',
  display: 'flex',
  alignItems: 'stretch',
  justifyContent: 'stretch',
});

const getInnerStyle = (element) => ({
  width: '100%',
  height: '100%',
  fontFamily: element.styles?.fontFamily || 'inherit',
  fontSize: element.styles?.fontSize,
  fontWeight: element.styles?.fontWeight,
  fontStyle: element.styles?.fontStyle,
  textDecoration: element.styles?.textDecoration,
  textTransform: element.styles?.textTransform,
  color: element.styles?.color,
  textAlign: element.styles?.textAlign,
  lineHeight: element.styles?.lineHeight,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'break-word',
  borderRadius: element.styles?.borderRadius,
  boxSizing: 'border-box',
});

const getListMarker = (listType, index) => {
  if (listType === 'ordered') return `${index + 1}.`;
  if (listType === 'checkmark') return CHECKBOX_SYMBOL;
  return BULLET_SYMBOL;
};

const getRenderedListStyle = (listType) => {
  if (listType === 'ordered') return { listStyleType: 'decimal' };
  if (listType === 'checkmark') return { listStyleType: 'none' };
  return { listStyleType: 'disc' };
};

function SlideTextEditor({
  editorRef,
  element,
  innerStyle,
  onEditBlur,
  onElementChange,
  outline,
}) {
  return (
    <textarea
      ref={editorRef}
      value={element.content?.text || ''}
      onChange={(event) =>
        onElementChange(element.id, {
          content: { ...element.content, text: event.target.value },
        })
      }
      onBlur={onEditBlur}
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      style={{
        ...innerStyle,
        border: 'none',
        background: 'transparent',
        outline,
        resize: 'none',
        padding: 0,
        margin: 0,
        textAlign: element.styles?.textAlign || 'left',
        whiteSpace: 'pre-wrap',
        overflow: 'hidden',
      }}
    />
  );
}

function SlideListEditor({ element, innerStyle, onElementChange }) {
  const listType = element.content?.listType || 'unordered';
  const items = element.content?.items || [];

  const handleListKeyDown = (event, itemIndex) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const newItems = [...items];
      newItems.splice(itemIndex + 1, 0, '');
      onElementChange(element.id, {
        content: { ...element.content, items: newItems },
      });

      setTimeout(() => {
        const inputs = document.querySelectorAll(
          `[data-list-item-input="${element.id}"]`,
        );
        if (inputs[itemIndex + 1]) {
          inputs[itemIndex + 1].focus();
        }
      }, 0);
    } else if (
      (event.key === 'Backspace' || event.key === 'Delete') &&
      event.target.value === ''
    ) {
      event.preventDefault();
      if (items.length > 1) {
        const newItems = items.filter((_, index) => index !== itemIndex);
        onElementChange(element.id, {
          content: { ...element.content, items: newItems },
        });
      }
    }
  };

  const handleItemChange = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    onElementChange(element.id, {
      content: { ...element.content, items: newItems },
    });
  };

  return (
    <div
      style={{
        ...innerStyle,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      {items.map((item, index) => (
        <div
          key={`${element.id}-item-${index}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              flexShrink: 0,
              fontFamily: innerStyle.fontFamily,
              fontSize: innerStyle.fontSize,
            }}
          >
            {getListMarker(listType, index)}
          </span>
          <input
            type="text"
            data-list-item-input={element.id}
            value={item}
            onChange={(event) => handleItemChange(index, event.target.value)}
            onKeyDown={(event) => handleListKeyDown(event, index)}
            onPointerDown={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontFamily: innerStyle.fontFamily,
              fontSize: innerStyle.fontSize,
              fontWeight: innerStyle.fontWeight,
              fontStyle: innerStyle.fontStyle,
              textDecoration: innerStyle.textDecoration,
              color: innerStyle.color,
              textAlign: innerStyle.textAlign || 'left',
              outline: 'none',
              padding: '2px 0',
            }}
            autoFocus={index === 0}
          />
        </div>
      ))}
    </div>
  );
}

export default function SlideElementRenderer({
  editorRef,
  element,
  handlePointerDown,
  isEditingText,
  onEditBlur,
  onElementChange,
  onElementClick,
  selectedElement,
}) {
  const isSelected = selectedElement?.id === element.id;
  const innerStyle = getInnerStyle(element);
  const wrapperStyle = getWrapperStyle({
    element,
    isSelected,
    isEditingText,
  });
  const resizeHandles = isSelected && !isEditingText ? RESIZE_HANDLES : [];

  const handleClick = (event) => {
    event.stopPropagation();
    if (['title', 'text', 'list', 'image'].includes(element.type)) {
      onElementClick(element);
    }
  };

  const renderWrapper = (content) => (
    <div
      key={element.id}
      style={wrapperStyle}
      onClick={handleClick}
      onPointerDown={(event) => handlePointerDown(event, element)}
    >
      {content}
      {resizeHandles.map((handle) => (
        <div
          key={handle.position}
          data-handle={handle.position}
          onPointerDown={(event) => {
            event.stopPropagation();
            handlePointerDown(event, element, handle.position);
          }}
          onClick={(event) => event.stopPropagation()}
          style={{
            position: 'absolute',
            width: 10,
            height: 10,
            background: 'transparent',
            cursor: handle.cursor,
            zIndex: 10,
            ...handle.placement,
          }}
        />
      ))}
    </div>
  );

  if (element.type === 'title') {
    if (isEditingText && isSelected) {
      return renderWrapper(
        <SlideTextEditor
          editorRef={editorRef}
          element={element}
          innerStyle={innerStyle}
          onEditBlur={onEditBlur}
          onElementChange={onElementChange}
          outline="2px dashed #1a4d1a"
        />,
      );
    }

    return renderWrapper(
      <h2 style={{ ...innerStyle, cursor: 'pointer' }} onClick={handleClick}>
        {element.content?.text}
      </h2>,
    );
  }

  if (element.type === 'text') {
    if (isEditingText && isSelected) {
      return renderWrapper(
        <SlideTextEditor
          editorRef={editorRef}
          element={element}
          innerStyle={innerStyle}
          onEditBlur={onEditBlur}
          onElementChange={onElementChange}
          outline="none"
        />,
      );
    }

    return renderWrapper(
      <p style={{ ...innerStyle, cursor: 'pointer' }} onClick={handleClick}>
        {element.content?.text}
      </p>,
    );
  }

  if (element.type === 'list') {
    if (isEditingText && isSelected) {
      return renderWrapper(
        <SlideListEditor
          element={element}
          innerStyle={innerStyle}
          onElementChange={onElementChange}
        />,
      );
    }

    const listType = element.content?.listType || 'unordered';
    const items = element.content?.items || [];

    return renderWrapper(
      <ul
        style={{
          ...innerStyle,
          cursor: 'pointer',
          ...getRenderedListStyle(listType),
          paddingLeft: '20px',
        }}
        onClick={handleClick}
      >
        {items.map((item, index) => (
          <li
            key={`${element.id}-item-${index}`}
            style={
              listType === 'checkmark'
                ? {
                    listStyleType: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }
                : {}
            }
          >
            {listType === 'checkmark' && <span>{CHECKBOX_SYMBOL}</span>}
            {listType === 'checkmark' ? (
              <span
                style={{ flex: 1, textAlign: innerStyle.textAlign || 'left' }}
              >
                {item}
              </span>
            ) : (
              item
            )}
          </li>
        ))}
      </ul>,
    );
  }

  if (element.type === 'image') {
    return renderWrapper(
      <img
        style={{ ...innerStyle, objectFit: 'fill' }}
        src={
          element.content?.resolvedImage.url ||
          element.content?.resolvedImage.image
        }
        alt={element.content.resolvedImage.alt}
        draggable={false}
      />,
    );
  }

  return null;
}
