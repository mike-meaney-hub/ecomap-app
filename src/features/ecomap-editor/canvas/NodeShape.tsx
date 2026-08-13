import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import { HIGHLIGHT_COLOUR_VAR, type HighlightKind } from './highlight';

const NODE_RADIUS = 28;
const CENTRAL_RADIUS = 34;
const DEFAULT_FILL = '#9ca3af';
const NUDGE_STEP = 8;
const NUDGE_STEP_LARGE = 16;

export function NodeShape({
  x,
  y,
  label,
  categoryName,
  flagColour,
  isCentral,
  isDraggable,
  isSelected,
  isDimmed,
  highlight,
  showNotesIndicator,
  onPointerDown,
  onClick,
  onNudge,
}: {
  x: number;
  y: number;
  label: string;
  categoryName?: string;
  flagColour?: string | null;
  isCentral: boolean;
  isDraggable: boolean;
  isSelected?: boolean;
  isDimmed?: boolean;
  highlight?: HighlightKind;
  showNotesIndicator?: boolean;
  onPointerDown?: (e: ReactPointerEvent<SVGGElement>) => void;
  onClick?: () => void;
  onNudge?: (dx: number, dy: number) => void;
}) {
  const radius = isCentral ? CENTRAL_RADIUS : NODE_RADIUS;
  const fill = isCentral ? 'var(--accent)' : flagColour || DEFAULT_FILL;

  function handleKeyDown(e: ReactKeyboardEvent<SVGGElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
      return;
    }
    if (!onNudge) return;
    const step = e.shiftKey ? NUDGE_STEP_LARGE : NUDGE_STEP;
    if (e.key === 'ArrowUp') { e.preventDefault(); onNudge(0, -step); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); onNudge(0, step); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); onNudge(-step, 0); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); onNudge(step, 0); }
  }

  return (
    <g
      transform={`translate(${x}, ${y})`}
      className="focusable-shape"
      tabIndex={0}
      role="button"
      aria-label={`${label}, ${categoryName ?? 'central node'}`}
      onPointerDown={isDraggable ? onPointerDown : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      style={{ cursor: isDraggable ? 'grab' : onClick ? 'pointer' : 'default', opacity: isDimmed ? 0.25 : 1 }}
    >
      {highlight && (
        <circle r={radius + 6} fill="none" stroke={HIGHLIGHT_COLOUR_VAR[highlight]} strokeWidth={3} />
      )}
      <circle
        r={radius}
        fill={fill}
        stroke={isSelected ? 'var(--accent)' : 'var(--border)'}
        strokeWidth={isSelected ? 3 : 1.5}
      />
      {showNotesIndicator && (
        <circle cx={radius * 0.7} cy={-radius * 0.7} r={4} fill="var(--accent)" stroke="var(--bg)" strokeWidth={1} />
      )}
      <text
        y={radius + 16}
        textAnchor="middle"
        fontSize="12"
        fontWeight={isCentral ? 700 : 500}
        fill="var(--text-h)"
      >
        {label}
      </text>
      {categoryName && !isCentral && (
        <text y={radius + 30} textAnchor="middle" fontSize="10" fill="var(--text)">
          {categoryName}
        </text>
      )}
    </g>
  );
}
