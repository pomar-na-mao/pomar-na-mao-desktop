export const regionColors = [
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#EAB308', // Yellow
  '#A855F7', // Purple
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#06B6D4', // Cyan
  '#14B8A6', // Teal
];

export const getRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};
