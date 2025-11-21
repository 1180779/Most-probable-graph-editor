import type { GraphState, NodeMapping, EdgeCombineStrategy, SolutionNodeMapping } from '../types/graph.types';
import { createMappedGraph, formatMatrix } from './graphOperations';

/**
 * Application state management hooks and utilities
 */

export interface AppState {
  graph1: GraphState;
  graph2: GraphState;
  solutionGraph: GraphState;
  nodeMapping: NodeMapping;
  nextColorIndex: number;
  edgeCombineStrategy: EdgeCombineStrategy;
  solutionNodeMapping?: SolutionNodeMapping;
}

export const initialGraphState: GraphState = {
  nodes: [],
  matrix: [],
  viewOffset: { x: 0, y: 0 },
  scale: 1,
  selectedElement: null,
};

export const initialAppState: AppState = {
  graph1: initialGraphState,
  graph2: initialGraphState,
  solutionGraph: initialGraphState,
  nodeMapping: {},
  nextColorIndex: 0,
  edgeCombineStrategy: 'max',
};

/**
 * Save complete application state to JSON
 */
export function saveAppState(state: AppState): string {
  return JSON.stringify({
    graph1: state.graph1,
    graph2: state.graph2,
    nodeMapping: state.nodeMapping,
    nextColorIndex: state.nextColorIndex,
    edgeCombineStrategy: state.edgeCombineStrategy,
  }, null, 2);
}

/**
 * Load application state from JSON
 */
export function loadAppState(jsonString: string): Partial<AppState> {
  const parsed = JSON.parse(jsonString);

  if (!parsed.graph1 || !parsed.graph2 || !parsed.nodeMapping) {
    throw new Error('Invalid state file format: missing required fields');
  }

  return {
    graph1: parsed.graph1,
    graph2: parsed.graph2,
    nodeMapping: parsed.nodeMapping,
    nextColorIndex: parsed.nextColorIndex || 0,
    edgeCombineStrategy: parsed.edgeCombineStrategy || 'max',
  };
}

/**
 * Download a file with given content
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Save a graph to text file format
 */
export function saveGraphToFile(graph: GraphState, filename: string): void {
  const fileContent = formatMatrix(graph.matrix);
  downloadFile(fileContent, filename, 'text/plain');
}

/**
 * Save application state to file
 */
export function saveStateToFile(state: AppState): void {
  const fileContent = saveAppState(state);
  downloadFile(fileContent, 'project_state.json', 'application/json');
}

/**
 * Create solution graph from mapping
 */
export function createSolutionFromMapping(
  graph1: GraphState,
  graph2: GraphState,
  nodeMapping: NodeMapping,
  strategy: EdgeCombineStrategy
): { graph: GraphState; solutionMapping: SolutionNodeMapping } {
  return createMappedGraph(graph1, graph2, nodeMapping, strategy);
}

