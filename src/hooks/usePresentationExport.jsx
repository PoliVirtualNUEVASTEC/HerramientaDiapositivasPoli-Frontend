import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

const SLIDE_WIDTH = 960;
const SLIDE_HEIGHT = 540;
const PPTX_WIDTH = 13.333;
const PPTX_HEIGHT = 7.5;
const PX_TO_INCH = PPTX_WIDTH / SLIDE_WIDTH;
const PX_TO_POINT = 72 / 96;
const PDF_EXPORT_SCALE = 3;
const PDF_IMAGE_QUALITY = 0.88;

const sanitizeFileName = (title) => {
  const normalizedTitle = (title || 'presentacion').trim();

  return normalizedTitle
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
};

const toInches = (value = 0) => Number((value * PX_TO_INCH).toFixed(3));
const toPoints = (value = 16) => Number((value * PX_TO_POINT).toFixed(2));

const normalizeHexColor = (color, fallback = '000000') => {
  if (!color || typeof color !== 'string') return fallback;

  const sanitized = color.replace('#', '').trim();

  if (sanitized.length === 3) {
    return sanitized
      .split('')
      .map((char) => char + char)
      .join('')
      .toUpperCase();
  }

  if (sanitized.length === 6) {
    return sanitized.toUpperCase();
  }

  return fallback;
};

const getBackgroundColor = (background) =>
  background?.color || background?.value || null;

const getBackgroundImageUrl = (background) =>
  background?.url || background?.image || null;

const isBold = (fontWeight) => {
  if (typeof fontWeight === 'number') return fontWeight >= 600;
  return fontWeight === 'bold';
};

const normalizeTextContent = (text, styles) => {
  const baseText = String(text ?? '');

  if (styles?.textTransform === 'uppercase') {
    return baseText.toUpperCase();
  }

  return baseText;
};

const waitForNodeImages = async (node) => {
  const images = Array.from(node.querySelectorAll('img'));

  await Promise.all(
    images.map(
      (image) =>
        new Promise((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }

          image.addEventListener('load', resolve, { once: true });
          image.addEventListener('error', resolve, { once: true });
        }),
    ),
  );
};

const waitForNextPaint = () =>
  new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const getTextBoxOptions = (element) => {
  const styles = element.styles || {};
  const fontFamily =
    styles.fontFamily && styles.fontFamily !== 'inherit'
      ? styles.fontFamily
      : undefined;
  const textBoxOptions = {
    x: toInches(element.positionX),
    y: toInches(element.positionY),
    w: toInches(element.width),
    h: toInches(element.height),
    margin: 0,
    valign: 'top',
    fit: 'shrink',
    wrap: true,
    isTextBox: true,
    bold: isBold(styles.fontWeight),
    italic: styles.fontStyle === 'italic',
    underline: styles.textDecoration === 'underline',
    align: ['left', 'center', 'right', 'justify'].includes(styles.textAlign)
      ? styles.textAlign
      : 'left',
    fontSize: toPoints(styles.fontSize || 16),
    color: normalizeHexColor(styles.color, '111827'),
  };

  if (fontFamily) {
    textBoxOptions.fontFace = fontFamily;
  }

  if (typeof styles.lineHeight === 'number') {
    if (styles.lineHeight > 0 && styles.lineHeight <= 9.99) {
      textBoxOptions.lineSpacingMultiple = styles.lineHeight;
    } else {
      textBoxOptions.lineSpacing = toPoints(styles.lineHeight);
    }
  }

  return textBoxOptions;
};

const getListRuns = (element) => {
  const items = element.content?.items || [];
  const listType = element.content?.listType || 'unordered';
  const bullet =
    listType === 'ordered'
      ? { type: 'number' }
      : listType === 'checkmark'
        ? { code: '2610' }
        : true;

  return items.map((item, index) => ({
    text: normalizeTextContent(item, element.styles),
    options: {
      bullet,
      breakLine: index < items.length - 1,
    },
  }));
};

