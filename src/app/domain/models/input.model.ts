export const DEFAULT_INPUT_TYPES = [
  'INSECTICIDE',
  'ACARICIDE',
  'FUNGICIDE',
  'BACTERICIDE',
  'CUPRIC',
  'BIOLOGICAL',
  'FOLIAR_FERTILIZER',
  'MICRONUTRIENT',
  'NUTRITION',
  'ADJUVANT',
  'OIL',
  'HERBICIDE',
  'GROWTH_REGULATOR',
] as const;

export type DefaultInputType = (typeof DEFAULT_INPUT_TYPES)[number];
export type InputType = DefaultInputType | string;

export interface InputItem {
  id: string;
  name: string;
  type: InputType;
  active_ingredient: string | null;
  formulation: string | null;
  concentration: string | null;
  chemical_group: string | null;
  manufacturer: string | null;
  mapa_registration: string | null;
  expiration_date: string | null;
  registered_for_crop: boolean | null;
  target_1: string | null;
  target_2: string | null;
  safety_interval_days: number | null;
  label_dose: string | null;
  dose_unit: string | null;
  observations: string | null;
  created_at: string;
  updated_at: string;
}

export type InputDraft = Omit<InputItem, 'id' | 'created_at' | 'updated_at'>;

export type InputCreate = InputDraft & {
  created_at: string;
  updated_at: string;
};

export type InputUpdate = InputDraft & {
  updated_at: string;
};

export const INPUT_TYPE_TRANSLATION_MAP: Record<string, string> = {
  INSECTICIDE: 'Inseticida',
  ACARICIDE: 'Acaricida',
  FUNGICIDE: 'Fungicida',
  BACTERICIDE: 'Bactericida',
  CUPRIC: 'Cúprico',
  BIOLOGICAL: 'Biológico',
  FOLIAR_FERTILIZER: 'Adubo Foliar',
  MICRONUTRIENT: 'Micronutriente',
  NUTRITION: 'Nutrição',
  ADJUVANT: 'Adjuvante',
  OIL: 'Óleo Mineral / Vegetal',
  HERBICIDE: 'Herbicida',
  GROWTH_REGULATOR: 'Regulador de Crescimento',
};

export const INPUT_TYPE_LABELS: Record<string, string> = {
  ...INPUT_TYPE_TRANSLATION_MAP,
  CUPRIC: 'Cúprico / Cobre',
  BIOLOGICAL: 'Biológico',
};

export function inputTypeLabel(type: string | null | undefined): string {
  if (!type) return 'Não especificado';
  const upper = type.toUpperCase().trim();
  return INPUT_TYPE_TRANSLATION_MAP[upper] ?? INPUT_TYPE_LABELS[upper] ?? type;
}

export function inputTypeBadgeStyle(type: string | null | undefined): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  const upper = (type ?? '').toUpperCase().trim();
  switch (upper) {
    case 'INSECTICIDE':
    case 'ACARICIDE':
      return {
        bg: 'bg-red-50 dark:bg-red-950/40',
        text: 'text-red-700 dark:text-red-300',
        border: 'border-red-200 dark:border-red-800/60',
        dot: 'bg-red-500',
      };
    case 'FUNGICIDE':
    case 'BACTERICIDE':
    case 'CUPRIC':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800/60',
        dot: 'bg-amber-500',
      };
    case 'BIOLOGICAL':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800/60',
        dot: 'bg-emerald-500',
      };
    case 'FOLIAR_FERTILIZER':
    case 'MICRONUTRIENT':
    case 'NUTRITION':
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/40',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800/60',
        dot: 'bg-blue-500',
      };
    case 'ADJUVANT':
    case 'OIL':
      return {
        bg: 'bg-purple-50 dark:bg-purple-950/40',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800/60',
        dot: 'bg-purple-500',
      };
    case 'HERBICIDE':
      return {
        bg: 'bg-orange-50 dark:bg-orange-950/40',
        text: 'text-orange-700 dark:text-orange-300',
        border: 'border-orange-200 dark:border-orange-800/60',
        dot: 'bg-orange-500',
      };
    default:
      return {
        bg: 'bg-surface-100 dark:bg-surface-800',
        text: 'text-surface-700 dark:text-surface-300',
        border: 'border-surface-200 dark:border-surface-700',
        dot: 'bg-surface-400',
      };
  }
}
