import type { OccurrenceCategory } from '../../domain/models/occurrence-type.model';

export interface OccurrenceCategoryOption {
  label: string;
  value: OccurrenceCategory;
}

export const OCCURRENCE_CATEGORY_LABELS: Record<OccurrenceCategory, string> = {
  STRUCTURAL: 'Estrutural',
  ENVIRONMENTAL: 'Ambiental',
  PEST_DISEASE: 'Praga ou doença',
  ANTHROPIC: 'Antrópica',
};

export const OCCURRENCE_CATEGORY_OPTIONS: OccurrenceCategoryOption[] = [
  { label: OCCURRENCE_CATEGORY_LABELS.STRUCTURAL, value: 'STRUCTURAL' },
  { label: OCCURRENCE_CATEGORY_LABELS.ENVIRONMENTAL, value: 'ENVIRONMENTAL' },
  { label: OCCURRENCE_CATEGORY_LABELS.PEST_DISEASE, value: 'PEST_DISEASE' },
  { label: OCCURRENCE_CATEGORY_LABELS.ANTHROPIC, value: 'ANTHROPIC' },
];

export function occurrenceCategoryLabel(
  category: OccurrenceCategory | null,
): string {
  return category
    ? OCCURRENCE_CATEGORY_LABELS[category]
    : 'Não classificada';
}
