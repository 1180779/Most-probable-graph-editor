# Application Specification: Graph MCS Visualizer & Generator

## 1\. Project Overview

**Name:** Graph MCS Visualizer
**Goal:** A web-based tool to visually create two directed multigraphs ($G_1, G_2$), manually define a mapping between them to simulate a Maximum Common Subgraph (mcs) configuration, and export the data for testing backend algorithms.
**Context:** Based on the problem of finding the Minimum Common Supergraph (MCS) by extending $G_2$ to contain $G_1$.

## 2\. Technical Stack

* **Framework:** React (Vite)
* **Language:** TypeScript
* **Styling:** CSS Modules or Tailwind (Agent's choice)
* **Visualization:** Native SVG or a lightweight library (e.g., `react-d3-graph` or `cytoscape.js`)—*Must support multigraphs (multiple edges between same nodes).*
* **Icons:** `lucide-react` (for UI controls).

## 3\. Functional Requirements

### 3.1. Graph Editors (Dual View)

The UI must display two distinct canvas areas: **Left ($G_1$)** and **Right ($G_2$)**.

* **Node Creation:** Click on empty space to add a vertex. Vertices should be auto-labeled ($0, 1, 2...$).
* **Edge Creation:** Drag from Node A to Node B to create a directed edge.
* **Multigraph Support:**
    * Repeatedly drawing an edge from A to B increases the edge count (weight).
    * Right-clicking an edge allows decrementing the count.
    * Visual representation: Show a number on the edge (e.g., "x2", "x3") if the count \> 1.
* **Loops:** Support drawing an edge from Node A to Node A.
* **Clear/Reset:** Button to wipe the canvas.

### 3.2. Manual Mapping (The "Overlay" Logic)

To visualize the solution and create "Ground Truth" data, the user needs to define which nodes in $G_1$ correspond to nodes in $G_2$.

* **Interaction:** Users can select a "Mapping Mode." In this mode, clicking a node in $G_1$ and then clicking a node in $G_2$ links them.
* **Visual Feedback:**
    * Mapped nodes share a distinct color (e.g., Node 0 in $G_1$ turns Blue, matched Node 2 in $G_2$ turns Blue).
    * Unmapped nodes remain neutral.
* **Constraint:** A One-to-One (Injective) mapping. A node in $G_1$ can map to at most one node in $G_2$, and vice versa.

### 3.3. Solution Preview (Real-time MCS Calculation)

Based on the *manual mapping* defined in 3.2, display a third graph (or a modal preview) representing the **Minimal Common Supergraph (MCS)**.

* **Logic (Derived from PDF):**
    1.  Start with a copy of $G_2$.
    2.  Add unmapped vertices from $G_1$ as new nodes.
    3.  For edges between mapped nodes $u, v$: Edge count = $\max(Edges_{G1}(u,v), Edges_{G2}(\phi(u), \phi(v)))$.
    4.  For edges involving unmapped nodes: Simply add the edges from $G_1$.
* **Purpose:** Allows the user to verify visually "If the algorithm finds *this* mapping, the resulting graph looks like *this*."

### 3.4. File I/O (The Parser)

**Export Format (`.txt`):**
The file must contain 3 distinct graph sections (Graph 1, Graph 2, and optionally the Solution Graph).

Format structure:

```text
[Number of vertices N]
[Row 0: N integers space-separated]
[Row 1: N integers space-separated]
...
[Row N-1: N integers space-separated]
```

**Example File Content:**

```text
3
0 1 0
0 0 2
1 0 1
4
0 2 0 0
1 0 1 0
0 0 0 0
0 0 0 1
5
... (Adjacency matrix of the solution graph)
```

* **Load:** Upload a `.txt` file. Parse the first two matrices into the $G_1$ and $G_2$ editors.
* **Save:** Download a `.txt` file containing $G_1$, $G_2$, and the calculated MCS (Solution) based on the current manual mapping.

### 3.5. Solution Placeholder

* Add a prominent button labeled **"Export Solution (Independent)"**.
* Currently, this button should just log to console or download a placeholder file. (To be implemented later for algorithmic output).

## 4\. Data Structures (TypeScript Interfaces)

```typescript
// Basic Adjacency Matrix: matrix[from][to] = number_of_edges
type AdjacencyMatrix = number[][];

interface GraphData {
  id: string; // 'G1' or 'G2'
  vertexCount: number;
  matrix: AdjacencyMatrix;
  // Optional: coordinates for UI persistence
  layout?: { x: number; y: number }[]; 
}

// The mapping defined by the user
interface NodeMapping {
  // Key: Index in G1, Value: Index in G2
  [g1Index: number]: number; 
}
```

## 5\. UI Layout Wireframe

```
+-------------------------------------------------------+
|  [Load File] [Save File] [Export Solution Button]     |
+-------------------------------------------------------+
|                     MAPPING STATUS:                   |
|       G1 Node 0 <-> G2 Node 2  (Color: Blue)          |
+--------------------------+----------------------------+
|        EDITOR G1         |         EDITOR G2          |
|                          |                            |
|     (Canvas Area)        |       (Canvas Area)        |
| [Add Node] [Clear]       |   [Add Node] [Clear]       |
|                          |                            |
+--------------------------+----------------------------+
|             PREVIEW: RESULTING MCS GRAPH              |
|        (Calculated from G1 + G2 + Mapping)            |
+-------------------------------------------------------+
```

## 6\. Implementation Steps (Guide for Coding Agent)

1.  **Setup:** Initialize Vite + React + TS project.
2.  **Core Logic:** Implement the `AdjacencyMatrix` helper class (add vertex, add edge, remove edge, resize matrix).
3.  **Graph Component:** Create a reusable `GraphCanvas` component that renders nodes/edges from a matrix. Implement dragging for edges.
4.  **State Manager:** Create a parent component to hold state for `matrix1`, `matrix2`, and `mapping`.
5.  **Interaction:** Implement the click-to-map logic (select node in G1 -\> store ID -\> select node in G2 -\> update `mapping` state).
6.  **MCS Algorithm:** Write a pure function `calculateMCS(g1, g2, mapping)` that returns a new matrix.
7.  **File I/O:** Implement the parser for the string format specified in section 3.4.
8.  **Styling:** Apply basic clean layout.

## 7\. Edge Cases to Handle

* **Matrix Resizing:** When adding a node, the matrix grows by 1 row and 1 column.
* **Orphans:** The parser must handle graphs where $N$ is given but the matrix is all zeros.
* **Self-loops:** Ensure the visualization renders an edge pointing back to the node itself clearly.
* **Unmapped Nodes:** Ensure the MCS calculation correctly appends unmapped nodes from $G_1$ to the end of the $G_2$ matrix (or calculates the new size correctly: $Size_{G2} + Size_{G1} - Size_{Mapped}$).


