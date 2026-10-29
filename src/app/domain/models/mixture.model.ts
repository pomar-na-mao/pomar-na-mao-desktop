import type { InputItem } from './input.model';

export interface MixtureInputItem {
  id: string;
  mixture_id: string;
  input_id: string;
  dose: string;
  dose_unit: string | null;
  created_at?: string;
  input?: InputItem | null;
}

export interface MixtureInputDraft {
  input_id: string;
  dose: string;
  dose_unit: string | null;
  input_name?: string;
}

export interface MixtureItem {
  id: string;
  name: string;
  registered_by_name: string;
  registered_by_email: string;
  is_active: boolean;
  observations: string | null;
  created_at: string;
  updated_at: string;
  inputs?: MixtureInputItem[];
}

export interface MixtureDraft {
  name: string;
  registered_by_name: string;
  registered_by_email: string;
  is_active: boolean;
  observations: string | null;
  inputs: MixtureInputDraft[];
}

export function mixtureStatusBadgeStyle(isActive: boolean): {
  bg: string;
  text: string;
  border: string;
  dot: string;
  label: string;
} {
  if (isActive) {
    return {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800/60',
      dot: 'bg-emerald-500',
      label: 'Ativa',
    };
  }

  return {
    bg: 'bg-surface-100 dark:bg-surface-800/60',
    text: 'text-surface-600 dark:text-surface-400',
    border: 'border-surface-200 dark:border-surface-700',
    dot: 'bg-surface-400',
    label: 'Inativa',
  };
}
