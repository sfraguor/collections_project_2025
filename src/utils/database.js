// src/utils/database.js
// Servicio centralizado para todas las operaciones de base de datos usando SOLO Supabase
import { supabase } from './supabase';
import { Alert } from 'react-native';

/**
 * ==========================================
 * COLECCIONES - CRUD Operations
 * ==========================================
 */

/**
 * Obtener todas las colecciones del usuario actual
 */
export const getCollections = async (userId) => {
  try {
    if (!userId) {
      console.warn('No user ID provided');
      return [];
    }

    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading collections:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception loading collections:', error);
    return [];
  }
};

/**
 * Obtener una colección específica por ID
 */
export const getCollectionById = async (collectionId, userId) => {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('id', collectionId)
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .single();

    if (error) {
      console.error('Error loading collection:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception loading collection:', error);
    return null;
  }
};

/**
 * Crear una nueva colección
 */
export const createCollection = async (userId, collectionData) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const newCollection = {
      id: collectionData.id, // UUID generado en el cliente
      user_id: userId,
      name: collectionData.name,
      description: collectionData.description || null,
      image: collectionData.image || null,
      cover: collectionData.cover || null,
      color: collectionData.color || null,
      icon: collectionData.icon || null,
      category: collectionData.category || 'other',
      is_public: collectionData.is_public || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      synced_at: new Date().toISOString(),
      is_deleted: false,
    };

    const { data, error } = await supabase
      .from('collections')
      .insert([newCollection])
      .select()
      .single();

    if (error) {
      console.error('Error creating collection:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Exception creating collection:', error);
    throw error;
  }
};

/**
 * Actualizar una colección existente
 */
export const updateCollection = async (collectionId, userId, updates) => {
  try {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
      synced_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('collections')
      .update(updateData)
      .eq('id', collectionId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating collection:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Exception updating collection:', error);
    throw error;
  }
};

/**
 * Eliminar una colección (soft delete)
 */
export const deleteCollection = async (collectionId, userId) => {
  try {
    // Marcar como eliminada (soft delete)
    const { error } = await supabase
      .from('collections')
      .update({ 
        is_deleted: true,
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      })
      .eq('id', collectionId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting collection:', error);
      throw error;
    }

    // También marcar todos los items de esta colección como eliminados
    await supabase
      .from('items')
      .update({ 
        is_deleted: true,
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      })
      .eq('collection_id', collectionId)
      .eq('user_id', userId);

    return true;
  } catch (error) {
    console.error('Exception deleting collection:', error);
    throw error;
  }
};

/**
 * ==========================================
 * ITEMS - CRUD Operations
 * ==========================================
 */

/**
 * Obtener todos los items de una colección
 */
export const getItems = async (collectionId, userId) => {
  try {
    if (!userId || !collectionId) {
      console.warn('User ID and Collection ID are required');
      return [];
    }

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('collection_id', collectionId)
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading items:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception loading items:', error);
    return [];
  }
};

/**
 * Obtener un item específico por ID
 */
export const getItemById = async (itemId, userId) => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', itemId)
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .single();

    if (error) {
      console.error('Error loading item:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception loading item:', error);
    return null;
  }
};

/**
 * Crear un nuevo item
 */
export const createItem = async (userId, itemData) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const newItem = {
      id: itemData.id, // ID generado en el cliente
      user_id: userId,
      collection_id: itemData.collection_id,
      name: itemData.name,
      card_number: itemData.card_number || null,
      description: itemData.description || null,
      images: itemData.images || [],
      image: itemData.image || null,
      price: itemData.price || null,
      purchase_price: itemData.purchase_price || null,
      currency: itemData.currency || 'EUR',
      purchase_currency: itemData.purchase_currency || 'EUR',
      current_market_price: itemData.current_market_price || null,
      current_market_currency: itemData.current_market_currency || null,
      ebay_search_terms: itemData.ebay_search_terms || null,
      price_history: itemData.price_history || [],
      last_price_update: itemData.last_price_update || null,
      high_value: itemData.high_value || false,
      purchase_date: itemData.purchase_date || null,
      condition: itemData.condition || null,
      notes: itemData.notes || null,
      tags: itemData.tags || [],
      custom_fields: itemData.custom_fields || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      synced_at: new Date().toISOString(),
      is_deleted: false,
    };

    const { data, error } = await supabase
      .from('items')
      .insert([newItem])
      .select()
      .single();

    if (error) {
      console.error('Error creating item:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Exception creating item:', error);
    throw error;
  }
};

