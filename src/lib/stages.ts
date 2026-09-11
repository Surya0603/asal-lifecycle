export const STAGE_ORDER = [
  'PREVIOUS_STAGE',
  'CLEANING',
  'SERVICE',
  'PAINTING',
  'TESTING',
  'COMPLETE'
] as const;

export type StageKey = (typeof STAGE_ORDER)[number];

export const STAGE_LABELS: Record<StageKey, string> = {
  PREVIOUS_STAGE: 'Previous Stage',
  CLEANING: 'Cleaning',
  SERVICE: 'Service',
  PAINTING: 'Painting',
  TESTING: 'Testing',
  COMPLETE: 'Complete Refurbished Product'
};

export function stageIndex(stage: string) {
  return STAGE_ORDER.indexOf(stage as StageKey);
}
