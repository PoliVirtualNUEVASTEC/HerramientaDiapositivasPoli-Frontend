import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/preview.css';
import {
  Bold,
  CaseSensitive,
  Italic,
  List,
  ListChecks,
  ListOrdered,
  Underline,
} from 'lucide-react';
import EditToolbar from '../components/EditToolbar';
import SlideCanvas from '../components/SlideCanvas';
import SlideSidebar from '../components/SlideSidebar';
import { usePresentationLoader } from '../hooks/usePresentationLoader';
import { usePresentationStore } from '../store/presentationStore';

export default function EditPresentation() {
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
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [selectedElement, setSelectedElement] = useState(null);
  const [activeToolbarButtons, setActiveToolbarButtons] = useState([]);
  const [fontSizeValue, setFontSizeValue] = useState(16);

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

  const toolbarButtons = {
    title: [
      { Icon: Bold, label: 'Negrita' },
      { Icon: Italic, label: 'Cursiva' },
      { Icon: Underline, label: 'Subrayado' },
      { Icon: CaseSensitive, label: 'Mayús' },
    ],
    text: [
      { Icon: Bold, label: 'Negrita' },
      { Icon: Italic, label: 'Cursiva' },
      { Icon: Underline, label: 'Subrayado' },
      { Icon: CaseSensitive, label: 'Mayús' },
    ],
    list: [
      { Icon: List, label: 'Lista' },
      { Icon: ListOrdered, label: 'Ordenada' },
      { Icon: ListChecks, label: 'Viñetas' },
      { Icon: CaseSensitive, label: 'Mayús' },
    ],
  };

  const handleElementClick = (element) => {
    if (['title', 'text', 'list'].includes(element.type)) {
      setSelectedElement(element);
      setActiveToolbarButtons([]);
      setFontSizeValue(element.styles?.fontSize ?? 16);
    }
  };

  const handleToolbarToggle = (buttonLabel) => {
    setActiveToolbarButtons((current) =>
      current.includes(buttonLabel)
        ? current.filter((item) => item !== buttonLabel)
        : [...current, buttonLabel],
    );
  };

  const handleCanvasClick = () => {
    setSelectedElement(null);
    setActiveToolbarButtons([]);
  };

  const handleFontSizeChange = (delta) => {
    setFontSizeValue((current) => Math.max(8, Math.min(64, current + delta)));
  };

  const handleColorChange = (_color) => {};

  useEffect(() => {
    if (presentation) {
      setSelectedSlideIndex(0);
    }
  }, [presentation]);

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

      <EditToolbar
        selectedElement={selectedElement}
        toolbarButtons={toolbarButtons}
        activeToolbarButtons={activeToolbarButtons}
        onToggleButton={handleToolbarToggle}
        fontSizeValue={fontSizeValue}
        onFontSizeChange={handleFontSizeChange}
        onColorChange={handleColorChange}
      />

      <div className="edit-layout">
        <SlideSidebar
          slides={presentation.slides}
          selectedSlideIndex={selectedSlideIndex}
          onSelectSlide={setSelectedSlideIndex}
        />

        <main className="edit-main-preview">
          <SlideCanvas
            selectedSlide={selectedSlide}
            backgroundImageUrl={getTemplate(
              selectedSlide,
              selectedSlideIndex,
              presentation.slides.length,
            )}
            onElementClick={handleElementClick}
            selectedElement={selectedElement}
            onCanvasClick={handleCanvasClick}
          />
        </main>
      </div>
    </div>
  );
}
