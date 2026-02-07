/**
 * Collection Categories Configuration
 * Defines available categories for collections with icons and colors
 */

export const COLLECTION_CATEGORIES = {
  // Arte y Cultura
  art: {
    id: 'art',
    name: 'Arte y Pintura',
    icon: 'palette-outline',
    color: '#E91E63',
    description: 'Pinturas, esculturas, obras de arte'
  },
  books: {
    id: 'books',
    name: 'Libros',
    icon: 'book-outline',
    color: '#3F51B5',
    description: 'Libros, cómics, novelas gráficas'
  },
  music: {
    id: 'music',
    name: 'Música',
    icon: 'musical-notes-outline',
    color: '#9C27B0',
    description: 'Vinilos, CDs, instrumentos musicales'
  },
  movies: {
    id: 'movies',
    name: 'Películas y Series',
    icon: 'film-outline',
    color: '#FF5722',
    description: 'DVDs, Blu-rays, merchandising'
  },
  
  // Coleccionables
  toys: {
    id: 'toys',
    name: 'Juguetes',
    icon: 'game-controller-outline',
    color: '#4CAF50',
    description: 'Figuras de acción, muñecos, juguetes vintage'
  },
  cards: {
    id: 'cards',
    name: 'Cartas Coleccionables',
    icon: 'card-outline',
    color: '#FF9800',
    description: 'Pokémon, Dragon Ball, Magic, deportivas'
  },
  coins: {
    id: 'coins',
    name: 'Monedas',
    icon: 'disc-outline',
    color: '#795548',
    description: 'Monedas antiguas, conmemorativas'
  },
  stamps: {
    id: 'stamps',
    name: 'Sellos',
    icon: 'mail-outline',
    color: '#607D8B',
    description: 'Sellos postales, filatelia'
  },
  
  // Cultura Japonesa
  anime: {
    id: 'anime',
    name: 'Anime y Manga',
    icon: 'library-outline',
    color: '#E91E63',
    description: 'Figuras, manga, merchandising anime'
  },
  kokeshi: {
    id: 'kokeshi',
    name: 'Kokeshi',
    icon: 'person-outline',
    color: '#FF6B6B',
    description: 'Muñecas tradicionales japonesas'
  },
  mingei: {
    id: 'mingei',
    name: 'Mingei',
    icon: 'hand-left-outline',
    color: '#8B7355',
    description: 'Arte popular japonés, artesanía tradicional'
  },
  
  // Tecnología
  electronics: {
    id: 'electronics',
    name: 'Electrónicos',
    icon: 'phone-portrait-outline',
    color: '#2196F3',
    description: 'Dispositivos vintage, consolas, gadgets'
  },
  gaming: {
    id: 'gaming',
    name: 'Videojuegos',
    icon: 'game-controller-outline',
    color: '#673AB7',
    description: 'Juegos, consolas, accesorios gaming'
  },
  
  // Moda y Accesorios
  fashion: {
    id: 'fashion',
    name: 'Moda',
    icon: 'shirt-outline',
    color: '#E91E63',
    description: 'Ropa vintage, accesorios, bolsos'
  },
  watches: {
    id: 'watches',
    name: 'Relojes',
    icon: 'time-outline',
    color: '#424242',
    description: 'Relojes antiguos, smartwatches, cronómetros'
  },
  jewelry: {
    id: 'jewelry',
    name: 'Joyería',
    icon: 'diamond-outline',
    color: '#FFD700',
    description: 'Joyas, bisutería, accesorios'
  },
  
  // Deportes
  sports: {
    id: 'sports',
    name: 'Deportes',
    icon: 'football-outline',
    color: '#4CAF50',
    description: 'Memorabilia deportiva, equipamiento'
  },
  
  // Naturaleza y Ciencias
  nature: {
    id: 'nature',
    name: 'Naturaleza',
    icon: 'leaf-outline',
    color: '#8BC34A',
    description: 'Minerales, fósiles, especímenes'
  },
  
  // Otros
  vintage: {
    id: 'vintage',
    name: 'Vintage',
    icon: 'time-outline',
    color: '#8D6E63',
    description: 'Objetos antiguos, retro, nostalgia'
  },
  other: {
    id: 'other',
    name: 'Otros',
    icon: 'ellipsis-horizontal-outline',
    color: '#9E9E9E',
    description: 'Otros coleccionables'
  }
};

// Lista ordenada para selector
export const CATEGORY_LIST = Object.values(COLLECTION_CATEGORIES).sort((a, b) => 
  a.name.localeCompare(b.name)
);

// Función para obtener categoría por ID
export const getCategoryById = (categoryId) => {
  return COLLECTION_CATEGORIES[categoryId] || COLLECTION_CATEGORIES.other;
};

// Función para obtener color de categoría
export const getCategoryColor = (categoryId) => {
  return COLLECTION_CATEGORIES[categoryId]?.color || '#9E9E9E';
};

// Función para obtener ícono de categoría
export const getCategoryIcon = (categoryId) => {
  return COLLECTION_CATEGORIES[categoryId]?.icon || 'ellipsis-horizontal-outline';
};