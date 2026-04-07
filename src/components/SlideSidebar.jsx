export default function SlideSidebar({ slides, selectedSlideIndex, onSelectSlide }) {
  return (
    <aside className="edit-sidebar">
      <div className="edit-sidebar-header">Diapositivas</div>
      <div className="slide-list">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            className={`slide-list-item ${selectedSlideIndex === index ? 'active' : ''}`}
            onClick={() => onSelectSlide(index)}
          >
            <span className="slide-item-number">{index + 1}</span>
            <strong>{slide.title || 'Sin título'}</strong>
            <p>{slide.elements?.[0]?.content?.text || 'Sin contenido'}</p>
          </button>
        ))}
      </div>
    </aside>
  );
}
