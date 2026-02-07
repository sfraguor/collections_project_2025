// src/utils/conditionStates.js

/**
 * Standard condition states for collectibles
 * Based on industry-standard grading systems
 */
export const CONDITION_STATES = [
  {
    id: 'mint',
    label: 'Mint (M)',
    description: 'Perfecto, sin defectos',
    color: '#10B981', // Green
    icon: 'star',
  },
  {
    id: 'near_mint',
    label: 'Near Mint (NM)',
    description: 'Casi perfecto, defectos mínimos',
    color: '#34D399',
    icon: 'star-half',
  },
  {
    id: 'excellent',
    label: 'Excellent (EX)',
    description: 'Muy buen estado, uso mínimo',
    color: '#60A5FA',
    icon: 'happy',
  },
  {
    id: 'very_good',
    label: 'Very Good (VG)',
    description: 'Buen estado, signos de uso',
    color: '#FBBF24',
    icon: 'thumbs-up',
  },
  {
    id: 'good',
    label: 'Good (G)',
    description: 'Estado aceptable, desgaste visible',
    color: '#FB923C',
    icon: 'checkmark-circle',
  },
  {
    id: 'fair',
    label: 'Fair (F)',
    description: 'Desgaste considerable',
    color: '#F87171',
    icon: 'warning',
  },
  {
    id: 'poor',
    label: 'Poor (P)',
    description: 'Muy desgastado, daños significativos',
    color: '#EF4444',
    icon: 'close-circle',
  },
  {
    id: 'sealed',
    label: 'Sealed',
    description: 'Sellado de fábrica',
    color: '#8B5CF6',
    icon: 'lock-closed',
  },
  {
    id: 'graded',
    label: 'Graded',
    description: 'Graduado profesionalmente (PSA, BGS, etc.)',
    color: '#6366F1',
    icon: 'shield-checkmark',
  },
];

/**
 * Get condition state by ID
 * @param {string} id - The condition state ID
 * @returns {Object|null} The condition state object or null if not found
 */
export const getConditionById = (id) => {
  return CONDITION_STATES.find(state => state.id === id) || null;
};

/**
 * Get condition color by ID
 * @param {string} id - The condition state ID
 * @returns {string} The color hex code
 */
export const getConditionColor = (id) => {
  const condition = getConditionById(id);
  return condition ? condition.color : '#9CA3AF'; // Default gray
};

/**
 * Get condition label by ID
 * @param {string} id - The condition state ID
 * @returns {string} The condition label
 */
export const getConditionLabel = (id) => {
  const condition = getConditionById(id);
  return condition ? condition.label : id;
};
