import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/preview.css';
import { toast } from 'sonner';
import { getPresentation } from '../services/presentationService';
import { usePresentationStore } from '../store/presentationStore';

export default function EditPresentation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const presentationFromStore = usePresentationStore(
    (state) => state.presentation,
  );
  const presentationFromStoreId = presentationFromStore?.id;
  const presentationFromStoreRef = useRef(presentationFromStore);
  presentationFromStoreRef.current = presentationFromStore;
  const setPresentationInStore = usePresentationStore(
    (state) => state.setPresentation,
  );
  const [presentation, setPresentation] = useState(
    presentationFromStore ?? null,
  );
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const TEMPLATE_BASE =
    'https://qftsvgnhxcqdrcarvsiq.supabase.co/storage/v1/object/public/images/slides/';

  const getTemplate = (slide, index, totalSlides) => {
    if (index === 0) {
      return TEMPLATE_BASE.concat('title_slide.jpg');
    }

    if (index === totalSlides - 1) {
      return TEMPLATE_BASE.concat('end_slide.jpg');
    }

    const hasImage =
      slide?.elements?.some((el) => el.type === 'image') ?? false;

    if (hasImage) {
      return TEMPLATE_BASE.concat('slide2.jpg');
    }

    return TEMPLATE_BASE.concat('slide1.jpg');
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
      borderRadius: el.styles?.borderRadius,
    };

    if (el.type === 'title') {
      return (
        <h2 key={el.id} style={style}>
          {el.content?.text}
        </h2>
      );
    }

    if (el.type === 'text') {
      return (
        <p key={el.id} style={style}>
          {el.content?.text}
        </p>
      );
    }

    if (el.type === 'list') {
      return (
        <ul key={el.id} style={style}>
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

  useEffect(() => {
    const loadPresentation = async () => {
      if (String(presentationFromStoreId) === String(id)) {
        setPresentation(presentationFromStoreRef.current);
        setSelectedSlideIndex(0);
        return;
      }

      try {
        setLoading(true);
        const data = await getPresentation(id);
        setPresentation(data);
        setPresentationInStore(data);
        setSelectedSlideIndex(0);
      } catch {
        toast.error('Error cargando la presentación');
      } finally {
        setLoading(false);
      }
    };

    loadPresentation();
  }, [id, presentationFromStoreId, setPresentationInStore]);

  if (loading || !presentation) {
    return (
      <div className="preview-container">
        <Navbar />
        <div className="preview-error">
          <p>Cargando presentación...</p>
        </div>
      </div>
    );
  }

  const selectedSlide =
    presentation.slides[selectedSlideIndex] || presentation.slides[0];

  return (
    <div className="preview-container">
      <Navbar />

      <div className="preview-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Volver
        </button>

        <h1>Editar: {presentation.title}</h1>

        <span className="slide-count">{presentation.slides.length} slides</span>
      </div>

      <div className="edit-layout">
        <aside className="edit-sidebar">
          <div className="edit-sidebar-header">Diapositivas</div>
          <div className="slide-list">
            {presentation.slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className={`slide-list-item ${
                  selectedSlideIndex === index ? 'active' : ''
                }`}
                onClick={() => setSelectedSlideIndex(index)}
              >
                <span className="slide-item-number">{index + 1}</span>
                <strong>{slide.title || 'Sin título'}</strong>
                <p>{slide.elements?.[0]?.content?.text || 'Sin contenido'}</p>
              </button>
            ))}
          </div>
        </aside>

        <main className="edit-main-preview">
          <div
            className="slide-canvas"
            style={{
              backgroundImage: `url(${getTemplate(
                selectedSlide,
                selectedSlideIndex,
                presentation.slides.length,
              )})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {selectedSlide.elements?.map((el) => renderElement(el))}
          </div>
        </main>
      </div>
    </div>
  );
}
