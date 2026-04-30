const SLIDE_HEIGHT = 540;
const ATTRIBUTION_HEIGHT = 20;
const ATTRIBUTION_OFFSET = 4;

export function isPexelsImageElement(element) {
  return Boolean(
    element?.type === 'image' &&
      element.content?.resolvedImage?.pexelsUrl &&
      element.content?.resolvedImage?.photographer,
  );
}

export function isPexelsAttributionElement(element) {
  return (
    element?.type === 'text' &&
    element.content?.attribution?.source === 'pexels'
  );
}

export function hasPexelsAttributionForImage(elements, imageElement) {
  const imageElementId = imageElement?.id;
  const pexelsUrl = imageElement?.content?.resolvedImage?.pexelsUrl;

  return (elements ?? []).some((element) => {
    if (!isPexelsAttributionElement(element)) return false;

    return (
      element.content?.attribution?.imageElementId === imageElementId ||
      element.content?.attribution?.pexelsUrl === pexelsUrl
    );
  });
}

export function createPexelsAttributionDraft(imageElement, order) {
  if (!isPexelsImageElement(imageElement)) return null;

  const { pexelsUrl, photographer, photographerUrl } =
    imageElement.content.resolvedImage;
  const preferredPositionY =
    (imageElement.positionY ?? 0) +
    (imageElement.height ?? 0) +
    ATTRIBUTION_OFFSET;
  const fallbackPositionY = Math.max(
    ATTRIBUTION_OFFSET,
    (imageElement.positionY ?? 0) -
      ATTRIBUTION_HEIGHT -
      ATTRIBUTION_OFFSET,
  );
  const positionY =
    preferredPositionY + ATTRIBUTION_HEIGHT <= SLIDE_HEIGHT
      ? preferredPositionY
      : fallbackPositionY;

  return {
    type: 'text',
    content: {
      text: `Photo by ${photographer} on Pexels`,
      link: {
        label: 'Photo',
        url: pexelsUrl,
      },
      attribution: {
        source: 'pexels',
        imageElementId: imageElement.id,
        pexelsUrl,
        photographer,
        photographerUrl,
      },
    },
    positionX: imageElement.positionX ?? 0,
    positionY,
    width: Math.max(140, imageElement.width ?? 140),
    height: ATTRIBUTION_HEIGHT,
    styles: {
      fontSize: 12,
      color: '#9ca3af',
      lineHeight: 1.2,
    },
    order,
  };
}

export function splitLinkedText(text, linkLabel) {
  if (!text || !linkLabel) return null;

  const labelIndex = text.indexOf(linkLabel);
  if (labelIndex === -1) return null;

  return {
    before: text.slice(0, labelIndex),
    label: linkLabel,
    after: text.slice(labelIndex + linkLabel.length),
  };
}
