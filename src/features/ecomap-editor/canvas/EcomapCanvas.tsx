import { Fragment, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { EcomapNode, EcomapEdge, Category, ColourFlag, RelationshipType } from '../../../db/types';
import { updateNodePosition } from '../../../db/repositories/nodes';
import { createEdge } from '../../../db/repositories/edges';
import { useRelationshipColourMap } from '../../../hooks/useRelationshipColours';
import { NodeShape } from './NodeShape';
import { EdgeLine, trimLineToNodeEdges, arrowMarkerId } from './EdgeLine';
import type { HighlightKind } from './highlight';
import { nodeMatchesFilter, edgeMatchesFilter, type EcomapFilterState } from '../filters/filterLogic';
import type { Point } from '../layout/radialLayout';
import './canvas.css';

export type Selection = { type: 'node' | 'edge'; id: string };

const NODE_RADIUS = 28;
const CENTRAL_RADIUS = 34;
const EDGE_TARGET_SNAP_RADIUS = 40;
const RELATIONSHIP_TYPES: RelationshipType[] = ['strong', 'weak', 'stressful', 'absent'];

export function EcomapCanvas({
  nodes,
  edges,
  categories,
  flags,
  isReadOnly,
  selected,
  onSelect,
  filter,
  highlight,
}: {
  nodes: EcomapNode[];
  edges: EcomapEdge[];
  categories: Category[];
  flags: ColourFlag[];
  isReadOnly: boolean;
  selected?: Selection | null;
  onSelect?: (selection: Selection) => void;
  filter?: EcomapFilterState;
  highlight?: Map<string, HighlightKind>;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const relationshipColours = useRelationshipColourMap();
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState<Point>({ x: 0, y: 0 });
  const [edgeDrag, setEdgeDrag] = useState<{ sourceId: string; point: Point } | null>(null);

  const categoryById = new Map(categories.map((c) => [c.id, c.name]));
  const flagById = new Map(flags.map((f) => [f.id, f.colour]));
  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  function toSvgPoint(clientX: number, clientY: number): Point {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const transformed = pt.matrixTransform(ctm.inverse());
    return { x: transformed.x, y: transformed.y };
  }

  function positionOf(node: EcomapNode): Point {
    return node.id === dragNodeId ? dragPosition : { x: node.x, y: node.y };
  }

  function radiusOf(node: EcomapNode) {
    return node.isCentral ? CENTRAL_RADIUS : NODE_RADIUS;
  }

  function handleNodePointerDown(node: EcomapNode, e: ReactPointerEvent<SVGGElement>) {
    if (isReadOnly) return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    const svgPoint = toSvgPoint(e.clientX, e.clientY);

    if (e.shiftKey) {
      setEdgeDrag({ sourceId: node.id, point: svgPoint });
      onSelect?.({ type: 'node', id: node.id });
      return;
    }

    if (node.isCentral) {
      onSelect?.({ type: 'node', id: node.id });
      return;
    }

    setDragNodeId(node.id);
    setDragOffset({ x: svgPoint.x - node.x, y: svgPoint.y - node.y });
    setDragPosition({ x: node.x, y: node.y });
    onSelect?.({ type: 'node', id: node.id });
  }

  function handlePointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    const svgPoint = toSvgPoint(e.clientX, e.clientY);
    if (dragNodeId) {
      setDragPosition({ x: svgPoint.x - dragOffset.x, y: svgPoint.y - dragOffset.y });
    } else if (edgeDrag) {
      setEdgeDrag({ ...edgeDrag, point: svgPoint });
    }
  }

  function handlePointerUp(e: ReactPointerEvent<SVGSVGElement>) {
    if (dragNodeId) {
      updateNodePosition(dragNodeId, dragPosition.x, dragPosition.y);
      setDragNodeId(null);
      return;
    }
    if (edgeDrag) {
      const svgPoint = toSvgPoint(e.clientX, e.clientY);
      const target = nodes.find((n) => {
        if (n.id === edgeDrag.sourceId) return false;
        const pos = positionOf(n);
        const dist = Math.hypot(pos.x - svgPoint.x, pos.y - svgPoint.y);
        return dist <= EDGE_TARGET_SNAP_RADIUS;
      });
      const versionId = nodeById.get(edgeDrag.sourceId)?.ecomapVersionId;
      if (target && versionId) {
        createEdge({ ecomapVersionId: versionId, fromNodeId: edgeDrag.sourceId, toNodeId: target.id }).then((edge) => {
          onSelect?.({ type: 'edge', id: edge.id });
        });
      }
      setEdgeDrag(null);
    }
  }

  return (
    <svg
      ref={svgRef}
      className="ecomap-canvas"
      viewBox="-400 -300 800 600"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <defs>
        {/* Same right-pointing triangle for both ends — auto-start-reverse flips it
            180° automatically when used as marker-start, so it must not be pre-mirrored.
            Marker ids are scoped by colour (see arrowMarkerId) so a colour change in
            Settings always mints a fresh marker element instead of mutating one in
            place — SVG engines don't reliably repaint arrowheads otherwise. */}
        {RELATIONSHIP_TYPES.map((type) => (
          <Fragment key={type}>
            <marker id={arrowMarkerId('end', type, relationshipColours[type])} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill={relationshipColours[type]} />
            </marker>
            <marker id={arrowMarkerId('start', type, relationshipColours[type])} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill={relationshipColours[type]} />
            </marker>
          </Fragment>
        ))}
      </defs>

      {edges.map((edge) => {
        const fromNode = nodeById.get(edge.fromNodeId);
        const toNode = nodeById.get(edge.toNodeId);
        if (!fromNode || !toNode) return null;
        const { from, to } = trimLineToNodeEdges(
          positionOf(fromNode),
          positionOf(toNode),
          radiusOf(fromNode),
          radiusOf(toNode),
        );
        return (
          <EdgeLine
            key={edge.id}
            from={from}
            to={to}
            relationshipType={edge.relationshipType}
            direction={edge.direction}
            colour={relationshipColours[edge.relationshipType]}
            label={edge.label}
            isSelected={selected?.type === 'edge' && selected.id === edge.id}
            isDimmed={filter ? !edgeMatchesFilter(edge, nodeById, filter) : false}
            highlight={highlight?.get(edge.id)}
            onClick={() => onSelect?.({ type: 'edge', id: edge.id })}
          />
        );
      })}

      {edgeDrag && (() => {
        const sourceNode = nodeById.get(edgeDrag.sourceId);
        if (!sourceNode) return null;
        return (
          <line
            x1={positionOf(sourceNode).x}
            y1={positionOf(sourceNode).y}
            x2={edgeDrag.point.x}
            y2={edgeDrag.point.y}
            stroke="var(--accent)"
            strokeWidth={2}
            strokeDasharray="4 4"
          />
        );
      })()}

      {nodes.map((node) => {
        const pos = positionOf(node);
        return (
          <NodeShape
            key={node.id}
            x={pos.x}
            y={pos.y}
            label={node.label}
            categoryName={node.categoryId ? categoryById.get(node.categoryId) : undefined}
            flagColour={node.flagId ? flagById.get(node.flagId) : undefined}
            isCentral={node.isCentral}
            isDraggable={!node.isCentral && !isReadOnly}
            isSelected={selected?.type === 'node' && selected.id === node.id}
            isDimmed={filter ? !nodeMatchesFilter(node, filter) : false}
            highlight={highlight?.get(node.id)}
            showNotesIndicator={Boolean(filter?.showNotesIndicators) && node.notes.trim().length > 0}
            onPointerDown={(e) => handleNodePointerDown(node, e)}
            onClick={() => onSelect?.({ type: 'node', id: node.id })}
          />
        );
      })}
    </svg>
  );
}
