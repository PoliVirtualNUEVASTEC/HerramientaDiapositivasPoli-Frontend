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

const TEMPLATE_BASE =
  'https://qftsvgnhxcqdrcarvsiq.supabase.co/storage/v1/object/public/images/slides/';

const getTemplateType = (slide, index, totalSlides) => {
  // 1. PRIORIDAD MÁXIMA: Si el slide ya tiene un background definido (clonado o guardado)
  // No importa la posición, debe mantener su tipo para que el CSS/Imagen coincida.
  if (slide?.templateType) {
    return slide.templateType;
  }

  // 2. Si es una slide nueva (sin background previo), usamos la lógica de posición
  if (index === 0) return 'title';
  if (index === totalSlides - 1) return 'end';

  const currentElements = slide?.elements || slide?.SlideElements || [];
  const hasImage = currentElements.some((el) => el.type === 'image');

  return hasImage ? 'image' : 'standard';
};
const getTemplate = (slide, index, totalSlides) => {
  const templateType = getTemplateType(slide, index, totalSlides);

  // Comparamos por tipo de template, no por posición física
  if (templateType === 'title') {
    return TEMPLATE_BASE.concat('title_slide.jpg');
  }

  if (templateType === 'end') {
    return TEMPLATE_BASE.concat('end_slide.jpg');
  }

  if (templateType === 'image') {
    return TEMPLATE_BASE.concat('slide2.jpg');
  }

  return TEMPLATE_BASE.concat('slide1.jpg');
};

const normalizeSlideTemplate = (slide, index, totalSlides) => ({
  ...slide,
  templateType: getTemplateType(slide, index, totalSlides),
});

const normalizePresentationTemplates = (presentationState) => ({
  ...presentationState,
  slides:
    presentationState.slides?.map((slide, index) =>
      normalizeSlideTemplate(slide, index, presentationState.slides.length),
    ) ?? [],
});

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
  const [presentationData, setPresentationData] = useState(
    presentation ?? null,
  );
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [selectedElement, setSelectedElement] = useState(null);
  const [activeToolbarButtons, setActiveToolbarButtons] = useState([]);
  const [fontSizeValue, setFontSizeValue] = useState(16);

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
      const normalizedPresentation =
        normalizePresentationTemplates(presentation);
      setPresentationData(normalizedPresentation);
      setSelectedSlideIndex(0);
    }
  }, [presentation]);

  if (loading || !presentationData) {
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
    presentationData?.slides?.[selectedSlideIndex] ||
    presentationData?.slides?.[0];

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
          slides={presentationData.slides}
          selectedSlideIndex={selectedSlideIndex}
          onSelectSlide={setSelectedSlideIndex}
          // Inyectamos el estado y los setters para que el Sidebar gestione la lógica
          presentationData={presentationData}
          setPresentationData={setPresentationData}
          setPresentationInStore={setPresentationInStore}
          setSelectedSlideIndex={setSelectedSlideIndex}
          normalizePresentationTemplates={normalizePresentationTemplates}
        />

        <main className="edit-main-preview">
          <SlideCanvas
            selectedSlide={selectedSlide}
            backgroundImageUrl={getTemplate(
              selectedSlide,
              selectedSlideIndex,
              presentationData.slides.length,
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
