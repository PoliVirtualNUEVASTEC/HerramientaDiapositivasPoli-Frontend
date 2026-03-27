import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/preview.css';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getPresentation } from '../services/presentationService';

export default function PresentationPreview() {
  const navigate = useNavigate();
  const [presentation, setPresentation] = useState(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  const TEMPLATE_BASE =
    'https://TU_PROJECT_ID.supabase.co/storage/v1/object/public/images/slides_1/';

  useEffect(() => {
    const loadPresentation = async () => {
      try {
        setLoading(true);
        const data = await getPresentation(id);
        setPresentation(data);
        setLoading(false);
      } catch {
        toast.error('error cargando presentación');
        setLoading(false);
      }
    };
    loadPresentation();
  }, [id]);

  if (loading) {
    return (
      <div className="preview-error">
        <p>loading...</p>
      </div>
    );
  }

  if (!presentation) {
    return (
      <div className="preview-error">
        <p>No se encontró la presentación.</p>
        <button onClick={() => navigate('/dashboard')}>Volver</button>
      </div>
    );
  }

  const getTemplate = (slide, index, totalSlides) => {
    if (index === 0) {
      return TEMPLATE_BASE + 'title_slide.jpg';
    }

    if (index === totalSlides - 1) {
      return TEMPLATE_BASE + 'end_slide.jpg';
    }

    const hasImage = slide.elements.some((el) => el.type === 'image');

    if (hasImage) {
      return TEMPLATE_BASE + 'slide2.jpg';
    }

    return TEMPLATE_BASE + 'slide1.jpg';
  };

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
      return (
        <h2 key={el.id} style={style}>
          {el.content.text}
        </h2>
      );
    }

    if (el.type === 'text') {
      return (
        <p key={el.id} style={style}>
          {el.content.text}
        </p>
      );
    }

    if (el.type === 'list') {
      return (
        <ul key={el.id} style={style}>
          {el.content.items.map((item, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <>
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }

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
            <div className="slide-number">
              Slide {index + 1} — {slide.title}
            </div>

            <div
              className="slide-canvas"
              style={{
                backgroundImage: `url(${getTemplate(slide, index, presentation.slides.length)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {slide.elements.map((el) => renderElement(el))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
