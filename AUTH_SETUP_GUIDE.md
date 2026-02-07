# Guía de Configuración de Autenticación y RLS

## Estado Actual

Tu app actualmente NO requiere autenticación porque las políticas RLS (Row Level Security) en Supabase no están configuradas correctamente. Esto significa que cualquiera puede acceder a los datos sin estar logueado.

## Problema Identificado

Las tablas de Supabase tienen RLS habilitado pero las políticas no están correctamente implementadas, permitiendo acceso sin autenticación.

## Solución: Aplicar Políticas RLS

### Opción 1: Supabase Dashboard (Más Fácil) ⭐

1. Ve al SQL Editor de Supabase:
   https://supabase.com/dashboard/project/owzvwfikattbpktqnfxi/editor

2. Abre el archivo: `supabase/migrations/20251228_fix_rls_policies.sql`

3. Copia TODO el contenido del archivo

4. Pégalo en el SQL Editor de Supabase

5. Haz clic en "Run" (o presiona Cmd+Enter)

6. Verifica que todas las políticas se aplicaron correctamente (verás mensajes de éxito)

### Opción 2: Supabase CLI

Si tienes el CLI de Supabase instalado:

```bash
# Si no lo tienes instalado
npm install -g supabase

# Enlaza tu proyecto
supabase link --project-ref owzvwfikattbpktqnfxi

# Aplica la migración
supabase db push
```

## Verificación

Una vez aplicadas las políticas, puedes verificar que funcionan ejecutando:

```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://owzvwfikattbpktqnfxi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93enZ3ZmlrYXR0YnBrdHFuZnhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMDM4NDksImV4cCI6MjA2NTc3OTg0OX0.Wtl8yH_AG3gGWUu2c8RyYL7WWUgD6LrcjUbY4HZL_rk'
);

supabase.from('collections').select('*').then(({ data, error }) => {
  if (error && error.message.includes('RLS')) {
    console.log('✅ RLS está funcionando correctamente');
  } else if (data) {
    console.log('❌ RLS NO está funcionando - datos accesibles sin auth');
  }
});
"
```

## ¿Qué hacen estas políticas?

Las políticas RLS implementadas garantizan:

### Collections
- ✅ Solo los usuarios autenticados pueden ver colecciones
- ✅ Los usuarios solo pueden ver sus propias colecciones privadas
- ✅ Todos los usuarios autenticados pueden ver colecciones públicas
- ✅ Los usuarios solo pueden crear/editar/eliminar sus propias colecciones

### Items
- ✅ Los usuarios solo pueden ver sus propios items
- ✅ Los usuarios autenticados pueden ver items de colecciones públicas
- ✅ Los usuarios solo pueden crear/editar/eliminar sus propios items

### User Profiles
- ✅ Todos los usuarios autenticados pueden ver perfiles
- ✅ Los usuarios solo pueden editar su propio perfil

### Likes, Comments, Follows
- ✅ Todos los usuarios autenticados pueden ver
- ✅ Los usuarios solo pueden crear/eliminar sus propias interacciones

## Estado del Sistema de Autenticación

### ✅ Ya Implementado

1. **AuthContext** (`src/context/AuthContext.js`)
   - ✅ Sign up (registro)
   - ✅ Sign in (login)
   - ✅ Sign out (logout)
   - ✅ Forgot password
   - ✅ Reset password
   - ✅ Session persistence con AsyncStorage

2. **Pantallas de Autenticación**
   - ✅ LoginScreen
   - ✅ RegisterScreen
   - ✅ ForgotPasswordScreen
   - ✅ ProfileScreen

3. **Navegación**
   - ✅ AuthNavigator (para usuarios no autenticados)
   - ✅ MainAppNavigator (para usuarios autenticados)
   - ✅ El App.js decide qué mostrar según el estado de autenticación

4. **Botón de Logout**
   - ✅ Añadido en UserProfileScreen
   - ✅ Solo visible en el perfil propio

## Flujo Actual

1. **Primera vez que abres la app:**
   - No hay sesión guardada → Muestra LoginScreen
   - Puedes registrarte o hacer login

2. **Después del login exitoso:**
   - La sesión se guarda en AsyncStorage
   - Muestra HomeScreen con tus colecciones
   - Puedes navegar por toda la app

3. **Si cierras y vuelves a abrir la app:**
   - La sesión se recupera automáticamente de AsyncStorage
   - No necesitas hacer login de nuevo

4. **Para cerrar sesión:**
   - Ve a tu perfil (icono en HomeScreen)
   - Presiona "Logout"
   - Te devuelve a la pantalla de Login

## Próximos Pasos

1. **Aplicar las políticas RLS** usando la Opción 1 o 2 de arriba
2. **Verificar** que RLS funciona correctamente
3. **Crear un usuario de prueba** si no tienes uno
4. **Probar el flujo completo**:
   - Logout
   - Registro de nuevo usuario
   - Login
   - Crear colección
   - Verificar que solo ves tus propios datos

## Notas Importantes

⚠️ **Sin las políticas RLS aplicadas:**
- Cualquiera puede acceder a los datos sin estar logueado
- Es un problema de seguridad grave
- La app puede funcionar pero no es segura

✅ **Con las políticas RLS aplicadas:**
- DEBES estar logueado para ver cualquier dato
- Solo ves tus propios datos privados
- Puedes ver colecciones públicas de otros usuarios
- Es la configuración correcta y segura
