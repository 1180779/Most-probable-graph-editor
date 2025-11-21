// Type definitions for graph-related structures

export type AdjacencyMatrix = number[][];

export interface Node {
  id: number;
  x: number;
  y: number;
}

export interface GraphState {
  nodes: Node[];
  matrix: AdjacencyMatrix;
  viewOffset: { x: number; y: number };
  scale: number;
  selectedElement: { type: 'node' | 'edge'; id: string } | null;
}

export interface NodeMapping {
  [g1Index: number]: { g2Index: number; colorIndex: number };
}

export interface SolutionNodeMapping {
  [solutionNodeId: number]: number; // maps solution node ID to colorIndex
}

export type EdgeCombineStrategy = 'max' | 'min';

