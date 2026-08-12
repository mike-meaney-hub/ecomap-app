export type HighlightKind = 'added' | 'removed' | 'changed';

export const HIGHLIGHT_COLOUR_VAR: Record<HighlightKind, string> = {
  added: 'var(--success)',
  removed: 'var(--danger)',
  changed: 'var(--warning)',
};
