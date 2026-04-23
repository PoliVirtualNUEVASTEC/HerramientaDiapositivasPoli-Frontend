import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/preview.css';
import {
  Bold,
  CaseSensitive,
  CheckCircle,
  Italic,
  Loader,
  Underline,
} from 'lucide-react';
import { toast } from 'sonner';
import EditToolbar from '../components/EditToolbar';
import SlideCanvas from '../components/SlideCanvas';
import SlideSidebar from '../components/SlideSidebar';
import { usePresentationLoader } from '../hooks/usePresentationLoader';
import { deleteElement, updateElement } from '../services/slideElementService';
import { usePresentationStore } from '../store/presentationStore';

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
  const [elementSnapshotsById, setElementSnapshotsById] = useState({});
  const selectedElementSnapshot = selectedElement?.id
    ? elementSnapshotsById[selectedElement.id]
    : null;
  const [activeToolbarButtons, setActiveToolbarButtons] = useState([]);
  const [fontSizeValue, setFontSizeValue] = useState(16);
  const [isEditingText, setIsEditingText] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'

  const imageBorderRadiusSteps = [0, 5, 10, 20, 50];

  const getBorderRadiusValue = () => {
    const radius = selectedElement?.styles?.borderRadius;
    if (!radius) return 0;
    const parsed = parseInt(radius.toString().replace('%', ''), 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const updateSelectedElement = useCallback(
    (updates) => {
      if (!selectedElement) return;
      const updatedElement = { ...selectedElement, ...updates };
      setSelectedElement(updatedElement);
      // Actualizar en presentation local
      const updatedPresentation = { ...presentationData };
      const slide = updatedPresentation.slides[selectedSlideIndex];
      const elementIndex = slide.elements.findIndex(
        (el) => el.id === selectedElement.id,
      );
      if (elementIndex !== -1) {
        slide.elements[elementIndex] = updatedElement;
        setPresentationData(updatedPresentation);
        setPresentationInStore(updatedPresentation);
      }
    },
    [
      selectedElement,
      presentationData,
      selectedSlideIndex,
      setPresentationInStore,
    ],
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
    list: [{ Icon: CaseSensitive, label: 'Mayús' }],
    image: [],
  };

  const isElementDirty = (element, snapshot) => {
    if (!element || !snapshot) return false;
    return JSON.stringify(element) !== JSON.stringify(snapshot);
  };

  const createSnapshot = (element) =>
    element ? JSON.parse(JSON.stringify(element)) : null;

  const handleElementClick = async (element) => {
    if (['title', 'text', 'list', 'image'].includes(element.type)) {
      if (selectedElement?.id === element.id) {
        if (['title', 'text', 'list'].includes(element.type)) {
          setIsEditingText(true);
        }
        return;
      }

      if (
        selectedElement &&
        selectedElement.id !== element.id &&
        isElementDirty(selectedElement, selectedElementSnapshot)
      ) {
        saveElementToDatabase(selectedElement);
      }

      setSelectedElement(element);
      setElementSnapshotsById((current) => ({
        ...current,
        [element.id]: createSnapshot(element),
      }));
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
  };

  const handleToolbarToggle = (buttonLabel) => {
    setActiveToolbarButtons((current) =>
      current.includes(buttonLabel)
        ? current.filter((item) => item !== buttonLabel)
        : [...current, buttonLabel],
    );
  };

  const handleAspectRatioToggle = () => {
    if (!selectedElement) return;
    updateSelectedElement({
      maintainAspectRatio: !selectedElement.maintainAspectRatio,
    });
  };

  const handleBorderRadiusCycle = () => {
    if (!selectedElement) return;
    const currentValue = getBorderRadiusValue();
    const currentIndex = imageBorderRadiusSteps.indexOf(currentValue);
    const nextIndex = (currentIndex + 1) % imageBorderRadiusSteps.length;
    const nextValue = imageBorderRadiusSteps[nextIndex];

    updateSelectedElement({
      styles: {
        ...selectedElement.styles,
        borderRadius: `${nextValue}%`,
      },
    });
  };

  const handleListTypeToggle = () => {
    if (!selectedElement || selectedElement.type !== 'list') return;
    const types = ['unordered', 'ordered', 'checkmark'];
    const currentType = selectedElement.content?.listType || 'unordered';
    const currentIndex = types.indexOf(currentType);
    const nextType = types[(currentIndex + 1) % types.length];
    updateSelectedElement({
      content: { ...selectedElement.content, listType: nextType },
    });
  };

  const handleElementPosition = (action) => {
    if (!selectedElement) return;
    const updatedPresentation = { ...presentationData };
    const slide = updatedPresentation.slides[selectedSlideIndex];
    const elements = slide.elements;

    elements.forEach((el, idx) => {
      if (el.zIndex === undefined) {
        el.zIndex = idx;
      }
    });

    const currentElement = elements.find((el) => el.id === selectedElement.id);
    if (!currentElement) return;

    let newZIndex = currentElement.zIndex;
    const maxZIndex = Math.max(...elements.map((el) => el.zIndex || 0));
    const minZIndex = Math.min(...elements.map((el) => el.zIndex || 0));

    if (action === 'front') {
      newZIndex = maxZIndex + 1;
    } else if (action === 'back') {
      newZIndex = minZIndex - 1;
    } else if (action === 'forward') {
      newZIndex = currentElement.zIndex + 1;
    } else if (action === 'backward') {
      newZIndex = currentElement.zIndex - 1;
    }

    updateSelectedElement({ zIndex: newZIndex });
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

  const handleCanvasClick = async () => {
    if (
      selectedElement &&
      isElementDirty(selectedElement, selectedElementSnapshot)
    ) {
      await saveElementToDatabase(selectedElement);
    }
    setSelectedElement(null);
    setActiveToolbarButtons([]);
    setIsEditingText(false);
  };

  const saveElementToDatabase = useCallback(async (element) => {
    if (!element || !element.id) return false;
    const elementSnapshot = JSON.parse(JSON.stringify(element));
    try {
      setSyncStatus('saving');
      await updateElement(
        element.id,
        element.type,
        element.content,
        element.positionX,
        element.positionY,
        element.width,
        element.height,
        element.styles,
        element.zIndex,
      );
      setSyncStatus('saved');
      setElementSnapshotsById((current) => ({
        ...current,
        [element.id]: elementSnapshot,
      }));
      setTimeout(() => setSyncStatus('idle'), 2000);
      return true;
    } catch (error) {
      console.error('Error saving element:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
      return false;
    }
  }, []);

  const deleteSelectedElement = useCallback(async () => {
    if (!selectedElement || !selectedElement.id) return false;
    try {
      setSyncStatus('saving');
      await deleteElement(selectedElement.id);

      // Remove element locally
      const updatedPresentation = { ...presentationData };
      const slide = updatedPresentation.slides[selectedSlideIndex];
      slide.elements = (slide.elements || []).filter(
        (el) => el.id !== selectedElement.id,
      );
      setPresentationData(updatedPresentation);
      setPresentationInStore(updatedPresentation);

      setElementSnapshotsById((current) => {
        const copy = { ...current };
        delete copy[selectedElement.id];
        return copy;
      });

      setSelectedElement(null);
      setActiveToolbarButtons([]);
      setIsEditingText(false);

      setSyncStatus('saved');
      setTimeout(() => setSyncStatus('idle'), 2000);
      return true;
    } catch (error) {
      console.error('Error deleting element:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
      return false;
    }
  }, [
    selectedElement,
    selectedSlideIndex,
    presentationData,
    setPresentationInStore,
  ]);

  const handleBackClick = async () => {
    if (
      selectedElement &&
      isElementDirty(selectedElement, selectedElementSnapshot)
    ) {
      const saved = await saveElementToDatabase(selectedElement);
      if (!saved) return;
      toast.success('Presentación guardada.', {
        style: { backgroundColor: 'green', color: 'white' },
      });
    }
    navigate(-1);
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
        currentStyles.fontWeight !== updatedStyles.fontWeight ||
        currentStyles.fontStyle !== updatedStyles.fontStyle ||
        currentStyles.textDecoration !== updatedStyles.textDecoration ||
        currentStyles.textTransform !== updatedStyles.textTransform
      ) {
        updateSelectedElement({ styles: updatedStyles });
      }
    }
  }, [activeToolbarButtons, selectedElement, updateSelectedElement]);

  useEffect(() => {
    if (presentation) {
      const normalizedPresentation =
        normalizePresentationTemplates(presentation);
      setPresentationData(normalizedPresentation);
      setSelectedSlideIndex(0);
    }
  }, [presentation]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <>
  useEffect(() => {
    const saveOnSlideChange = async () => {
      if (
        selectedElement &&
        isElementDirty(selectedElement, selectedElementSnapshot)
      ) {
        await saveElementToDatabase(selectedElement);
      }
      setSelectedElement(null);
      setActiveToolbarButtons([]);
      setIsEditingText(false);
    };

    saveOnSlideChange();
  }, [selectedSlideIndex]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Reset on slide change
  useEffect(() => {
    setElementSnapshotsById({});
  }, [selectedSlideIndex]);

  // Escuchar teclas Backspace/Delete para borrar elemento seleccionado
  useEffect(() => {
    const onKeyDown = (e) => {
      if (isEditingText) return;
      if (!selectedElement) return;
      const tag = document.activeElement?.tagName;
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        document.activeElement?.isContentEditable
      )
        return;
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        deleteSelectedElement();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [selectedElement, isEditingText, deleteSelectedElement]);

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
    presentationData?.slides?.[selectedSlideIndex] ||
    presentationData?.slides?.[0];

  return (
    <div className="preview-container">
      <Navbar />

      <div className="preview-header">
        <button className="back-btn" onClick={handleBackClick}>
          ← Volver
        </button>

        <div className="header-title-group">
          <h1>Editar: {presentation.title}</h1>
          {syncStatus === 'saving' && (
            <div className="sync-status saving">
              <Loader size={16} className="spin" />
              <span>Guardando...</span>
            </div>
          )}
          {syncStatus === 'saved' && (
            <div className="sync-status saved">
              <CheckCircle size={16} />
              <span>Guardado</span>
            </div>
          )}
          {syncStatus === 'error' && (
            <div className="sync-status error">
              <span>Error al guardar</span>
            </div>
          )}
        </div>

        <span className="slide-count">{presentation.slides.length} slides</span>
      </div>

      <EditToolbar
        key={selectedElement?.id}
        selectedElement={selectedElement}
        toolbarButtons={toolbarButtons}
        activeToolbarButtons={activeToolbarButtons}
        onToggleButton={handleToolbarToggle}
        fontSizeValue={fontSizeValue}
        onFontSizeChange={handleFontSizeChange}
        onColorChange={handleColorChange}
        maintainAspectRatio={selectedElement?.maintainAspectRatio}
        onAspectRatioToggle={handleAspectRatioToggle}
        borderRadiusValue={getBorderRadiusValue()}
        onBorderRadiusCycle={handleBorderRadiusCycle}
        onPositionAction={handleElementPosition}
        onListTypeToggle={handleListTypeToggle}
      />

      <div className="edit-layout">
        {presentationData && (
          <>
            <SlideSidebar
              slides={presentationData.slides}
              selectedSlideIndex={selectedSlideIndex}
              onSelectSlide={setSelectedSlideIndex}
              presentationData={presentationData}
              setPresentationData={setPresentationData}
              setPresentationInStore={setPresentationInStore}
              setSelectedSlideIndex={setSelectedSlideIndex}
              normalizePresentationTemplates={normalizePresentationTemplates}
            />

            <main className="edit-main-preview">
              <SlideCanvas
                key={selectedSlide?.id}
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
          </>
        )}
      </div>
    </div>
  );
}
