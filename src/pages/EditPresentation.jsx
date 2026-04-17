import { useCallback, useEffect, useState } from 'react';
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
  const [isEditingText, setIsEditingText] = useState(false);

  const updateSelectedElement = useCallback(
    (updates) => {
      if (!selectedElement) return;
      const updatedElement = { ...selectedElement, ...updates };
      setSelectedElement(updatedElement);
      // Actualizar en presentation
      const updatedPresentation = { ...presentation };
      const slide = updatedPresentation.slides[selectedSlideIndex];
      const elementIndex = slide.elements.findIndex(
        (el) => el.id === selectedElement.id,
      );
      if (elementIndex !== -1) {
        slide.elements[elementIndex] = updatedElement;
        setPresentationInStore(updatedPresentation);
      }
    },
    [selectedElement, presentation, selectedSlideIndex, setPresentationInStore],
  );

  const getTemplate = (slide) => {
    const background = slide.background;
    if (background.type === 'color')
      return { backgroundColor: background.color };
    if (background.type === 'image')
      return { backgroundImage: `url("${background.url}")` };
    return {};
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
      if (selectedElement?.id === element.id) {
        setIsEditingText(true);
      } else {
        setSelectedElement(element);
        // Inicializar activeToolbarButtons basado en estilos
        const active = [];
        if (element.styles?.fontWeight === 'bold') active.push('Negrita');
        if (element.styles?.fontStyle === 'italic') active.push('Cursiva');
        if (element.styles?.textDecoration === 'underline')
          active.push('Subrayado');
        if (element.styles?.textTransform === 'uppercase') active.push('Mayús');
        setActiveToolbarButtons(active);
        setFontSizeValue(element.styles?.fontSize ?? 16);
        setIsEditingText(false);
      }
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
    setIsEditingText(false);
  };

  const handleFontSizeChange = (delta) => {
    const newSize = Math.max(8, Math.min(64, fontSizeValue + delta));
    setFontSizeValue(newSize);
    if (selectedElement) {
      updateSelectedElement({
        styles: { ...selectedElement.styles, fontSize: newSize },
      });
    }
  };

  const handleElementChange = (elementId, updates) => {
    if (selectedElement?.id === elementId) {
      updateSelectedElement(updates);
    }
  };

  const handleColorChange = (color) => {
    if (selectedElement) {
      updateSelectedElement({
        styles: { ...selectedElement.styles, color },
      });
    }
  };

  useEffect(() => {
    if (selectedElement) {
      const updatedStyles = {
        ...selectedElement.styles,
        fontWeight: activeToolbarButtons.includes('Negrita')
          ? 'bold'
          : 'normal',
        fontStyle: activeToolbarButtons.includes('Cursiva')
          ? 'italic'
          : 'normal',
        textDecoration: activeToolbarButtons.includes('Subrayado')
          ? 'underline'
          : 'none',
        textTransform: activeToolbarButtons.includes('Mayús')
          ? 'uppercase'
          : 'none',
      };

      const currentStyles = selectedElement.styles || {};
      if (
        currentStyles.fontWeight === updatedStyles.fontWeight &&
        currentStyles.fontStyle === updatedStyles.fontStyle &&
        currentStyles.textDecoration === updatedStyles.textDecoration &&
        currentStyles.textTransform === updatedStyles.textTransform
      ) {
        return;
      }

      updateSelectedElement({ styles: updatedStyles });
    }
  }, [activeToolbarButtons, selectedElement, updateSelectedElement]);

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
            getTemplate={getTemplate(selectedSlide)}
            onElementClick={handleElementClick}
            selectedElement={selectedElement}
            onCanvasClick={handleCanvasClick}
            isEditingText={isEditingText}
            onElementChange={handleElementChange}
            onEditBlur={() => setIsEditingText(false)}
          />
        </main>
      </div>
    </div>
  );
}
