import type { Node, AdjacencyMatrix } from '../types/graph.types';

/**
 * Creates nodes in a circular layout
 */
export function createCircularLayout(
  numNodes: number,
  centerX: number = 250,
  centerY: number = 250,
  radius: number = 150
): Node[] {
  const nodes: Node[] = [];
  for (let i = 0; i < numNodes; i++) {
    const angle = (i / numNodes) * 2 * Math.PI;
    nodes.push({
      id: i,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  }
  return nodes;
}

/**
 * Creates nodes in a linear (path) layout
 */
export function createLinearLayout(
  numNodes: number,
  startX: number,
  startY: number,
  spacing: number
): Node[] {
  const nodes: Node[] = [];
  for (let i = 0; i < numNodes; i++) {
    nodes.push({
      id: i,
      x: startX + i * spacing,
      y: startY,
    });
  }
  return nodes;
}

/**
 * Creates an adjacency matrix for a path graph
 */
export function createPathMatrix(numVertices: number, edgeCount: number): AdjacencyMatrix {
  const matrix = Array.from({ length: numVertices }, () => Array(numVertices).fill(0));
  for (let i = 0; i < numVertices - 1; i++) {
    matrix[i][i + 1] = edgeCount;
  }
  return matrix;
}

/**
 * Creates an adjacency matrix for a bidirectional path graph
 */
export function createDoublePathMatrix(numVertices: number, edgeCount: number): AdjacencyMatrix {
  const matrix = Array.from({ length: numVertices }, () => Array(numVertices).fill(0));
  for (let i = 0; i < numVertices - 1; i++) {
    matrix[i][i + 1] = edgeCount;
    matrix[i + 1][i] = edgeCount;
  }
  return matrix;
}

/**
 * Creates an adjacency matrix for a cycle graph
 */
export function createCycleMatrix(numVertices: number, edgeCount: number): AdjacencyMatrix {
  const matrix = Array.from({ length: numVertices }, () => Array(numVertices).fill(0));
  for (let i = 0; i < numVertices; i++) {
    const nextNode = (i + 1) % numVertices;
    matrix[i][nextNode] = edgeCount;
  }
  return matrix;
}

/**
 * Creates an adjacency matrix for a bidirectional cycle graph
 */
export function createDoubleCycleMatrix(numVertices: number, edgeCount: number): AdjacencyMatrix {
  const matrix = Array.from({ length: numVertices }, () => Array(numVertices).fill(0));
  for (let i = 0; i < numVertices; i++) {
    const nextNode = (i + 1) % numVertices;
    matrix[i][nextNode] = edgeCount;
    matrix[nextNode][i] = edgeCount;
  }
  return matrix;
}

/**
 * Creates an adjacency matrix for a wheel graph
 * @param numVertices - Total vertices including center node
 */
export function createWheelMatrix(numVertices: number, edgeCount: number): AdjacencyMatrix {
  if (numVertices < 4) {
    throw new Error('Wheel graph requires at least 4 vertices');
  }

  const matrix = Array.from({ length: numVertices }, () => Array(numVertices).fill(0));
  const centerNodeId = 0;
  const outerVertices = numVertices - 1;

  // Create cycle for outer nodes (1 to numVertices-1)
  for (let i = 0; i < outerVertices; i++) {
    const currentNode = 1 + i;
    const nextNode = 1 + (i + 1) % outerVertices;
    matrix[currentNode][nextNode] = edgeCount;
  }

  // Connect center to all outer nodes
  for (let i = 0; i < outerVertices; i++) {
    const outerNode = 1 + i;
    matrix[centerNodeId][outerNode] = edgeCount;
  }

  return matrix;
}

/**
 * Creates an adjacency matrix for a bidirectional wheel graph
 */
export function createDoubleWheelMatrix(numVertices: number, edgeCount: number): AdjacencyMatrix {
  if (numVertices < 4) {
    throw new Error('Double wheel graph requires at least 4 vertices');
  }

  const matrix = Array.from({ length: numVertices }, () => Array(numVertices).fill(0));
  const centerNodeId = 0;
  const outerVertices = numVertices - 1;

  // Create bidirectional cycle for outer nodes
  for (let i = 0; i < outerVertices; i++) {
    const currentNode = 1 + i;
    const nextNode = 1 + (i + 1) % outerVertices;
    matrix[currentNode][nextNode] = edgeCount;
    matrix[nextNode][currentNode] = edgeCount;
  }

  // Connect center to all outer nodes bidirectionally
  for (let i = 0; i < outerVertices; i++) {
    const outerNode = 1 + i;
    matrix[centerNodeId][outerNode] = edgeCount;
    matrix[outerNode][centerNodeId] = edgeCount;
  }

  return matrix;
}

/**
 * Creates an adjacency matrix for a complete graph (clique)
 */
export function createCliqueMatrix(numVertices: number, edgeCount: number): AdjacencyMatrix {
  const matrix = Array.from({ length: numVertices }, () => Array(numVertices).fill(0));
  for (let i = 0; i < numVertices; i++) {
    for (let j = 0; j < numVertices; j++) {
      if (i !== j) {
        matrix[i][j] = edgeCount;
      }
    }
  }
  return matrix;
}

/**
 * Creates nodes for a wheel graph layout
 */
export function createWheelLayout(
  numVertices: number,
  centerX: number,
  centerY: number,
  nodeRadius: number
): Node[] {
  const nodes: Node[] = [];
  const outerVertices = numVertices - 1;
  const outerRadius = nodeRadius * 3 * outerVertices / (2 * Math.PI);

  // Center node
  nodes.push({ id: 0, x: centerX, y: centerY });

  // Outer nodes
  for (let i = 0; i < outerVertices; i++) {
    const angle = (i / outerVertices) * 2 * Math.PI;
    nodes.push({
      id: 1 + i,
      x: centerX + outerRadius * Math.cos(angle),
      y: centerY + outerRadius * Math.sin(angle),
    });
  }

  return nodes;
}

