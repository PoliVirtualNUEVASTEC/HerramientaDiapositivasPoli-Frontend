import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';

function ConfirmDialog({
  t,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) {
  const dismiss = () => toast.dismiss(t.id);

  const handleConfirm = () => {
    try {
      onConfirm?.();
    } finally {
      dismiss();
    }
  };

  const handleCancel = () => {
    try {
      onCancel?.();
    } finally {
      dismiss();
    }
  };

  // Bloquea el scroll mientras el dialog está montado
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return createPortal(
    <div
      onClick={handleCancel} // clic en backdrop = cancelar
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()} // evita cerrar al clicar el card
        style={{
          background: 'white',
          padding: '24px',
          borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          minWidth: 340,
          maxWidth: '90vw',
          animation: 'slideUp 0.2s ease',
        }}
        role="dialog"
        aria-labelledby={`confirm-title-${t.id}`}
        aria-describedby={`confirm-desc-${t.id}`}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 8,
            color: '#111',
          }}
          id={`confirm-title-${t.id}`}
        >
          {title}
        </div>

        {description && (
          <div
            style={{
              marginBottom: 20,
              color: '#666',
              fontSize: 14,
              lineHeight: 1.5,
            }}
            id={`confirm-desc-${t.id}`}
          >
            {description}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={handleCancel}
            style={{
              background: 'transparent',
              border: '1px solid #ddd',
              padding: '8px 16px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              color: '#444',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.target.style.background = '#f5f5f5')}
            onMouseLeave={(e) => (e.target.style.background = 'transparent')}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            style={{
              background: '#111',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.target.style.background = '#333')}
            onMouseLeave={(e) => (e.target.style.background = '#111')}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>,
    document.body,
  );
}

export function showConfirm({
  title = '¿Confirmas esta acción?',
  description = '',
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  timeoutMs = null,
} = {}) {
  return toast.custom(
    (t) => (
      <ConfirmDialog
        t={t}
        title={title}
        description={description}
        confirmText={confirmText}
        cancelText={cancelText}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    ),
    { duration: timeoutMs },
  );
}
