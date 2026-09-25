const HABIT_COLORS = [
  '#7c5cff', // violeta (acento de marca)
  '#34d399', // menta
  '#60a5fa', // cielo
  '#a78bfa', // lavanda
  '#fbbf24', // ámbar
  '#f472b6', // rosa
  '#2dd4bf', // turquesa
  '#fb923c', // naranja
];

// Pareja de tonos para el degradado de cada color de HABIT_COLORS (mismo índice).
const HABIT_GRADIENTS = {
  '#7c5cff': ['#8f6bff', '#5b3ddb'],
  '#34d399': ['#4ee0ad', '#0ea472'],
  '#60a5fa': ['#7db8fb', '#3b82f6'],
  '#a78bfa': ['#c4a6fc', '#8b6ef0'],
  '#fbbf24': ['#fcd34d', '#f59e0b'],
  '#f472b6': ['#f9a8d4', '#ec4899'],
  '#2dd4bf': ['#5eead4', '#14b8a6'],
  '#fb923c': ['#fdba74', '#f97316'],
  '#818cf8': ['#a5b4fc', '#6366f1'],
};

function gradientFor(color) {
  const [from, to] = HABIT_GRADIENTS[color] || [color, color];
  return `linear-gradient(135deg, ${from}, ${to})`;
}

// Estilo de insignia de icono: degradado vivo + icono claro + resplandor suave.
function iconBadgeStyle(color) {
  return {
    background: gradientFor(color),
    color: '#fdfcff',
    boxShadow: `0 4px 16px ${color}4d`,
  };
}

const HABIT_ICONS = [
  'Droplet', 'BookOpen', 'Dumbbell', 'Moon', 'Brain', 'Footprints', 'Apple',
  'PenLine', 'Music', 'Sun', 'Heart', 'Coffee', 'Ban', 'Wallet', 'Palette',
  'Code2', 'Languages', 'Bike', 'Waves', 'Flower2', 'Smile', 'Guitar',
  'Camera', 'Leaf',
];

const SUGGESTIONS = [
  { name: 'Beber agua', icon: 'Droplet', color: '#60a5fa', type: 'amount', unit: 'vasos', target: 8 },
  { name: 'Leer', icon: 'BookOpen', color: '#a78bfa', type: 'amount', unit: 'min', target: 20 },
  { name: 'Meditar', icon: 'Brain', color: '#2dd4bf', type: 'check' },
  { name: 'Ejercicio', icon: 'Dumbbell', color: '#fb923c', type: 'check' },
  { name: 'Dormir 8h', icon: 'Moon', color: '#818cf8', type: 'check' },
  { name: 'Sin fumar', icon: 'Ban', color: '#f472b6', type: 'check' },
];

export { HABIT_COLORS, HABIT_ICONS, SUGGESTIONS, gradientFor, iconBadgeStyle };
