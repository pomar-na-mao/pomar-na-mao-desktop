export const OCCURRENCE_CATEGORIES = [
  'STRUCTURAL',
  'ENVIRONMENTAL',
  'PEST_DISEASE',
  'ANTHROPIC',
] as const;

export type OccurrenceCategory = (typeof OCCURRENCE_CATEGORIES)[number];

export interface OccurrenceType {
  id: string;
  name: string;
  code: string;
  category: OccurrenceCategory | null;
  created_at: string;
  updated_at: string;
}

export type OccurrenceTypeDraft = Pick<OccurrenceType, 'name' | 'code'> & {
  category: OccurrenceCategory;
};

export type OccurrenceTypeCreate = OccurrenceTypeDraft &
  Pick<OccurrenceType, 'created_at' | 'updated_at'>;

export type OccurrenceTypeUpdate = OccurrenceTypeDraft &
  Pick<OccurrenceType, 'updated_at'>;
