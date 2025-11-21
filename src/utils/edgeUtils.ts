import type { Node } from '../types/graph.types';

/**
 * Calculates the path for an edge between two nodes
 */
export function getEdgePath(
  source: Node,
  target: Node,
  isBidirectional: boolean,
  nodeRadius: number,
  curveOffset: number,
  selfLoopRadius: number
): string {
  // Self-loop case
  if (source.id === target.id) {
    const x = source.x;
    const y = source.y;
    return `M ${x} ${y - nodeRadius} A ${selfLoopRadius} ${selfLoopRadius} 0 1 1 ${x + 1} ${y - nodeRadius}`;
  }

  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / dist;
  const ny = dy / dist;

  const sourceX = source.x + nx * nodeRadius;
  const sourceY = source.y + ny * nodeRadius;
  const targetX = target.x - nx * nodeRadius;
  const targetY = target.y - ny * nodeRadius;

  // Bidirectional edges are curved to avoid overlap
  if (isBidirectional) {
    const shiftAmount = 8;
    const sourcePerpX = -ny * shiftAmount;
    const sourcePerpY = nx * shiftAmount;

    const shiftedSourceX = sourceX + sourcePerpX;
    const shiftedSourceY = sourceY + sourcePerpY;
    const shiftedTargetX = targetX + sourcePerpX;
    const shiftedTargetY = targetY + sourcePerpY;

    const midX = (shiftedSourceX + shiftedTargetX) / 2;
    const midY = (shiftedSourceY + shiftedTargetY) / 2;
    const controlX = midX - ny * curveOffset;
    const controlY = midY + nx * curveOffset;

    return `M ${shiftedSourceX} ${shiftedSourceY} Q ${controlX} ${controlY} ${shiftedTargetX} ${shiftedTargetY}`;
  }

  // Straight line for unidirectional edges
  return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
}

/**
 * Calculates the position for edge label text
 */
export function getEdgeTextPosition(
  source: Node,
  target: Node,
  isBidirectional: boolean,
  nodeRadius: number,
  curveOffset: number,
  selfLoopRadius: number
): { x: number; y: number } {
  // Self-loop case
  if (source.id === target.id) {
    return {
      x: source.x,
      y: source.y - nodeRadius - selfLoopRadius - 10,
    };
  }

  const midX = (source.x + target.x) / 2;
  const midY = (source.y + target.y) / 2;
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / dist;
  const ny = dy / dist;

  if (isBidirectional) {
    const labelOffset = curveOffset / 2 + 10;
    return {
      x: midX - ny * labelOffset,
      y: midY + nx * labelOffset,
    };
  }

  return {
    x: midX - ny * 15,
    y: midY + nx * 15,
  };
}

