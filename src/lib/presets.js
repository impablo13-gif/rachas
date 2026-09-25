const HABIT_COLORS = [
  '#ff6b4a', // ember (brand accent)
  '#34d399', // mint
  '#60a5fa', // sky
  '#a78bfa', // violet
  '#fbbf24', // amber
  '#f472b6', // pink
  '#2dd4bf', // teal
  '#fb923c', // orange
];

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

export { HABIT_COLORS, HABIT_ICONS, SUGGESTIONS };