/**
 * Actualizar un item existente
 */
export const updateItem = async (itemId, userId, updates) => {
  try {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
      synced_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('items')
      .update(updateData)
      .eq('id', itemId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating item:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Exception updating item:', error);
    throw error;
  }
};

/**
 * Eliminar un item (soft delete)
 */
export const deleteItem = async (itemId, userId) => {
  try {
    const { error } = await supabase
      .from('items')
      .update({ 
        is_deleted: true,
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      })
      .eq('id', itemId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting item:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Exception deleting item:', error);
    throw error;
  }
};

/**
 * ==========================================
 * ESTADÍSTICAS
 * ==========================================
 */

/**
 * Obtener estadísticas generales del usuario
 */
export const getUserStats = async (userId) => {
  try {
    if (!userId) {
      return {
        totalCollections: 0,
        totalItems: 0,
        totalValue: 0,
        categoryBreakdown: {},
      };
    }

    // Obtener colecciones
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('id, category')
      .eq('user_id', userId)
      .eq('is_deleted', false);

    if (collectionsError) {
      console.error('Error loading collections stats:', collectionsError);
    }

    // Obtener items y calcular valor total
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('price')
      .eq('user_id', userId)
      .eq('is_deleted', false);

    if (itemsError) {
      console.error('Error loading items stats:', itemsError);
    }

    const totalCollections = collections?.length || 0;
    const totalItems = items?.length || 0;
    
    // Calcular valor total
    const totalValue = items?.reduce((sum, item) => {
      const price = parseFloat(item.price || 0);
      return sum + price;
    }, 0) || 0;

    // Calcular distribución por categoría
    const categoryBreakdown = {};
    collections?.forEach(collection => {
      const category = collection.category || 'other';
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
    });

    return {
      totalCollections,
      totalItems,
      totalValue,
      categoryBreakdown,
    };
  } catch (error) {
    console.error('Exception getting user stats:', error);
    return {
      totalCollections: 0,
      totalItems: 0,
      totalValue: 0,
      categoryBreakdown: {},
    };
  }
};

/**
 * Obtener conteo de items por colección
 */
export const getItemCountsByCollection = async (userId) => {
  try {
    if (!userId) {
      return {};
    }

    const { data: collections } = await supabase
      .from('collections')
      .select('id')
      .eq('user_id', userId)
      .eq('is_deleted', false);

    if (!collections) {
      return {};
    }

    const counts = {};
    
    for (const collection of collections) {
      const { count, error } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('collection_id', collection.id)
        .eq('user_id', userId)
        .eq('is_deleted', false);

      if (!error) {
        counts[collection.id] = count || 0;
      }
    }

    return counts;
  } catch (error) {
    console.error('Exception getting item counts:', error);
    return {};
  }
};

/**
 * Obtener valor total por colección
 */
export const getTotalValueByCollection = async (userId) => {
  try {
    if (!userId) {
      return {};
    }

    const { data: collections } = await supabase
      .from('collections')
      .select('id')
      .eq('user_id', userId)
      .eq('is_deleted', false);

    if (!collections) {
      return {};
    }

    const totals = {};
    
    for (const collection of collections) {
      const { data: items } = await supabase
        .from('items')
        .select('price')
        .eq('collection_id', collection.id)
        .eq('user_id', userId)
        .eq('is_deleted', false);

      const total = items?.reduce((sum, item) => {
        const price = parseFloat(item.price || 0);
        return sum + price;
      }, 0) || 0;

      totals[collection.id] = total;
    }

    return totals;
  } catch (error) {
    console.error('Exception getting collection totals:', error);
    return {};
  }
};
