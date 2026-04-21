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
        <div className="presentations-list">
          <h2>Mis presentaciones</h2>
          <div className="presentations-grid">
            {presentations.map((p) => (
              <div key={p.id} className="presentation-item">
                <div
                  className="presentation-thumbnail"
                  onClick={() =>
                    navigate(`/preview/${p.id}`, {
                      state: { presentation: p },
                    })
                  }
                >
                  <div className="thumbnail-slides-count">
                    {p.slides?.length || 0} slides
                  </div>
                  <div className="thumbnail-icon">🖼️</div>
                </div>
                <div className="presentation-info">
                  <span className="presentation-title">{p.title}</span>
                  <span className="presentation-date">
                    {formatDate(p.createdAt)}
                  </span>
                </div>
                <div className="presentation-actions">
                  <button
                    className="action-btn view-btn"
                    onClick={() => navigate(`/preview/${p.id}`)}
                  >
                    Ver
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(p.id)}
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
