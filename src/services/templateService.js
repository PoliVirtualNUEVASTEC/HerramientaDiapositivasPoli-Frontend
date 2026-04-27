import { supabase } from '../lib/supabaseClient';

export const getTemplates = async () => {
  const bucket = import.meta.env.VITE_SUPABASE_BUCKET || 'images';

  const { data, error } = await supabase.storage
    .from(bucket)
    .list('slides', {
      limit: 100,
      offset: 0,
    });

  if (error) {
    console.error('Error obteniendo templates:', error);
    return [];
  }

  const templates = data.map((file) => {
    const { data: publicUrl } = supabase.storage
      .from(bucket)
      .getPublicUrl(`slides/${file.name}`); // 🔥 CORREGIDO

    return {
      name: file.name,
      url: publicUrl.publicUrl,
    };
  });

  return templates;
};