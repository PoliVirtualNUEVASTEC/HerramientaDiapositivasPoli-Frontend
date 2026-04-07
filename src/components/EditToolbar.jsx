import { Minus, Plus, Type } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';

export default function EditToolbar({
  selectedElement,
  toolbarButtons,
  activeToolbarButtons,
  onToggleButton,
  fontSizeValue,
  onFontSizeChange,
  onColorChange,
}) {
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef(null);

  useEffect(() => {
    const elementColor = selectedElement?.styles?.color || '#000000';
    setSelectedColor(elementColor);
    // Cerrar el color picker cuando cambia el elemento seleccionado
    setShowColorPicker(false);
  }, [selectedElement]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target)
      ) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker]);

  const handleColorChange = (color) => {
    setSelectedColor(color);
    onColorChange(color);
  };

  const toggleColorPicker = () => {
    setShowColorPicker(!showColorPicker);
  };
  return (
    <div className={`edit-toolbar ${selectedElement ? 'visible' : 'hidden'}`}>
      <div className="edit-toolbar-buttons">
        <div className="font-size-group">
          <button
            type="button"
            className="font-size-button"
            onClick={() => onFontSizeChange(-1)}
          >
            <Minus size={16} />
          </button>

          <span className="font-size-label">{fontSizeValue}</span>

          <button
            type="button"
            className="font-size-button"
            onClick={() => onFontSizeChange(1)}
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Color picker button */}
        <div className="color-picker-container" ref={colorPickerRef}>
          <button
            type="button"
            className="toolbar-button color-button"
            onClick={toggleColorPicker}
          >
            <div className="color-button-content">
              <Type size={18} />
              <div
                className="color-indicator"
                style={{ backgroundColor: selectedColor, border: 'black' }}
              />
            </div>
          </button>

          {showColorPicker && (
            <div className="color-picker-popup">
              <HexColorPicker
                color={selectedColor}
                onChange={handleColorChange}
              />
            </div>
          )}
        </div>

        {(selectedElement ? toolbarButtons[selectedElement.type] : []).map(
          ({ Icon, label }) => (
            <button
              key={label}
              type="button"
              className={`toolbar-button ${activeToolbarButtons.includes(label) ? 'active' : ''}`}
              onClick={() => onToggleButton(label)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ),
        )}
      </div>
    </div>
  );
}
