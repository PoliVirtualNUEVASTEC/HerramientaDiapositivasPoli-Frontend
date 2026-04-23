import {
  ArrowDown,
  ArrowDownRight,
  ArrowUp,
  Layers,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Plus,
  SquareRoundCorner,
  Type,
} from 'lucide-react';
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
  maintainAspectRatio,
  onAspectRatioToggle,
  borderRadiusValue,
  onBorderRadiusCycle,
  onPositionAction,
  onListTypeToggle,
}) {
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showPositionMenu, setShowPositionMenu] = useState(false);
  const colorPickerRef = useRef(null);
  const positionMenuRef = useRef(null);
  const previousSelectedElementId = useRef(null);

  useEffect(() => {
    const elementColor = selectedElement?.styles?.color || '#000000';
    if (elementColor !== selectedColor) {
      setSelectedColor(elementColor);
    }

    if (selectedElement?.id !== previousSelectedElementId.current) {
      setShowColorPicker(false);
      previousSelectedElementId.current = selectedElement?.id;
    }
  }, [selectedElement, selectedColor]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target)
      ) {
        setShowColorPicker(false);
      }
      if (
        positionMenuRef.current &&
        !positionMenuRef.current.contains(event.target)
      ) {
        setShowPositionMenu(false);
      }
    };

    if (showColorPicker || showPositionMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker, showPositionMenu]);

  const handleColorChange = (color) => {
    setSelectedColor(color);
    onColorChange(color);
  };

  const toggleColorPicker = () => {
    setShowColorPicker(!showColorPicker);
  };

  const togglePositionMenu = () => {
    setShowPositionMenu((current) => !current);
  };

  const handlePositionClick = (action) => {
    onPositionAction(action);
  };

  return (
    <div className={`edit-toolbar ${selectedElement ? 'visible' : 'hidden'}`}>
      <div className="edit-toolbar-buttons">
        {selectedElement?.type !== 'image' && (
          <>
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
          </>
        )}

        {selectedElement?.type === 'image' ? (
          <>
            <button
              type="button"
              className={`toolbar-button ${maintainAspectRatio ? 'active' : ''}`}
              onClick={onAspectRatioToggle}
            >
              <ArrowDownRight size={18} />
              <span>Proporción</span>
            </button>
            <button
              type="button"
              className={`toolbar-button ${borderRadiusValue > 0 ? 'active' : ''}`}
              onClick={onBorderRadiusCycle}
            >
              <SquareRoundCorner size={18} />
              <span>Borde {borderRadiusValue}%</span>
            </button>
          </>
        ) : selectedElement?.type === 'list' ? (
          <>
            <button
              type="button"
              className="toolbar-button"
              onClick={onListTypeToggle}
              title="Cambiar tipo de lista"
            >
              {selectedElement.content?.listType === 'ordered' ? (
                <ListOrdered size={18} />
              ) : selectedElement.content?.listType === 'checkmark' ? (
                <ListChecks size={18} />
              ) : (
                <List size={18} />
              )}
              <span>
                {selectedElement.content?.listType === 'ordered'
                  ? 'Ordenada'
                  : selectedElement.content?.listType === 'checkmark'
                    ? 'Viñetas'
                    : 'Lista'}
              </span>
            </button>
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
          </>
        ) : (
          (selectedElement ? toolbarButtons[selectedElement.type] : []).map(
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
          )
        )}
        {selectedElement && (
          <div className="position-control-wrapper">
            <button
              type="button"
              className={`toolbar-button ${showPositionMenu ? 'active' : ''}`}
              onClick={togglePositionMenu}
            >
              <Layers size={18} />
              <span>Posición</span>
            </button>
            {showPositionMenu && (
              <div className="position-menu" ref={positionMenuRef}>
                <button
                  type="button"
                  className="toolbar-button position-menu-button"
                  onClick={() => handlePositionClick('front')}
                >
                  <ArrowUp size={16} />
                  <span>Al frente</span>
                </button>
                <button
                  type="button"
                  className="toolbar-button position-menu-button"
                  onClick={() => handlePositionClick('back')}
                >
                  <ArrowDown size={16} />
                  <span>Al fondo</span>
                </button>
                <button
                  type="button"
                  className="toolbar-button position-menu-button"
                  onClick={() => handlePositionClick('forward')}
                >
                  <span>Delante</span>
                </button>
                <button
                  type="button"
                  className="toolbar-button position-menu-button"
                  onClick={() => handlePositionClick('backward')}
                >
                  <span>Detrás</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
