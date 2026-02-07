// src/utils/imageUpload.js
import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Sube una imagen a Supabase Storage y retorna la URL pública
 * @param {string} localUri - URI local de la imagen (file:///)
 * @param {string} userId - ID del usuario
 * @param {string} type - Tipo de imagen ('collection' o 'item')
 * @returns {Promise<string|null>} - URL pública de la imagen o null si falla
 */
export const uploadImage = async (localUri, userId, type = 'collection') => {
  try {
    if (!localUri || !localUri.startsWith('file://')) {
      console.log('❌ No local image to upload');
      return null;
    }

    console.log('📤 Starting image upload for:', localUri);

    // Extraer extensión del archivo
    const ext = localUri.split('.').pop().toLowerCase();
    const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';

    // Generar nombre único para el archivo
    const fileName = `${userId}/${type}/${Date.now()}.${ext}`;
    
    console.log('📝 File name:', fileName);
    console.log('📝 Content type:', contentType);
    console.log('📝 User ID:', userId);

    // Leer la imagen como base64
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: 'base64',
    });

    console.log('✅ Base64 read, length:', base64.length);

    // Decodificar base64 a binary string
    const binaryString = atob(base64);
    console.log('✅ Binary string created, length:', binaryString.length);
    
    // Convertir a ArrayBuffer
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    console.log('✅ Byte array created, length:', bytes.length);

    // Subir a Supabase Storage usando ArrayBuffer directamente
    console.log('⬆️ Uploading to Supabase...');
    const { data, error } = await supabase.storage
      .from('collection-images')
      .upload(fileName, bytes.buffer, {
        contentType,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('❌ Error uploading image:', error);
      console.error('Error code:', error.statusCode);
      console.error('Error message:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return null;
    }

    console.log('✅ Upload successful, path:', data.path);

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('collection-images')
      .getPublicUrl(data.path);

    console.log('🎉 Image uploaded successfully:', publicUrl);
    return publicUrl;

  } catch (error) {
    console.error('❌ Exception uploading image:', error);
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
    return null;
  }
};

/**
 * Elimina una imagen de Supabase Storage
 * @param {string} imageUrl - URL pública de la imagen
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
export const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('collection-images')) {
      return false;
    }

    // Extraer el path del archivo de la URL
    const urlParts = imageUrl.split('/collection-images/');
    if (urlParts.length < 2) {
      return false;
    }
    
    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from('collection-images')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    console.log('Image deleted successfully');
    return true;

  } catch (error) {
    console.error('Exception deleting image:', error);
    return false;
  }
};
