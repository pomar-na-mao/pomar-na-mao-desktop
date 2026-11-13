export interface VarietyColor {
  strokeColor: string;
  fillColor: string;
}

export const VARIETY_COLOR_PALETTE: VarietyColor[] = [
  { strokeColor: '#047857', fillColor: '#10b981' }, // Verde esmeralda
  { strokeColor: '#1d4ed8', fillColor: '#3b82f6' }, // Azul
  { strokeColor: '#b45309', fillColor: '#f59e0b' }, // Âmbar
  { strokeColor: '#b91c1c', fillColor: '#ef4444' }, // Vermelho
  { strokeColor: '#6d28d9', fillColor: '#8b5cf6' }, // Roxo
  { strokeColor: '#be185d', fillColor: '#ec4899' }, // Rosa
  { strokeColor: '#0e7490', fillColor: '#06b6d4' }, // Ciano
  { strokeColor: '#4d7c0f', fillColor: '#84cc16' }, // Lima
  { strokeColor: '#c2410c', fillColor: '#f97316' }, // Laranja
  { strokeColor: '#4338ca', fillColor: '#6366f1' }, // Índigo
  { strokeColor: '#0f766e', fillColor: '#14b8a6' }, // Teal
  { strokeColor: '#a21caf', fillColor: '#d946ef' }, // Fúcsia
  { strokeColor: '#a16207', fillColor: '#eab308' }, // Amarelo
  { strokeColor: '#0369a1', fillColor: '#0284c7' }, // Azul celeste
  { strokeColor: '#7c2d12', fillColor: '#ea580c' }, // Laranja queimado
  { strokeColor: '#581c87', fillColor: '#7e22ce' }, // Violeta
];

export const UNASSIGNED_VARIETY_COLOR: VarietyColor = {
  strokeColor: '#4b5563',
  fillColor: '#9ca3af',
};

export function getVarietyColor(varietyIndex: number): VarietyColor {
  if (varietyIndex < 0) {
    return UNASSIGNED_VARIETY_COLOR;
  }
  return VARIETY_COLOR_PALETTE[varietyIndex % VARIETY_COLOR_PALETTE.length];
}
