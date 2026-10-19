import { getSupabaseClient } from '../lib/supabase';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
]);

export async function uploadImage(
  uri: string,
  userId: string,
  contentType?: string | null
) {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error('Não foi possível ler a imagem selecionada.');
  }

  const image = await response.arrayBuffer();
  const resolvedContentType =
    contentType || 'image/jpeg';

  if (!ALLOWED_TYPES.has(resolvedContentType)) {
    throw new Error('Use uma imagem JPG, PNG, WebP ou HEIC.');
  }
  if (image.byteLength > MAX_IMAGE_SIZE) {
    throw new Error('A imagem deve ter no máximo 5 MB.');
  }

  const extension = resolvedContentType.split('/')[1];
  const path =
    `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const supabase = getSupabaseClient();
  const { error } = await supabase.storage
    .from('post-images')
    .upload(path, image, {
      contentType: resolvedContentType,
      cacheControl: '31536000',
      upsert: false,
    });

  if (error) {
    throw new Error(`Não foi possível enviar a imagem: ${error.message}`);
  }

  return supabase.storage
    .from('post-images')
    .getPublicUrl(path)
    .data.publicUrl;
}
