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

---

## Tecnologías usadas

- React Native con Expo
- React Navigation (stack)
- AsyncStorage para almacenamiento local
- Expo Image Picker para seleccionar imágenes
- Expo File System y Document Picker para exportación/importación de datos
- Expo Sharing para compartir archivos de backup
- Componentes modales para vistas detalladas y opciones de ordenación
- Context API para gestión de temas

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
- `/src/components`: Componentes reutilizables
  - `CollectionItem.js`: Componente para mostrar una colección
  - `ItemCard.js`: Componente para mostrar un item
  - `ItemDetailModal.js`: Modal para ver detalles de un item
  - `SortModal.js`: Modal para opciones de ordenación
  - `TagSelector.js`: Componente para seleccionar etiquetas
  - `CollectionStats.js`: Componente para mostrar estadísticas
  - `ThemeToggle.js`: Componente para cambiar el tema
- `/src/theme`: Sistema de temas
  - `theme.js`: Definición de colores y estilos para temas
- `/assets`: Imágenes y recursos estáticos

---

## Mejoras Futuras

- Implementar sincronización en la nube
- Añadir gráficos y estadísticas más avanzadas
- Añadir soporte para múltiples idiomas
- Implementar notificaciones para recordatorios
- Añadir funcionalidad de copia de seguridad automática
- Implementar sistema de usuarios y autenticación
