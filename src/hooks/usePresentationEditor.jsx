import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  createElement,
  deleteElement,
  updateElement,
} from '../services/slideElementService';
import {
  createElementSnapshot,
  getActiveToolbarButtons,
  getElementBorderRadiusValue,
  IMAGE_BORDER_RADIUS_STEPS,
  isElementDirty,
  TOOLBAR_BUTTONS,
} from '../utils/presentationEditor';
import { normalizePresentationTemplates } from '../utils/presentationTemplates';

export function usePresentationEditor({
  navigate,
  presentation,
  setPresentationInStore,
}) {
  const [presentationData, setPresentationData] = useState(
    presentation ?? null,
  );
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [selectedElement, setSelectedElement] = useState(null);
  const [elementSnapshotsById, setElementSnapshotsById] = useState({});
  const [activeToolbarButtons, setActiveToolbarButtons] = useState([]);
  const [fontSizeValue, setFontSizeValue] = useState(16);
  const [isEditingText, setIsEditingText] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');

  const presentationDataRef = useRef(presentationData);
  const selectedSlideIndexRef = useRef(selectedSlideIndex);
  const selectedElementRef = useRef(selectedElement);
  const elementSnapshotsByIdRef = useRef(elementSnapshotsById);
  const syncStatusTimeoutRef = useRef(null);

  presentationDataRef.current = presentationData;
  selectedSlideIndexRef.current = selectedSlideIndex;
  selectedElementRef.current = selectedElement;
  elementSnapshotsByIdRef.current = elementSnapshotsById;

  const clearSyncStatusTimeout = useCallback(() => {
    if (syncStatusTimeoutRef.current) {
      clearTimeout(syncStatusTimeoutRef.current);
      syncStatusTimeoutRef.current = null;
    }
  }, []);

  const setTimedSyncStatus = useCallback(
    (status, timeoutMs) => {
      clearSyncStatusTimeout();
      setSyncStatus(status);

      if (!timeoutMs) return;

      syncStatusTimeoutRef.current = setTimeout(() => {
        setSyncStatus('idle');
        syncStatusTimeoutRef.current = null;
      }, timeoutMs);
    },
    [clearSyncStatusTimeout],
  );

  const resetSelection = useCallback(() => {
    selectedElementRef.current = null;
    setSelectedElement(null);
    setActiveToolbarButtons([]);
    setIsEditingText(false);
  }, []);

  const setPresentationState = useCallback(
    (nextPresentation) => {
      presentationDataRef.current = nextPresentation;
      setPresentationData(nextPresentation);
      setPresentationInStore(nextPresentation);
    },
    [setPresentationInStore],
  );

  const updateSelectedElement = useCallback(
    (updates) => {
      const currentElement = selectedElementRef.current;
      const currentPresentation = presentationDataRef.current;
      const currentSlideIndex = selectedSlideIndexRef.current;

      if (!currentElement || !currentPresentation) return;

      const updatedElement = { ...currentElement, ...updates };
      selectedElementRef.current = updatedElement;
      setSelectedElement(updatedElement);

      const nextSlides = currentPresentation.slides.map((slide, slideIndex) => {
        if (slideIndex !== currentSlideIndex) return slide;

        return {
          ...slide,
          elements: (slide.elements ?? []).map((element) =>
            element.id === currentElement.id ? updatedElement : element,
          ),
        };
      });

      setPresentationState({ ...currentPresentation, slides: nextSlides });
    },
    [setPresentationState],
  );

  const saveElementToDatabase = useCallback(
    async (element) => {
      if (!element?.id) return false;

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

        setElementSnapshotsById((current) => ({
          ...current,
          [element.id]: createElementSnapshot(element),
        }));
        setTimedSyncStatus('saved', 2000);
        return true;
      } catch (error) {
        console.error('Error saving element:', error);
        setTimedSyncStatus('error', 3000);
        return false;
      }
    },
    [setTimedSyncStatus],
  );

  const saveCurrentElementIfDirty = useCallback(async () => {
    const currentElement = selectedElementRef.current;
    const currentSnapshot = currentElement?.id
      ? elementSnapshotsByIdRef.current[currentElement.id]
      : null;

    if (!isElementDirty(currentElement, currentSnapshot)) {
      return true;
    }

    return saveElementToDatabase(currentElement);
  }, [saveElementToDatabase]);

  const deleteSelectedElement = useCallback(async () => {
    const currentElement = selectedElementRef.current;
    const currentPresentation = presentationDataRef.current;
    const currentSlideIndex = selectedSlideIndexRef.current;

    if (!currentElement?.id || !currentPresentation) return false;

    try {
      setSyncStatus('saving');
      await deleteElement(currentElement.id);

      const nextSlides = currentPresentation.slides.map((slide, slideIndex) => {
        if (slideIndex !== currentSlideIndex) return slide;

        return {
          ...slide,
          elements: (slide.elements ?? []).filter(
            (element) => element.id !== currentElement.id,
          ),
        };
      });

      setPresentationState({ ...currentPresentation, slides: nextSlides });
      setElementSnapshotsById((current) => {
        const nextSnapshots = { ...current };
        delete nextSnapshots[currentElement.id];
        return nextSnapshots;
      });
      resetSelection();
      setTimedSyncStatus('saved', 2000);
      return true;
    } catch (error) {
      console.error('Error deleting element:', error);
      setTimedSyncStatus('error', 3000);
      return false;
    }
  }, [resetSelection, setPresentationState, setTimedSyncStatus]);

  const handleElementClick = useCallback(
    (element) => {
      if (!['title', 'text', 'list', 'image'].includes(element.type)) return;

      const currentElement = selectedElementRef.current;

      if (currentElement?.id === element.id) {
        if (['title', 'text', 'list'].includes(element.type)) {
          setIsEditingText(true);
        }
        return;
      }

      if (currentElement && currentElement.id !== element.id) {
        const currentSnapshot =
          elementSnapshotsByIdRef.current[currentElement.id];
        if (isElementDirty(currentElement, currentSnapshot)) {
          void saveElementToDatabase(currentElement);
        }
      }

      selectedElementRef.current = element;
      setSelectedElement(element);
      setElementSnapshotsById((current) => ({
        ...current,
        [element.id]: createElementSnapshot(element),
      }));
      setActiveToolbarButtons(getActiveToolbarButtons(element));
      setFontSizeValue(element.styles?.fontSize ?? 16);
      setIsEditingText(false);
    },
    [saveElementToDatabase],
  );

  const handleToolbarToggle = useCallback((buttonLabel) => {
    setActiveToolbarButtons((current) =>
      current.includes(buttonLabel)
        ? current.filter((item) => item !== buttonLabel)
        : [...current, buttonLabel],
    );
  }, []);

  const handleAspectRatioToggle = useCallback(() => {
    const currentElement = selectedElementRef.current;
    if (!currentElement) return;

    updateSelectedElement({
      maintainAspectRatio: !currentElement.maintainAspectRatio,
    });
  }, [updateSelectedElement]);

  const handleBorderRadiusCycle = useCallback(() => {
    const currentElement = selectedElementRef.current;
    if (!currentElement) return;

    const currentValue = getElementBorderRadiusValue(currentElement);
    const currentIndex = IMAGE_BORDER_RADIUS_STEPS.indexOf(currentValue);
    const nextIndex = (currentIndex + 1) % IMAGE_BORDER_RADIUS_STEPS.length;
    const nextValue = IMAGE_BORDER_RADIUS_STEPS[nextIndex];

    updateSelectedElement({
      styles: {
        ...currentElement.styles,
        borderRadius: `${nextValue}%`,
      },
    });
  }, [updateSelectedElement]);

  const handleListTypeToggle = useCallback(() => {
    const currentElement = selectedElementRef.current;
    if (!currentElement || currentElement.type !== 'list') return;

    const types = ['unordered', 'ordered', 'checkmark'];
    const currentType = currentElement.content?.listType || 'unordered';
    const currentIndex = types.indexOf(currentType);
    const nextType = types[(currentIndex + 1) % types.length];

    updateSelectedElement({
      content: { ...currentElement.content, listType: nextType },
    });
  }, [updateSelectedElement]);

  const handleElementPosition = useCallback(
    (action) => {
      const currentElement = selectedElementRef.current;
      const currentPresentation = presentationDataRef.current;
      const currentSlideIndex = selectedSlideIndexRef.current;

      if (!currentElement || !currentPresentation) return;

      const slide = currentPresentation.slides[currentSlideIndex];
      const elements = (slide?.elements ?? []).map((element, index) => ({
        ...element,
        zIndex: element.zIndex ?? index,
      }));
      const currentSlideElement = elements.find(
        (element) => element.id === currentElement.id,
      );

      if (!currentSlideElement) return;

      let nextZIndex = currentSlideElement.zIndex;
      const maxZIndex = Math.max(...elements.map((element) => element.zIndex));
      const minZIndex = Math.min(...elements.map((element) => element.zIndex));

      if (action === 'front') nextZIndex = maxZIndex + 1;
      if (action === 'back') nextZIndex = minZIndex - 1;
      if (action === 'forward') nextZIndex = currentSlideElement.zIndex + 1;
      if (action === 'backward') nextZIndex = currentSlideElement.zIndex - 1;

      updateSelectedElement({ zIndex: nextZIndex });
    },
    [updateSelectedElement],
  );

  const handleFontSizeChange = useCallback(
    (delta) => {
      const nextSize = Math.max(8, Math.min(64, fontSizeValue + delta));
      setFontSizeValue(nextSize);

      const currentElement = selectedElementRef.current;
      if (!currentElement) return;

      updateSelectedElement({
        styles: { ...currentElement.styles, fontSize: nextSize },
      });
    },
    [fontSizeValue, updateSelectedElement],
  );

  const handleElementChange = useCallback(
    (elementId, updates) => {
      if (selectedElementRef.current?.id !== elementId) return;
      updateSelectedElement(updates);
    },
    [updateSelectedElement],
  );

  const handleColorChange = useCallback(
    (color) => {
      const currentElement = selectedElementRef.current;
      if (!currentElement) return;

      updateSelectedElement({
        styles: { ...currentElement.styles, color },
      });
    },
    [updateSelectedElement],
  );

  const handleCanvasClick = useCallback(async () => {
    await saveCurrentElementIfDirty();
    resetSelection();
  }, [resetSelection, saveCurrentElementIfDirty]);

  const handleBackClick = useCallback(async () => {
    const currentElement = selectedElementRef.current;
    const saved = await saveCurrentElementIfDirty();

    if (!saved) return;

    if (currentElement) {
      toast.success('Presentación guardada.', {
        style: { backgroundColor: 'green', color: 'white' },
      });
    }

    navigate(-1);
  }, [navigate, saveCurrentElementIfDirty]);

  const handleAddText = async (type) => {
    try {
      const slideId = selectedSlide.id;

      const newElement = await createElement(
        slideId,
        type,
        { text: type === 'title' ? 'Título' : 'Texto' },
        50,
        type === 'title' ? 50 : 120,
        300,
        type === 'title' ? 80 : 60,
        type === 'title'
          ? { fontSize: 32, fontWeight: 'bold' }
          : { fontSize: 18 },
        0,
      );

      //ACTUALIZAR ESTADO LOCAL
      const updatedPresentation = { ...presentationData };

      updatedPresentation.slides[selectedSlideIndex].elements.push(newElement);

      setPresentationData(updatedPresentation);
      setPresentationInStore(updatedPresentation);
    } catch (error) {
      console.error('Error creando texto:', error);
    }
  };

  const handleAddList = async (listType) => {
    try {
      const slideId = selectedSlide.id;

      const newElement = await createElement(
        slideId,
        'list',
        {
          type: listType, // bullet | number | check
          items: ['Elemento 1', 'Elemento 2', 'Elemento 3'],
        },
        50,
        150,
        300,
        120,
        { fontSize: 18 },
        0,
      );

      const updatedPresentation = { ...presentationData };
      const slide = updatedPresentation.slides[selectedSlideIndex];

      if (!slide.elements) {
        slide.elements = [];
      }

      slide.elements.push(newElement);

      setPresentationData(updatedPresentation);
      setPresentationInStore(updatedPresentation);
    } catch (error) {
      console.error('Error creando lista:', error);
    }
  };

  const handleAddImage = async (url) => {
    try {
      const slideId = selectedSlide.id;

      const newElement = await createElement(
        slideId,
        'image',
        { url },
        80,
        120,
        280,
        180,
        { borderRadius: '0%' },
        0,
      );

      const updatedPresentation = { ...presentationData };
      const slide = updatedPresentation.slides[selectedSlideIndex];

      if (!slide.elements) {
        slide.elements = [];
      }

      slide.elements.push(newElement);

      setPresentationData(updatedPresentation);
      setPresentationInStore(updatedPresentation);
    } catch (error) {
      console.error('Error creando imagen:', error);
    }
  };

  useEffect(() => {
    if (!selectedElement) return;

    const updatedStyles = {
      ...selectedElement.styles,
      fontWeight: activeToolbarButtons.includes('Negrita') ? 'bold' : 'normal',
      fontStyle: activeToolbarButtons.includes('Cursiva') ? 'italic' : 'normal',
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
  }, [activeToolbarButtons, selectedElement, updateSelectedElement]);

  useEffect(() => {
    if (!presentation) return;

    const normalizedPresentation = normalizePresentationTemplates(presentation);
    setPresentationState(normalizedPresentation);
    setSelectedSlideIndex(0);
    elementSnapshotsByIdRef.current = {};
    setElementSnapshotsById({});
    resetSelection();
    setFontSizeValue(16);
    clearSyncStatusTimeout();
    setSyncStatus('idle');
  }, [
    clearSyncStatusTimeout,
    presentation,
    resetSelection,
    setPresentationState,
  ]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <>
  useEffect(() => {
    const handleSlideChange = async () => {
      await saveCurrentElementIfDirty();
      resetSelection();
      elementSnapshotsByIdRef.current = {};
      setElementSnapshotsById({});
    };

    void handleSlideChange();
  }, [resetSelection, saveCurrentElementIfDirty, selectedSlideIndex]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (isEditingText || !selectedElementRef.current) return;

      const activeElement = document.activeElement;
      const tagName = activeElement?.tagName;

      if (
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        activeElement?.isContentEditable
      ) {
        return;
      }

      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault();
        void deleteSelectedElement();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [deleteSelectedElement, isEditingText]);

  useEffect(() => () => clearSyncStatusTimeout(), [clearSyncStatusTimeout]);

  const selectedSlide =
    presentationData?.slides?.[selectedSlideIndex] ||
    presentationData?.slides?.[0] ||
    null;

  return {
    activeToolbarButtons,
    borderRadiusValue: getElementBorderRadiusValue(selectedElement),
    fontSizeValue,
    handleAspectRatioToggle,
    handleBackClick,
    handleBorderRadiusCycle,
    handleCanvasClick,
    handleColorChange,
    handleElementChange,
    handleElementClick,
    handleElementPosition,
    handleFontSizeChange,
    handleListTypeToggle,
    handleToolbarToggle,
    isEditingText,
    presentationData,
    selectedElement,
    selectedSlide,
    selectedSlideIndex,
    setIsEditingText,
    setPresentationState,
    setSelectedSlideIndex,
    handleAddText,
    handleAddImage,
    handleAddList,
    syncStatus,
    toolbarButtons: TOOLBAR_BUTTONS,
  };
}
