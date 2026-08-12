import type { RelationshipType, EdgeDirection } from '../../../db/types';
import type { Point } from '../layout/radialLayout';

const RELATIONSHIP_STYLE: Record<RelationshipType, { width: number; dash?: string }> = {
  strong: { width: 4 },
  weak: { width: 1.5 },
  stressful: { width: 2.5, dash: '10 6' },
  absent: { width: 1.5, dash: '2 5' },
};

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
  onClick,
}: {
  from: Point;
  to: Point;
  relationshipType: RelationshipType;
  direction: EdgeDirection;
  colour: string;
  label?: string;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const style = RELATIONSHIP_STYLE[relationshipType];
  const markerStart =
    direction === 'oneWayBToA' || direction === 'bidirectional' ? `url(#arrow-start-${relationshipType})` : undefined;
  const markerEnd =
    direction === 'oneWayAToB' || direction === 'bidirectional' ? `url(#arrow-end-${relationshipType})` : undefined;
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const stroke = isSelected ? 'var(--accent)' : colour;

  return (
    <g onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
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
