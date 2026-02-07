// Script para limpiar la sesión guardada y forzar el login
const AsyncStorage = require('@react-native-async-storage/async-storage').default;

async function clearSession() {
  console.log('🧹 Limpiando sesión guardada...\n');
  
  try {
    // Las keys que usa Supabase para guardar la sesión
    const keysToRemove = [
      'supabase.auth.token',
      '@supabase/auth-token',
      'sb-owzvwfikattbpktqnfxi-auth-token'
    ];
    
    for (const key of keysToRemove) {
      await AsyncStorage.removeItem(key);
      console.log(`✅ Eliminado: ${key}`);
    }
    
    console.log('\n✨ Sesión limpiada correctamente');
    console.log('📱 Ahora cuando abras la app, verás la pantalla de login\n');
    
  } catch (error) {
    console.error('❌ Error al limpiar la sesión:', error.message);
  }
}

clearSession();
