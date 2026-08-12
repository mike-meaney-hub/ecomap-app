import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { EcomapNode, Category, ColourFlag } from '../../../db/types';
import { updateNodePosition } from '../../../db/repositories/nodes';
import { NodeShape } from './NodeShape';
import type { Point } from '../layout/radialLayout';
import './canvas.css';

export function EcomapCanvas({
  nodes,
  categories,
  flags,
  isReadOnly,
  selectedNodeId,
  onSelectNode,
}: {
  nodes: EcomapNode[];
  categories: Category[];
  flags: ColourFlag[];
  isReadOnly: boolean;
  selectedNodeId?: string | null;
  onSelectNode?: (id: string) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState<Point>({ x: 0, y: 0 });

  const categoryById = new Map(categories.map((c) => [c.id, c.name]));
  const flagById = new Map(flags.map((f) => [f.id, f.colour]));

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

  function handlePointerDown(node: EcomapNode, e: ReactPointerEvent<SVGGElement>) {
    if (isReadOnly) return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    const svgPoint = toSvgPoint(e.clientX, e.clientY);
    setDragId(node.id);
    setDragOffset({ x: svgPoint.x - node.x, y: svgPoint.y - node.y });
    setDragPosition({ x: node.x, y: node.y });
    onSelectNode?.(node.id);
  }

  function handlePointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    if (!dragId) return;
    const svgPoint = toSvgPoint(e.clientX, e.clientY);
    setDragPosition({ x: svgPoint.x - dragOffset.x, y: svgPoint.y - dragOffset.y });
  }

  function handlePointerUp() {
    if (!dragId) return;
    updateNodePosition(dragId, dragPosition.x, dragPosition.y);
    setDragId(null);
  }

  return (
    <svg
      ref={svgRef}
      className="ecomap-canvas"
      viewBox="-400 -300 800 600"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {nodes.map((node) => {
        const isDragging = node.id === dragId;
        const pos = isDragging ? dragPosition : { x: node.x, y: node.y };
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
            isSelected={selectedNodeId === node.id}
            onPointerDown={(e) => handlePointerDown(node, e)}
            onClick={() => onSelectNode?.(node.id)}
          />
        );
      })}
    </svg>
  );
}