export function usePresentationExport(presentation) {
  const slideNodesRef = useRef(new Map());
  const imageDataCacheRef = useRef(new Map());
  const [exportingFormat, setExportingFormat] = useState(null);

  const registerSlideNode = useCallback((slideId, node) => {
    if (!slideId) return;

    if (node) {
      slideNodesRef.current.set(slideId, node);
      return;
    }

    slideNodesRef.current.delete(slideId);
  }, []);

  const getImageSource = useCallback(async (url) => {
    if (!url) return null;

    const cachedPromise = imageDataCacheRef.current.get(url);
    if (cachedPromise) {
      return cachedPromise;
    }

    const nextPromise = (async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Image fetch failed with status ${response.status}`);
        }

        const blob = await response.blob();
        const dataUrl = await blobToDataUrl(blob);
        return { data: dataUrl };
      } catch (error) {
        console.warn('Falling back to remote image path for export:', error);
        return { path: url };
      }
    })();

    imageDataCacheRef.current.set(url, nextPromise);
    return nextPromise;
  }, []);

  const captureSlides = useCallback(async () => {
    const { default: html2canvas } = await import('html2canvas');
    const slides = presentation?.slides ?? [];

    if (!slides.length) {
      throw new Error('No hay diapositivas para exportar.');
    }

    await document.fonts?.ready;
    await waitForNextPaint();

    const capturedSlides = [];

    for (const slide of slides) {
      const slideNode = slideNodesRef.current.get(slide.id);

      if (!slideNode) {
        throw new Error('No se pudo preparar una diapositiva para exportar.');
      }

      await waitForNodeImages(slideNode);

      const canvas = await html2canvas(slideNode, {
        scale: PDF_EXPORT_SCALE,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 0,
        width: SLIDE_WIDTH,
        height: SLIDE_HEIGHT,
      });

      capturedSlides.push({
        dataUrl: canvas.toDataURL('image/jpeg', PDF_IMAGE_QUALITY),
      });
    }

    return capturedSlides;
  }, [presentation]);

  const exportToPdf = useCallback(async () => {
    if (!presentation) return;

    try {
      setExportingFormat('pdf');
      const [{ jsPDF }, capturedSlides] = await Promise.all([
        import('jspdf'),
        captureSlides(),
      ]);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [SLIDE_WIDTH, SLIDE_HEIGHT],
      });

      capturedSlides.forEach((capturedSlide, index) => {
        if (index > 0) {
          pdf.addPage([SLIDE_WIDTH, SLIDE_HEIGHT], 'landscape');
        }

        pdf.addImage(
          capturedSlide.dataUrl,
          'JPEG',
          0,
          0,
          SLIDE_WIDTH,
          SLIDE_HEIGHT,
          undefined,
          'MEDIUM',
        );
      });

      pdf.save(`${sanitizeFileName(presentation.title)}.pdf`);
      toast.success('PDF exportado correctamente');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('No se pudo exportar la presentación en PDF');
    } finally {
      setExportingFormat(null);
    }
  }, [captureSlides, presentation]);

  const exportToPptx = useCallback(async () => {
    if (!presentation) return;

    try {
      setExportingFormat('pptx');
      const { default: PptxGenJS } = await import('pptxgenjs');
      const pptx = new PptxGenJS();

      pptx.layout = 'LAYOUT_WIDE';
      pptx.author = 'Herramienta Diapositivas Poli';
      pptx.company = 'Herramienta Diapositivas Poli';
      pptx.subject = presentation.title;
      pptx.title = presentation.title;
      pptx.lang = 'es-CO';

      for (const presentationSlide of presentation.slides) {
        const pptSlide = pptx.addSlide();
        const backgroundColor = getBackgroundColor(
          presentationSlide.background,
        );
        const backgroundImageUrl = getBackgroundImageUrl(
          presentationSlide.background,
        );

        if (backgroundColor) {
          pptSlide.background = {
            color: normalizeHexColor(backgroundColor, 'FFFFFF'),
          };
        }

        if (backgroundImageUrl) {
          const backgroundImage = await getImageSource(backgroundImageUrl);
          if (backgroundImage) {
            pptSlide.background = backgroundImage;
          }
        }

        const sortedElements = [...(presentationSlide.elements ?? [])].sort(
          (firstElement, secondElement) =>
            (firstElement.zIndex || 0) - (secondElement.zIndex || 0),
        );

        for (const element of sortedElements) {
          if (element.type === 'title' || element.type === 'text') {
            pptSlide.addText(
              normalizeTextContent(element.content?.text, element.styles),
              getTextBoxOptions(element),
            );
            continue;
          }

          if (element.type === 'list') {
            pptSlide.addText(getListRuns(element), getTextBoxOptions(element));
            continue;
          }

          if (element.type === 'image') {
            const imageUrl =
              element.content?.resolvedImage.url ||
              element.content?.resolvedImage.image;
            const imageSource = await getImageSource(imageUrl);

            if (!imageSource) continue;

            pptSlide.addImage({
              ...imageSource,
              x: toInches(element.positionX),
              y: toInches(element.positionY),
              w: toInches(element.width),
              h: toInches(element.height),
            });
          }
        }
      }

      await pptx.writeFile({
        fileName: `${sanitizeFileName(presentation.title)}.pptx`,
      });
      toast.success('PPTX exportado correctamente');
    } catch (error) {
      console.error('Error exporting PPTX:', error);
      toast.error('No se pudo exportar la presentación en PPTX');
    } finally {
      setExportingFormat(null);
    }
  }, [getImageSource, presentation]);

  return {
    exportToPdf,
    exportToPptx,
    exportingFormat,
    isExporting: exportingFormat !== null,
    registerSlideNode,
  };
}
