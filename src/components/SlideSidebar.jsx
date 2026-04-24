import { useSlideSidebar } from '../hooks/useSlideSidebar';
import SlideSidebarItem from './SlideSidebarItem';
import '../styles/slideSidebar.css';

export default function SlideSidebar({
  slides,
  selectedSlideIndex,
  onSelectSlide,
  presentationData,
  onPresentationChange,
}) {
  const {
    closeMenu,
    draggedIndex,
    handleAddSlide,
    handleDeleteSlide,
    handleDragEnd,
    handleDragStart,
    handleDrop,
    handleDuplicateSlide,
    handleMenuToggle,
    openMenuIndex,
  } = useSlideSidebar({
    onPresentationChange,
    onSelectSlide,
    presentationData,
    selectedSlideIndex,
  });

  return (
    <aside className="edit-sidebar">
      <div className="edit-sidebar-header">Diapositivas</div>
      <div className="slide-list">
        {slides.map((slide, index) => (
          <SlideSidebarItem
            key={slide.id}
            draggedIndex={draggedIndex}
            handleAddSlide={handleAddSlide}
            handleDeleteSlide={handleDeleteSlide}
            handleDragEnd={handleDragEnd}
            handleDragStart={handleDragStart}
            handleDrop={handleDrop}
            handleDuplicateSlide={handleDuplicateSlide}
            handleMenuToggle={handleMenuToggle}
            index={index}
            isLastSlide={index === slides.length - 1}
            isMenuOpen={openMenuIndex === index}
            onCloseMenu={closeMenu}
            onSelectSlide={onSelectSlide}
            selectedSlideIndex={selectedSlideIndex}
            slide={slide}
          />
        ))}
      </div>
    </aside>
  );
}
