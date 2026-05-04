import { useSlideCanvasInteractions } from '../hooks/useSlideCanvasInteractions';
import SlideElementRenderer from './SlideElementRenderer';

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
  const { canvasRef, editorRef, handlePointerDown } =
    useSlideCanvasInteractions({
      isEditingText,
      onElementChange,
      selectedElement,
    });

  const sortedElements = [
    ...(Array.isArray(selectedSlide?.elements) ? selectedSlide.elements : []),
  ].sort((firstElement, secondElement) => {
    return (firstElement.zIndex || 0) - (secondElement.zIndex || 0);
  });

  return (
    <div
      ref={canvasRef}
      className="slide-canvas"
      style={{
        ...getTemplate,
        position: 'relative',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '600px',
      }}
      onClick={onCanvasClick}
    >
      {sortedElements.map((element) => (
        <SlideElementRenderer
          key={element.id}
          editorRef={editorRef}
          element={element}
          handlePointerDown={handlePointerDown}
          isEditingText={isEditingText}
          onEditBlur={onEditBlur}
          onElementChange={onElementChange}
          onElementClick={onElementClick}
          selectedElement={selectedElement}
        />
      ))}
    </div>
  );
}
