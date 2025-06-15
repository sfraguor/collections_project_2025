# Colecciones React Native App

Esta aplicación permite gestionar tus colecciones personales (cartas, figuras, artbooks, etc.) con fotos, precios y detalles.

---

## Características

- **Gestión de Colecciones**: Crea, edita y elimina colecciones personalizadas
- **Gestión de Items**: Añade, edita y elimina items dentro de cada colección
- **Imágenes**: Toma fotos o selecciona imágenes de la galería para colecciones e items
- **Detalles Completos**: Guarda información detallada de cada item (precio, fecha de compra, condición, notas)
- **Búsqueda**: Busca colecciones e items por nombre y otros campos
- **Ordenación**: Ordena colecciones por nombre o cantidad de items, y ordena items por nombre, precio, fecha, etc.
- **Vista Detallada**: Visualiza todos los detalles de un item en una vista modal
- **Estadísticas**: Visualiza el número de items en cada colección

---

## Tecnologías usadas

- React Native con Expo
- React Navigation (stack)
- AsyncStorage para almacenamiento local
- Expo Image Picker para seleccionar imágenes
- Componentes modales para vistas detalladas y opciones de ordenación

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
- `/assets`: Imágenes y recursos estáticos

---

## Mejoras Futuras

- Implementar sistema de categorías y etiquetas para items
- Añadir soporte para temas (modo oscuro/claro)
- Implementar sincronización en la nube
- Añadir gráficos y estadísticas avanzadas
- Implementar exportación/importación de datos
