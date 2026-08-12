import type { PointerEvent as ReactPointerEvent } from 'react';

const NODE_RADIUS = 28;
const CENTRAL_RADIUS = 34;
const DEFAULT_FILL = '#9ca3af';

export function NodeShape({
  x,
  y,
  label,
  categoryName,
  flagColour,
  isCentral,
  isDraggable,
  isSelected,
  onPointerDown,
  onClick,
}: {
  x: number;
  y: number;
  label: string;
  categoryName?: string;
  flagColour?: string | null;
  isCentral: boolean;
  isDraggable: boolean;
  isSelected?: boolean;
  onPointerDown?: (e: ReactPointerEvent<SVGGElement>) => void;
  onClick?: () => void;
}) {
  const radius = isCentral ? CENTRAL_RADIUS : NODE_RADIUS;
  const fill = isCentral ? 'var(--accent)' : flagColour || DEFAULT_FILL;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onPointerDown={isDraggable ? onPointerDown : undefined}
      onClick={onClick}
      style={{ cursor: isDraggable ? 'grab' : onClick ? 'pointer' : 'default' }}
    >
      <circle
        r={radius}
        fill={fill}
        stroke={isSelected ? 'var(--accent)' : 'var(--border)'}
        strokeWidth={isSelected ? 3 : 1.5}
      />
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
