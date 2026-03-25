import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/preview.css';

export default function PresentationPreview() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const presentation = state?.presentation;

  if (!presentation) {
    return (
      <div className="preview-error">
        <p>No se encontró la presentación.</p>
        <button onClick={() => navigate('/dashboard')}>Volver</button>
      </div>
    );
  }

  const renderElement = (el) => {
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
    };

    if (el.type === 'title') {
      return <h2 key={el.id} style={style}>{el.content.text}</h2>;
    }

    if (el.type === 'text') {
      return <p key={el.id} style={style}>{el.content.text}</p>;
    }

    if (el.type === 'list') {
      return (
        <ul key={el.id} style={style}>
          {el.content.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }

    // Imágenes las saltamos por ahora
    return null;
  };

  return (
    <div className="preview-container">
      <Navbar />

      <div className="preview-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Volver
        </button>
        <h1>{presentation.title}</h1>
        <span className="slide-count">{presentation.slides.length} slides</span>
      </div>

      <div className="slides-wrapper">
        {presentation.slides.map((slide, index) => (
          <div key={slide.id} className="slide-container">
            <div className="slide-number">Slide {index + 1} — {slide.title}</div>
            <div
              className="slide-canvas"
              style={{ backgroundColor: slide.background?.value || '#ffffff' }}
            >
              {slide.elements.map((el) => renderElement(el))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}