import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { RelationshipType, EdgeDirection } from '../../../db/types';
import type { Point } from '../layout/radialLayout';
import { HIGHLIGHT_COLOUR_VAR, type HighlightKind } from './highlight';

const RELATIONSHIP_STYLE: Record<RelationshipType, { width: number; dash?: string }> = {
  strong: { width: 4 },
  weak: { width: 1.5 },
  stressful: { width: 2.5, dash: '10 6' },
  absent: { width: 1.5, dash: '2 5' },
};

/**
 * Marker ids are scoped by colour, not just relationship type, so a colour
 * change always mints a brand-new <marker> element instead of mutating an
 * existing one — SVG engines are unreliable about repainting arrowheads
 * whose marker definition was mutated in place.
 */
export function arrowMarkerId(end: 'start' | 'end', relationshipType: RelationshipType, colour: string) {
  return `arrow-${end}-${relationshipType}-${colour.replace('#', '')}`;
}

export function trimLineToNodeEdges(from: Point, to: Point, fromRadius: number, toRadius: number) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  return {
    from: { x: from.x + ux * fromRadius, y: from.y + uy * fromRadius },
    to: { x: to.x - ux * toRadius, y: to.y - uy * toRadius },
  };
}

export function EdgeLine({
  from,
  to,
  relationshipType,
  direction,
  colour,
  label,
  isSelected,
  isDimmed,
  highlight,
  onClick,
}: {
  from: Point;
  to: Point;
  relationshipType: RelationshipType;
  direction: EdgeDirection;
  colour: string;
  label?: string;
  isSelected?: boolean;
  isDimmed?: boolean;
  highlight?: HighlightKind;
  onClick?: () => void;
}) {
  const style = RELATIONSHIP_STYLE[relationshipType];
  const markerStart =
    direction === 'oneWayBToA' || direction === 'bidirectional'
      ? `url(#${arrowMarkerId('start', relationshipType, colour)})`
      : undefined;
  const markerEnd =
    direction === 'oneWayAToB' || direction === 'bidirectional'
      ? `url(#${arrowMarkerId('end', relationshipType, colour)})`
      : undefined;
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const stroke = isSelected ? 'var(--accent)' : colour;

  function handleKeyDown(e: ReactKeyboardEvent<SVGGElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  }

  return (
    <g
      className="focusable-shape"
      tabIndex={0}
      role="button"
      aria-label={`Relationship, ${relationshipType}${label ? `, ${label}` : ''}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      style={{ cursor: onClick ? 'pointer' : 'default', opacity: isDimmed ? 0.25 : 1 }}
    >
      {highlight && (
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke={HIGHLIGHT_COLOUR_VAR[highlight]}
          strokeWidth={style.width + 6}
          strokeOpacity={0.5}
          strokeLinecap="round"
        />
      )}
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={stroke}
        strokeWidth={style.width}
        strokeDasharray={style.dash}
        markerStart={markerStart}
        markerEnd={markerEnd}
      />
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="transparent"
        strokeWidth={16}
        style={{ pointerEvents: 'stroke' }}
      />
      {label && (
        <text x={midX} y={midY - 6} textAnchor="middle" fontSize="10" fill="var(--text)">
          {label}
        </text>
      )}
    </g>
  );
}
