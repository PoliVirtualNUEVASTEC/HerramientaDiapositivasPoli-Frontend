import { Bold, CaseSensitive, Italic, Underline } from 'lucide-react';

export const TOOLBAR_BUTTONS = {
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

export const IMAGE_BORDER_RADIUS_STEPS = [0, 5, 10, 20, 50];

export const createElementSnapshot = (element) =>
  element ? JSON.parse(JSON.stringify(element)) : null;

export const isElementDirty = (element, snapshot) => {
  if (!element || !snapshot) return false;
  return JSON.stringify(element) !== JSON.stringify(snapshot);
};

export const getActiveToolbarButtons = (element) => {
  const activeButtons = [];

  if (element?.styles?.fontWeight === 'bold') activeButtons.push('Negrita');
  if (element?.styles?.fontStyle === 'italic') activeButtons.push('Cursiva');
  if (element?.styles?.textDecoration === 'underline') {
    activeButtons.push('Subrayado');
  }
  if (element?.styles?.textTransform === 'uppercase') {
    activeButtons.push('Mayús');
  }

  return activeButtons;
};

export const getElementBorderRadiusValue = (element) => {
  const radius = element?.styles?.borderRadius;
  if (!radius) return 0;

  const parsed = Number.parseInt(radius.toString().replace('%', ''), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};
