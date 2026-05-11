import { Copy, MoreVertical, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const MENU_WIDTH = 150;
const MENU_OFFSET = 8;
const VIEWPORT_MARGIN = 12;

export default function SlideSidebarItem({
  draggedIndex,
  handleAddSlide,
  handleDeleteSlide,
  handleDragEnd,
  handleDragStart,
  handleDrop,
  handleDuplicateSlide,
  handleMenuToggle,
  index,
  isLastSlide,
  isMenuOpen,
  onCloseMenu,
  onSelectSlide,
  selectedSlideIndex,
  slide,
}) {
  const actionsRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isMenuOpen) return;

    const updateMenuPosition = () => {
      const actionsRect = actionsRef.current?.getBoundingClientRect();
      if (!actionsRect) return;

      const nextLeft = Math.min(
        actionsRect.right + MENU_OFFSET,
        window.innerWidth - MENU_WIDTH - VIEWPORT_MARGIN,
      );
      const nextTop = Math.min(
        actionsRect.top,
        window.innerHeight - VIEWPORT_MARGIN,
      );

      setMenuPosition({
        left: Math.max(VIEWPORT_MARGIN, nextLeft),
        top: Math.max(VIEWPORT_MARGIN, nextTop),
      });
    };

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [isMenuOpen]);

  const menuDropdown =
    isMenuOpen && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="slide-menu-dropdown"
            data-slide-menu-root="true"
            style={menuPosition}
          >
            <button
              type="button"
              className="slide-menu-item"
              onClick={(event) => {
                event.stopPropagation();
                void handleDuplicateSlide(slide, index);
                onCloseMenu();
              }}
            >
              <Copy size={14} />
              Duplicar
            </button>
            <button
              type="button"
              className="slide-menu-item delete"
              onClick={(event) => {
                event.stopPropagation();
                void handleDeleteSlide(slide.id, index);
                onCloseMenu();
              }}
            >
              <Trash2 size={14} />
              Eliminar
            </button>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="slide-list-block">
      <div
        className={`slide-list-item ${selectedSlideIndex === index ? 'active' : ''} ${draggedIndex === index ? 'dragging' : ''}`}
        draggable
        onDragStart={() => handleDragStart(index)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={() => handleDrop(index)}
        onDragEnd={handleDragEnd}
        onClick={() => onSelectSlide(index)}
      >
        <div className="slide-list-item-content">
          <span className="slide-item-number">{index + 1}</span>
          <div className="slide-item-text">
            <strong
              className="slide-item-title"
              title={slide.title || 'Sin título'}
            >
              {slide.title || 'Sin título'}
            </strong>
            <p
              className="slide-item-summary"
              title={slide.elements?.[0]?.content?.text || 'Sin contenido'}
            >
              {slide.elements?.[0]?.content?.text || 'Sin contenido'}
            </p>
          </div>
        </div>

        <div
          ref={actionsRef}
          className={`slide-item-actions ${isMenuOpen ? 'open' : ''}`}
          data-slide-menu-root="true"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="slide-menu-trigger"
            onClick={(event) => handleMenuToggle(event, index)}
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div
        className={`slide-insert-row ${isLastSlide ? 'always-visible' : ''}`}
      >
        <button
          type="button"
          className="slide-insert-button"
          onClick={() => void handleAddSlide(index + 1)}
        >
          <Plus size={16} />
        </button>
      </div>

      {menuDropdown}
    </div>
  );
}
