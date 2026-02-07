# 🔗 Configuración de Redirect URL para eBay OAuth

## ¿Qué es una Redirect URL?

La **Redirect URL** (o OAuth Callback URL) es la dirección web donde eBay enviará al usuario después de que autorice tu aplicación. Es obligatoria para cualquier aplicación que use OAuth con eBay.

## ✅ URL Configurada y Lista

Tu endpoint OAuth está desplegado y funcionando:

**Redirect URL:** `https://collections-project-2025.vercel.app/api/ebay-oauth`

## 📋 Pasos para Configurar en eBay Developer Console

### Paso 1: Acceder a la Configuración
1. Ve a: https://developer.ebay.com/my/applications
2. Selecciona tu aplicación **"Collections"**
3. Busca la sección **"OAuth Redirect URLs"** o **"Redirect URLs"**

### Paso 2: Añadir la Redirect URL
1. Haz clic en **"Add Redirect URL"** o **"+"**
2. Introduce la URL: `https://collections-project-2025.vercel.app/api/ebay-oauth`
3. Guarda los cambios

### Paso 3: Verificar la Configuración
- ✅ La URL debe aparecer en la lista de URLs autorizadas
- ✅ El estado debe ser "Active" o "Verified"

## 🧪 Probar la Configuración

### Opción 1: Ejecutar Test Automático
```bash
cd colecciones-app
node test-ebay.js
```

### Opción 2: Verificar Manualmente
1. Visita: https://collections-project-2025.vercel.app/api/ebay-oauth
2. Deberías ver una página con "✅ Ready for eBay Developer Console"

## 🔧 Funcionalidades del Endpoint

### ✅ Manejo de Autenticación Exitosa
- Recibe el `authorization_code` de eBay
- Muestra confirmación al usuario
- Notifica a la aplicación principal

### ❌ Manejo de Errores
- Captura errores de autenticación
- Muestra mensaje claro al usuario
- Permite reintentar o cancelar

### 🔄 Comunicación con la App
- Usa `postMessage` para comunicarse con la aplicación
- Auto-cierra popup después de completar
- Maneja tanto iframe como popup

## 📱 Integración con la App React Native

Una vez configurada la Redirect URL, podrás:

1. **Abrir el flujo OAuth** desde la app
2. **Redirigir al usuario** a eBay para autorización
3. **Recibir el código** de autorización en tu endpoint
4. **Intercambiar el código** por tokens de acceso
5. **Usar los tokens** para llamadas API autorizadas

## 🔒 Seguridad

- ✅ HTTPS obligatorio (Vercel proporciona SSL automático)
- ✅ Validación de parámetros OAuth
- ✅ Headers de seguridad configurados
- ✅ Manejo seguro de errores

## 🚨 Problemas Comunes

### "Invalid Redirect URI"
- **Causa**: La URL no está registrada en eBay Developer Console
- **Solución**: Verificar que la URL exacta esté configurada

### "Redirect URI Mismatch"
- **Causa**: La URL registrada no coincide exactamente
- **Solución**: Asegurarse que no hay espacios, / extra, etc.

### Error 404 en el Endpoint
- **Causa**: El endpoint no está desplegado correctamente
- **Solución**: Verificar despliegue en Vercel

## ✅ Checklist de Configuración

- [ ] Endpoint OAuth desplegado en Vercel
- [ ] URL añadida en eBay Developer Console
- [ ] Test ejecutado exitosamente
- [ ] URL verificada manualmente
- [ ] Configuración guardada en eBay

## 📞 Soporte

Si tienes problemas:

1. **Ejecuta el test**: `node test-ebay.js`
2. **Revisa los logs** de Vercel
3. **Verifica la configuración** en eBay Developer Console

---

**Última actualización:** ${new Date().toLocaleDateString()}
**Endpoint Status:** ✅ Activo y funcionando