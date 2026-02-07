# Configuración de Google Sign-In

## 📋 Pasos completados en el código

✅ Instaladas dependencias: `expo-auth-session`, `expo-web-browser`, `expo-crypto`
✅ AuthContext actualizado con función `signInWithGoogle()`
✅ LoginScreen con botón "Continue with Google"
✅ URL scheme configurado: `coleccionesapp://`

---

## ⚠️ PENDIENTE (Para builds standalone)

❌ **Android OAuth Client** - Requiere SHA-1 del keystore de EAS
   - Ejecutar: `npx eas credentials` → Android → Keystore → Copiar SHA-1
   **Ve a:** https://console.cloud.google.com/apis/credentials

2. **Crea un nuevo proyecto** (o selecciona uno existente)

3. **Crear credenciales OAuth:**
   - Click en "+ CREAR CREDENCIALES"
   - Selecciona: **"ID de cliente de OAuth"**
   - Tipo de aplicación: **"Aplicación web"**
   - Nombre: `Colecciones Web`
   
4. **Configurar URIs autorizados:**
   - **Orígenes de JavaScript autorizados:**
     - `http://localhost:19006`
   
   - **URIs de redireccionamiento autorizados:**
     - `https://owzvwfikattbpktqnfxi.supabase.co/auth/v1/callback`
     - `http://localhost:19006`

5. **Guardar y copiar:**
   - Client ID (lo necesitarás para Supabase)
   - Client Secret (lo necesitarás para Supabase)
   **Para iOS:**
   - Tipo: iOS
   - Nombre: Colecciones iOS
   - Bundle ID: `com.sfrag.coleccionesapp`
   
   **Para Web (desarrollo con Expo Go):**
   - Tipo: Web application
   - Nombre: Colecciones Web
   - JavaScript origins: `http://localhost:19006`
   - Redirect URIs:
     - `http://localhost:19006`
     - `https://auth.expo.io/@tu-username/colecciones-app`

5. **Copiar Client ID y Client Secret**

---

### 2️⃣ Configurar Supabase Dashboard

1. **Ve a:** https://supabase.com/dashboard/project/owzvwfikattbpktqnfxi/auth/providers

2. **Busca y habilita "Google"** en la lista de providers

3. **Configurar credenciales:**
   - **Client ID (Web):** Pega el Client ID que copiaste de Google Cloud Console
   - **Client Secret:** Pega el Client Secret
   - **Authorized Client IDs:** Déjalo vacío por ahora (es para Android/iOS)

4. **Guardar cambios**

**¡Listo!** Ya puedes usar Google Sign-In en tu app.

---

### 3️⃣ Verificar configuración

Una vez configurado todo:

1. Reinicia el servidor de desarrollo:
   ```bash
   npm start
   ```

2. Prueba el botón "Continue with Google" en LoginScreen

3. El flujo debería ser:
   - Click en botón → Abre navegador con login de Google
   - Selecciona cuenta de Google
   - Autoriza la app
   - Cierra navegador y vuelve a la app
   - Usuario autenticado ✅

---

## 🐛 Troubleshooting

**Error: "Invalid OAuth client"**
- Verifica que los Client IDs en Supabase coincidan con Google Cloud Console

**Error: "Redirect URI mismatch"**
- Asegúrate de que el callback de Supabase esté en Google Cloud Console

**No se abre el navegador:**
- Verifica que `expo-web-browser` esté instalado correctamente
- Prueba ejecutar: `npm install expo-web-browser`

**El navegador se cierra pero no hace login:**
- Revisa los logs de Expo: `npx expo start`
- Verifica que el scheme `coleccionesapp://` esté configurado

---

## 📱 Nota sobre Expo Go vs Standalone

**Con Expo Go (desarrollo):**
- Usa el Client ID de Web
- El redirect es manejado por Expo

**Con build standalone (producción):**
- Usa los Client IDs específicos de Android/iOS
- El redirect es manejado por tu app directamente

---

## ✅ Checklist final

- [ ] Google Cloud Console: Proyecto creado
- [ ] Google Cloud Console: Google+ API habilitada
- [ ] Google Cloud Console: Credenciales para Android, iOS y Web creadas
- [ ] Supabase: Provider Google habilitado
- [ ] Supabase: Client ID y Secret configurados
- [ ] Google Cloud Console: Callback URL de Supabase añadido
- [ ] App reiniciada con `npm start`
- [ ] Botón "Continue with Google" testeado
