import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  deletePresentation,
  getPresentations,
} from '../services/presentationService';
import { showConfirm } from '../utils/confirmToast';

export default function ListOfPresentations() {
  const [presentations, setPresentations] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUserPresentations = async () => {
      const data = await getPresentations();
      setPresentations(data);
    };

    getUserPresentations();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO');
  };

  const getThumbnailStyle = (presentation) => {
    const background = presentation.firstSlide?.background;
    const imageUrl = background?.url || background?.image;

    if (background?.type === 'image' && imageUrl) {
      return {
        backgroundImage: `url("${imageUrl}")`,
      };
    }

    if (background?.type === 'color') {
      return {
        backgroundColor: background.color || background.value,
      };
    }

    return {};
  };

  const handleDelete = (id) => {
    setIsDisabled(true);
    showConfirm({
      title: 'Borrar Presentación',
      description: 'Esta acción no se puede deshacer.',
      onConfirm: () => {
        setIsDisabled(false);
        deletePresentation(id);
        const updated = presentations.filter((p) => p.id !== id);
        setPresentations(updated);
        toast.success('Presentación eliminada');
      },
      onCancel: () => {
        setIsDisabled(false);
      },
      confirmText: 'Borrar',
      cancelText: 'Volver',
    });
  };

  return (
    <>
      {presentations.length > 0 && (
        <div className="dashboard-presentations-list">
          <h2>Mis presentaciones</h2>
          <div className="dashboard-presentations-grid">
            {presentations.map((presentation) => (
              <div
                key={presentation.id}
                className="dashboard-presentation-item"
              >
                <div
                  className="dashboard-presentation-thumbnail"
                  style={getThumbnailStyle(presentation)}
                  onClick={() =>
                    navigate(`/preview/${presentation.id}`, {
                      state: { presentation },
                    })
                  }
                >
                  <div className="dashboard-thumbnail-slides-count">
                    {presentation.slidesCount || 0} slides
                  </div>
                  <div className="dashboard-presentation-thumbnail-overlay">
                    <span className="dashboard-thumbnail-title">
                      {presentation.firstSlide?.title || presentation.title}
                    </span>
                  </div>
                </div>
                <div className="dashboard-presentation-info">
                  <span className="dashboard-presentation-title">
                    {presentation.title}
                  </span>
                  <span className="dashboard-presentation-date">
                    {formatDate(presentation.createdAt)}
                  </span>
                </div>
                <div className="dashboard-presentation-actions">
                  <button
                    className="dashboard-action-btn dashboard-view-btn"
                    onClick={() => navigate(`/preview/${presentation.id}`)}
                  >
                    Ver
                  </button>
                  <button
                    className="dashboard-action-btn dashboard-delete-btn"
                    onClick={() => handleDelete(presentation.id)}
                    disabled={isDisabled}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
