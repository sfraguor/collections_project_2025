# Colecciones React Native App

Esta aplicación permite gestionar tus colecciones personales (cartas, figuras, artbooks, etc.) con fotos, precios, etiquetas y detalles.

---

## Características

- **Gestión de Colecciones**: Crea, edita y elimina colecciones personalizadas
- **Gestión de Items**: Añade, edita y elimina items dentro de cada colección
- **Imágenes**: Toma fotos o selecciona imágenes de la galería para colecciones e items
- **Detalles Completos**: Guarda información detallada de cada item (precio, fecha de compra, condición, notas)
- **Búsqueda**: Busca colecciones e items por nombre y otros campos
- **Ordenación**: Ordena colecciones por nombre o cantidad de items, y ordena items por nombre, precio, fecha, etc.
- **Vista Detallada**: Visualiza todos los detalles de un item en una vista modal
- **Estadísticas**: Visualiza estadísticas detalladas de tus colecciones (total de items, valor, etc.)
- **Sistema de Etiquetas**: Añade y filtra items por etiquetas personalizadas
- **Tema Claro/Oscuro**: Cambia entre tema claro y oscuro según tus preferencias
- **Backup y Restauración**: Exporta e importa tus colecciones completas o individuales
- **Compartir Colecciones**: Comparte tus colecciones con otros usuarios mediante enlaces o archivos
- **Sincronización en la Nube**: Sincroniza tus colecciones entre múltiples dispositivos usando Supabase
- **Autenticación de Usuarios**: Registra una cuenta para acceder a tus colecciones desde cualquier dispositivo

---

## Tecnologías usadas

- React Native con Expo
- React Navigation (stack)
- AsyncStorage para almacenamiento local
- Expo Image Picker para seleccionar imágenes
- Expo File System y Document Picker para exportación/importación de datos
- Expo Sharing para compartir archivos de backup
- Componentes modales para vistas detalladas y opciones de ordenación
- Context API para gestión de temas y autenticación
- Supabase para backend, autenticación y almacenamiento en la nube

---

## Instalación

1. Clonar repositorio (si aplica)

```bash
git clone <tu-repo-url>
cd <tu-carpeta-proyecto>
```

2. Instalar dependencias

```bash
npm install
```

3. Iniciar la aplicación

```bash
npm start
```

4. Escanear el código QR con la app Expo Go en tu dispositivo o usar un emulador

---

## Estructura del Proyecto

- `/src/screens`: Pantallas principales de la aplicación
  - `HomeScreen.js`: Pantalla principal con lista de colecciones
  - `CollectionScreen.js`: Pantalla de items dentro de una colección
  - `AddCollectionScreen.js`: Formulario para añadir colecciones
  - `EditCollectionScreen.js`: Formulario para editar colecciones
  - `AddItemScreen.js`: Formulario para añadir items
  - `EditItemScreen.js`: Formulario para editar items
  - `CloudSyncScreen.js`: Configuración de sincronización en la nube
  - `DataExportScreen.js`: Exportación e importación de datos
  - `/auth`: Pantallas de autenticación (login, registro, perfil)
- `/src/components`: Componentes reutilizables
  - `CollectionItem.js`: Componente para mostrar una colección
  - `ItemCard.js`: Componente para mostrar un item
  - `ItemDetailModal.js`: Modal para ver detalles de un item
  - `SortModal.js`: Modal para opciones de ordenación
  - `TagSelector.js`: Componente para seleccionar etiquetas
  - `CollectionStats.js`: Componente para mostrar estadísticas
  - `ThemeToggle.js`: Componente para cambiar el tema
  - `AppIcons.js`: Iconos utilizados en la aplicación
  - `ShareCollectionModal.js`: Modal para compartir colecciones
- `/src/theme`: Sistema de temas
  - `theme.js`: Definición de colores y estilos para temas
- `/src/utils`: Utilidades y servicios
  - `supabase.js`: Configuración de Supabase para backend
  - `cloudSync.js`: Funciones para sincronización en la nube
  - `dataExport.js`: Funciones para exportación e importación de datos
- `/src/context`: Contextos de React
  - `AuthContext.js`: Contexto para gestión de autenticación
- `/supabase`: Configuración de Supabase
  - `/migrations`: Scripts SQL para inicializar tablas en Supabase
- `/assets`: Imágenes y recursos estáticos

---

## Mejoras Futuras

- Añadir gráficos y estadísticas más avanzadas
- Añadir soporte para múltiples idiomas
- Implementar notificaciones para recordatorios
- Añadir funcionalidad de copia de seguridad automática programada
- Implementar login con huella dactilar
- Añadir soporte para compartir colecciones con otros usuarios
- Implementar sistema de comentarios y colaboración

---

## Configuración de Supabase

1. Registrarse en [Supabase](https://supabase.com) y crear un nuevo proyecto
2. Obtener la URL y la clave anónima del proyecto desde la configuración de API
3. Actualizar el archivo `src/utils/supabase.js` con tus credenciales:
   ```javascript
   const supabaseUrl = 'TU_URL_DE_SUPABASE';
   const supabaseAnonKey = 'TU_CLAVE_ANONIMA';
   ```
4. Ejecutar los scripts SQL de inicialización:
   - Ir a la sección SQL Editor en el dashboard de Supabase
   - Copiar y pegar el contenido de `supabase/migrations/20250621_initialize_cloud_sync.sql`
   - Ejecutar el script para crear las tablas y funciones necesarias

## Uso de la Sincronización en la Nube

1. Registra una cuenta o inicia sesión en la aplicación
2. Ve a la pantalla "Cloud Sync" desde la pantalla principal
3. Activa la sincronización en la nube
4. Configura las opciones de sincronización según tus preferencias:
   - Sincronización automática
   - Sincronizar solo con WiFi
   - Intervalo de sincronización
5. Pulsa "Sync Now" para realizar una sincronización manual

La sincronización en la nube permite:
- Acceder a tus colecciones desde múltiples dispositivos
- Mantener una copia de seguridad en la nube
- Restaurar tus datos si pierdes tu dispositivo

---

## Compilación de la Aplicación con EAS Build

Para compilar la aplicación para producción o desarrollo, utilizamos EAS Build, el servicio de compilación de Expo:

### Requisitos Previos

1. Instalar EAS CLI globalmente:
   ```bash
   npm install -g eas-cli
   ```

2. Iniciar sesión en tu cuenta de Expo:
   ```bash
   eas login
   ```

### Compilación para Desarrollo

Para compilar una versión de desarrollo que puedas instalar en tu dispositivo:

```bash
npm run build:dev:android  # Para Android
npm run build:dev:ios      # Para iOS
```

### Compilación para Pruebas (Preview)

Para compilar una versión de prueba que puedas compartir con testers:

```bash
npm run build:android  # Para Android
npm run build:ios      # Para iOS
```

### Compilación para Producción

Para compilar la versión final para publicación en las tiendas:

```bash
npm run build:prod  # Para Android e iOS
```

### Solución de Problemas de Compilación

Si encuentras problemas durante la compilación:

1. Asegúrate de tener la última versión de EAS CLI:
   ```bash
   npm install -g eas-cli@latest
   ```

2. Verifica que las configuraciones en `eas.json` y `app.json` sean correctas
3. Para problemas específicos de Android, revisa que los valores de SDK en `app.json` sean compatibles con tu proyecto
4. Para errores de autolinking, asegúrate de que todas las dependencias nativas estén correctamente configuradas
