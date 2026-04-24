import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/preview.css';
import { usePresentationLoader } from '../hooks/usePresentationLoader';
import { usePresentationStore } from '../store/presentationStore';

export default function PresentationPreview() {
  const navigate = useNavigate();
  const { id } = useParams();
  const presentationFromStore = usePresentationStore(
    (state) => state.presentation,
  );
  const setPresentationInStore = usePresentationStore(
    (state) => state.setPresentation,
  );
  const { presentation, loading } = usePresentationLoader(
    id,
    presentationFromStore,
    setPresentationInStore,
  );

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

  const handleEdit = () => {
    navigate(`/edit/${id}`);
  };

  const getTemplate = (slide) => {
    const background = slide?.background;
    if (!background) return {};

    if (background.type === 'color')
      return { backgroundColor: background.color };
    if (background.type === 'image')
      return { backgroundImage: `url("${background.url}")` };
    return {};
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
      <div className="preview-actions">
        <button className="edit-btn" onClick={handleEdit}>
          Editar presentación
        </button>
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
                ...getTemplate(slide),
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* no renderizar contenido en la última slide */}
              {index !== presentation.slides.length - 1 &&
                slide?.elements?.map((el) => renderElement(el))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
