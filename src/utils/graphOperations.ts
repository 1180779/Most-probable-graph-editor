import type { AdjacencyMatrix, GraphState, NodeMapping, EdgeCombineStrategy, SolutionNodeMapping } from '../types/graph.types';

/**
 * Creates a mapped graph from two source graphs based on the node mapping.
 * This implements the MCS (Minimum Common Supergraph) construction algorithm.
 *
 * @param graph1 - The first source graph (G1)
 * @param graph2 - The second source graph (G2)
 * @param nodeMapping - Mapping from G1 node indices to G2 node indices
 * @param strategy - How to combine edge counts: 'max' (default) or 'min'
 * @returns An object with the solution graph and solution node mapping
 */
export function createMappedGraph(
  graph1: GraphState,
  graph2: GraphState,
  nodeMapping: NodeMapping,
  strategy: EdgeCombineStrategy = 'max'
): { graph: GraphState; solutionMapping: SolutionNodeMapping } {
  const mappedG1Nodes = Object.keys(nodeMapping).map(Number);
  const numNodes = mappedG1Nodes.length;

  if (numNodes === 0) {
    return {
      graph: {
        nodes: [],
        matrix: [],
        viewOffset: { x: 0, y: 0 },
        scale: 1,
        selectedElement: null,
      },
      solutionMapping: {},
    };
  }

  // Create new matrix with combined edge counts
  const newMatrix: AdjacencyMatrix = Array(numNodes)
    .fill(0)
    .map(() => Array(numNodes).fill(0));

  // Create new nodes based on G1 positions and build solution mapping
  const solutionMapping: SolutionNodeMapping = {};
  const newNodes = mappedG1Nodes.map((g1NodeId, i) => {
    const g1Node = graph1.nodes.find(n => n.id === g1NodeId);
    // Map solution node ID to the color index
    solutionMapping[i] = nodeMapping[g1NodeId].colorIndex;
    return {
      id: i,
      x: g1Node?.x || 0,
      y: g1Node?.y || 0,
    };
  });

  // Populate the matrix based on the combine strategy
  const combineFunc = strategy === 'max' ? Math.max : Math.min;

  for (let i = 0; i < numNodes; i++) {
    for (let j = 0; j < numNodes; j++) {
      const g1Source = mappedG1Nodes[i];
      const g1Target = mappedG1Nodes[j];
      const g2Source = nodeMapping[g1Source].g2Index;
      const g2Target = nodeMapping[g1Target].g2Index;

      const g1EdgeCount = graph1.matrix[g1Source]?.[g1Target] || 0;
      const g2EdgeCount = graph2.matrix[g2Source]?.[g2Target] || 0;

      newMatrix[i][j] = combineFunc(g1EdgeCount, g2EdgeCount);
    }
  }

  return {
    graph: {
      nodes: newNodes,
      matrix: newMatrix,
      viewOffset: { x: 0, y: 0 },
      scale: 1,
      selectedElement: null,
    },
    solutionMapping,
  };
}

/**
 * Formats an adjacency matrix to the text file format.
 * Format: first line is the number of vertices, followed by n lines of the matrix.
 * All cells are right-aligned to the same width (max width of all values).
 */
export function formatMatrix(matrix: AdjacencyMatrix): string {
  const n = matrix.length;
  if (n === 0) return '0';

  // Find the maximum width needed for any cell value
  let maxWidth = 1;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const width = String(matrix[i][j]).length;
      if (width > maxWidth) {
        maxWidth = width;
      }
    }
  }

  // Format each row with right-aligned cells
  const formattedRows = matrix.map(row =>
    row.map(value => String(value).padStart(maxWidth, ' ')).join(' ')
  );

  return `${n}\n${formattedRows.join('\n')}`;
}

/**
 * Parses a text file containing an adjacency matrix.
 * @param content - The file content as string
 * @returns The parsed adjacency matrix
 */
export function parseMatrix(content: string): AdjacencyMatrix {
  const lines = content.trim().split('\n');
  const size = parseInt(lines[0], 10);

  if (isNaN(size) || size < 0) {
    throw new Error('Invalid graph file format: invalid size');
  }

  if (size === 0) {
    return [];
  }

  if (lines.length < size + 1) {
    throw new Error('Invalid graph file format: insufficient lines');
  }

  const matrix = lines.slice(1, 1 + size).map(line => {
    const row = line.trim().split(/\s+/).map(Number);
    if (row.length !== size) {
      throw new Error(`Invalid graph file format: row length mismatch`);
    }
    return row;
  });

  return matrix;
}

