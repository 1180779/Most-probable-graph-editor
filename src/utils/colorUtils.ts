import type { NodeMapping, SolutionNodeMapping } from '../types/graph.types';
import { COLORS, DEFAULT_NODE_COLOR } from '../constants/visualization';

/**
 * Gets the color for a node based on mapping status
 */
export function getNodeColor(
  nodeId: number,
  nodeMapping: NodeMapping,
  isG2: boolean,
  isSolution: boolean,
  solutionMapping?: SolutionNodeMapping
): string {
  if (isSolution) {
    // For solution graph, use the solution mapping which maps solution node IDs to color indices
    if (solutionMapping && solutionMapping[nodeId] !== undefined) {
      return COLORS[solutionMapping[nodeId] % COLORS.length];
    }
  } else if (!isG2) {
    // G1 - check if this node is mapped
    if (nodeMapping[nodeId]) {
      return COLORS[nodeMapping[nodeId].colorIndex % COLORS.length];
    }
  } else {
    // G2 - find if this node is a target in the mapping
    const mappedInfo = Object.values(nodeMapping).find(
      (mapping) => mapping.g2Index === nodeId
    );
    if (mappedInfo) {
      return COLORS[mappedInfo.colorIndex % COLORS.length];
    }
  }
  return DEFAULT_NODE_COLOR;
}

