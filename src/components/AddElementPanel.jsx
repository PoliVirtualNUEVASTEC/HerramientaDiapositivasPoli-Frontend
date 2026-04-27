import {
  CloudUpload,
  Image as ImageIcon,
  List as ListIcon,
  Palette,
  Trash2,
  Type,
} from 'lucide-react';
import { getTemplates } from '../services/templateService';
import '../styles/addElementPanel.css';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  deleteImage,
  getUserImages,
  markUserImageAsAccessed,
  uploadUserImage,
} from '../services/userImageService';
import { showConfirm } from '../utils/confirmToast';
import '../styles/addElementPanel.css';

export default function AddElementPanel({
  onAddText,
  onAddImage,
  onAddList,
  onAddTemplate,
  onApplyTemplate,
}) {
  const [activePanel, setActivePanel] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [images, setImages] = useState([]);
  const [panelTop, setPanelTop] = useState(80);
  const [templates, setTemplates] = useState([]); // ✅ NUEVO

  const sortImagesByRecentAccess = (images) =>
    [...images].sort((firstImage, secondImage) => {
      const firstDate = new Date(
        firstImage.lastAccessedAt || firstImage.createdAt || 0,
      ).getTime();
      const secondDate = new Date(
        secondImage.lastAccessedAt || secondImage.createdAt || 0,
      ).getTime();

      return secondDate - firstDate;
    });

  //cargar templates desde supabase
  useEffect(() => {
    const loadTemplates = async () => {
      const data = await getTemplates();
      setTemplates(data || []);
    };

    loadTemplates();
  }, []);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [hasLoadedImages, setHasLoadedImages] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const loadImages = useCallback(async () => {
    setIsLoadingImages(true);

    try {
      const userImages = await getUserImages();
      setImages(sortImagesByRecentAccess(userImages));
      setHasLoadedImages(true);
    } catch (error) {
      const message =
        error.response?.data?.error || 'No se pudieron cargar las imágenes';
      toast.error(message);
    } finally {
      setHasLoadedImages(true);
      setIsLoadingImages(false);
    }
  }, []);

  useEffect(() => {
    if (activePanel !== 'image' || hasLoadedImages || isLoadingImages) {
      return;
    }

    void loadImages();
  }, [activePanel, hasLoadedImages, isLoadingImages, loadImages]);

  const handleClosePanel = () => {
    if (isUploading || isPickingImage) {
      return;
    }

    setActivePanel(null);
  };

  // CONTROLA POSICIÓN DEL PANEL
  const handleHover = (panel, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const safeTop = Math.min(rect.top, window.innerHeight - 320);

    setPanelTop(safeTop);
    setActivePanel(panel);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setIsPickingImage(false);
      return;
    }

    setActivePanel('image');
    setIsPickingImage(false);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await uploadUserImage(file, setUploadProgress);
      const uploadedImage = response.image;

      setImages((currentImages) =>
        sortImagesByRecentAccess([
          uploadedImage,
          ...currentImages.filter((image) => image.id !== uploadedImage.id),
        ]),
      );
      setHasLoadedImages(true);
      setUploadProgress(100);
      toast.success('Imagen subida correctamente');
    } catch (error) {
      const message =
        error.response?.data?.error || 'No se pudo subir la imagen';
      toast.error(message);
    } finally {
      setTimeout(() => {
        setUploadProgress(0);
      }, 250);
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleImagePickerOpen = () => {
    setActivePanel('image');
    setIsPickingImage(true);
  };

  useEffect(() => {
    if (!isPickingImage) {
      return;
    }

    const handleWindowFocus = () => {
      window.setTimeout(() => {
        setIsPickingImage(false);
      }, 300);
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [isPickingImage]);

  const handleSelectImage = async (image) => {
    if (typeof onAddImage === 'function') {
      await onAddImage(image.url);
    }

    const updatedImage = {
      ...image,
      lastAccessedAt: new Date().toISOString(),
    };

    setImages((currentImages) =>
      sortImagesByRecentAccess(
        currentImages.map((currentImage) =>
          currentImage.id === image.id ? updatedImage : currentImage,
        ),
      ),
    );

    void markUserImageAsAccessed(image.id).catch(() => {});
  };

  const handleDeleteImage = (image) => {
    showConfirm({
      title: 'Borrar imagen',
      description:
        'Esta imagen se eliminará de tu biblioteca y no podrás recuperarla.',
      confirmText: 'Borrar',
      cancelText: 'Volver',
      onConfirm: async () => {
        setDeletingImageId(image.id);

        try {
          await deleteImage(image.id);
          setImages((currentImages) =>
            currentImages.filter(
              (currentImage) => currentImage.id !== image.id,
            ),
          );
          toast.success('Imagen eliminada');
        } catch (error) {
          const message =
            error.response?.data?.error || 'No se pudo eliminar la imagen';
          toast.error(message);
        } finally {
          setDeletingImageId(null);
        }
      },
    });
  };

  return (
    <div onMouseLeave={handleClosePanel}>
      <div className="add-element-panel">
        <div className="add-element-tabs">
          <button
            onClick={(event) => handleHover('text', event)}
            onMouseEnter={(event) => handleHover('text', event)}
            className="tab-btn-add"
            title="AgregarTexto"
          >
            <Type size={26} />
          </button>

          <button
            onClick={(event) => handleHover('image', event)}
            onMouseEnter={(event) => handleHover('image', event)}
            className="tab-btn-add"
            title="AgregarImagen"
          >
            <ImageIcon size={26} />
          </button>

          <button
            onClick={(event) => handleHover('list', event)}
            onMouseEnter={(event) => handleHover('list', event)}
            className="tab-btn-add"
            title="AgregarLista"
          >
            <ListIcon size={26} />
          </button>

          <button
            onClick={(event) => handleHover('background', event)}
            onMouseEnter={(event) => handleHover('background', event)}
            className="tab-btn-add"
            title="AgregarFondo"
          >
            <Palette size={26} />
          </button>
        </div>
      </div>

      {activePanel && (
        <div
          className="overlay-panel"
          style={{ top: panelTop }}
          onMouseEnter={() => setActivePanel(activePanel)}
        >
          <div className="overlay-content">
            {activePanel === 'text' && <TextPanel onAddText={onAddText} />}

            {activePanel === 'image' && (
              <ImagePanel
                images={images}
                deletingImageId={deletingImageId}
                isLoadingImages={isLoadingImages}
                isUploading={isUploading}
                onDeleteImage={handleDeleteImage}
                onOpenFilePicker={handleImagePickerOpen}
                onSelectImage={handleSelectImage}
                onUpload={handleImageUpload}
                uploadProgress={uploadProgress}
              />
            )}

            {activePanel === 'list' && <ListPanel onAddList={onAddList} />}

            {activePanel === 'background' && (
              <BackgroundPanel
                templates={templates}
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
                onApplyTemplate={onApplyTemplate}
                onAddTemplate={onAddTemplate}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TextPanel({ onAddText }) {
  return (
    <div className="panel-content">
      <h3>Agregar texto</h3>

      <div className="text-options">
        <div className="text-option" onClick={() => onAddText('title')}>
          <span className="text-title">Título</span>
        </div>

        <div className="text-option" onClick={() => onAddText('text')}>
          <span className="text-paragraph">Texto</span>
        </div>
      </div>
    </div>
  );
}

function ImagePanel({
  deletingImageId,
  images,
  isLoadingImages,
  isUploading,
  onDeleteImage,
  onOpenFilePicker,
  onSelectImage,
  onUpload,
  uploadProgress,
}) {
  return (
    <div className="panel-content">
      <h3>Imágenes</h3>

      <label className="upload-area" onClick={onOpenFilePicker}>
        <input type="file" accept="image/*" onChange={onUpload} hidden />
        <div
          className="upload-progress-ring"
          style={{ '--upload-progress': `${uploadProgress}%` }}
        >
          <div className="upload-progress-inner">
            <CloudUpload size={24} />
          </div>
        </div>
        <div className="upload-area-copy">
          <p>{isUploading ? 'Subiendo imagen...' : 'Subir imagen'}</p>
          <span>
            {isUploading
              ? `${uploadProgress}% completado`
              : 'Se comprime y se guarda en tu biblioteca'}
          </span>
        </div>
      </label>

      <div className="image-library-header">
        <span>Tu biblioteca</span>
        <small>Haz clic en una imagen para agregarla a la diapositiva</small>
      </div>

      <div className="image-history">
        {isLoadingImages && (
          <p className="image-history-empty">Cargando imágenes...</p>
        )}

        {!isLoadingImages && images.length === 0 && (
          <p className="image-history-empty">No hay imágenes aún</p>
        )}

        {images.map((image) => {
          const isDeleting = deletingImageId === image.id;

          return (
            <div key={image.id} className="image-history-card">
              <button
                className="image-history-card-preview"
                disabled={isDeleting}
                onClick={() => onSelectImage(image)}
                type="button"
              >
                <img src={image.url} alt="Imagen subida por el usuario" />
              </button>

              <button
                aria-label="Borrar imagen"
                className="image-history-card-delete"
                disabled={isDeleting}
                onClick={() => onDeleteImage(image)}
                type="button"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ListPanel({ onAddList }) {
  return (
    <div className="panel-content">
      <h3>Listas</h3>

      <div className="list-options">
        <div className="list-option" onClick={() => onAddList('bullet')}>
          • Lista con viñetas
        </div>

        <div className="list-option" onClick={() => onAddList('number')}>
          1. Lista numerada
        </div>

        <div className="list-option" onClick={() => onAddList('check')}>
          ✔ Lista con checks
        </div>
      </div>
    </div>
  );
}

function BackgroundPanel({
  templates,
  selectedTemplate,
  setSelectedTemplate,
  onApplyTemplate,
  onAddTemplate,
}) {
  return (
    <div className="panel-content">
      <h3>Plantillas</h3>

      {/* GRID */}
      <div className="template-grid">
        {(templates || []).map((template, index) => (
          <div
            key={index}
            className={`template-card ${
              selectedTemplate === template.url ? 'selected' : ''
            }`}
            onClick={() => setSelectedTemplate(template.url)}
          >
            <img src={template.url} alt={template.name} />
          </div>
        ))}
      </div>

      {/* BOTONES INFERIORES */}
      <div className="template-footer">
        <button
          disabled={!selectedTemplate}
          onClick={() => onApplyTemplate(selectedTemplate)}
        >
          Aplicar a slide
        </button>

        <button
          disabled={!selectedTemplate}
          onClick={() => onAddTemplate(selectedTemplate)}
        >
          Nueva diapositiva
        </button>
      </div>
    </div>
  );
}
