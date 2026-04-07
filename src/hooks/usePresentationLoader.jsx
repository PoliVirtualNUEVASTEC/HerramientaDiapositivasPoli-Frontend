import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { getPresentation } from '../services/presentationService';

export function usePresentationLoader(
  id,
  presentationFromStore,
  setPresentationInStore,
) {
  const [presentation, setPresentation] = useState(
    presentationFromStore ?? null,
  );
  const [loading, setLoading] = useState(false);
  const presentationFromStoreRef = useRef(presentationFromStore);
  presentationFromStoreRef.current = presentationFromStore;
  const presentationFromStoreId = presentationFromStore?.id;

  useEffect(() => {
    const loadPresentation = async () => {
      if (String(presentationFromStoreId) === String(id)) {
        setPresentation(presentationFromStoreRef.current);
        return;
      }

      try {
        setLoading(true);
        const data = await getPresentation(id);
        setPresentation(data);
        setPresentationInStore(data);
      } catch {
        toast.error('Error cargando la presentación');
      } finally {
        setLoading(false);
      }
    };

    loadPresentation();
  }, [id, presentationFromStoreId, setPresentationInStore]);

  return { presentation, loading };
}
