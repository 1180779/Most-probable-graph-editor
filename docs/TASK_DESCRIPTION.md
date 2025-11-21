# Application Specification: Graph MCS Visualizer & Generator

## 1\. Project Overview

**Name:** Graph MCS Visualizer
**Goal:** A web-based tool to visually create two directed multigraphs ($G_1, G_2$) on interactive canvases, manually define a mapping between them, and export the raw adjacency data.
**Primary Use Case:** This tool is a "Ground Truth" generator. It creates the input data needed to test the correctness of a mathematical framework for finding the Minimum Common Supergraph (MCS).
**Note:** The tool **does not** calculate the MCS automatically. The solution area is a workspace for future manual verification or algorithm output integration.

## 2\. Technical Stack

* **Framework:** React (Vite)
* **Language:** TypeScript
* **Styling:** CSS Modules or Tailwind (Agent's choice)
* **Visualization:** Custom SVG or HTML5 Canvas implementation is required to support specific interactions (double-click creation, custom panning, node dragging).
    * *Libraries like `reactflow` or `visx` may be used if they support strict custom event handling (right-click pan, double-click add), but a custom SVG implementation is often simpler for this specific set of requirements.*
* **Icons:** `lucide-react` (for UI controls).

## 3\. Functional Requirements

### 3.1. Interactive Graph Canvases (Dual View)

The UI displays two distinct interactive areas: **Left ($G_1$)** and **Right ($G_2$)**.

* **Canvas Navigation (Panning):**
    * **Action:** Hold **Right Mouse Button** and drag on the background.
    * **Behavior:** The entire graph (all nodes and edges) moves in the direction of the drag (or opposite, depending on standard "hand tool" feel—implement standard "drag to move view" behavior).
* **Node Creation:**
    * **Action:** **Double-click** (Left button) anywhere on the canvas.
    * **Behavior:** A new node is created exactly at the mouse cursor coordinates $(x, y)$.
    * **Labeling:** Auto-incrementing ID ($0, 1, 2...$).
* **Node Interaction:**
    * **Dragging:** Users can click and drag a node to a new position. Edges connected to the node must update their positions in real-time.
    * **Selection:** Clicking a node selects it.
        * **Visuals:** Selected nodes show a distinct **outline** (stroke).
        * **Text:** Node labels must have `user-select: none` (text cannot be highlighted).
* **Edge Creation:**
    * **Action:** Click a source node (it becomes selected/highlighted), then click a target node.
    * **Multigraph Support:** Repeated connections increase the edge weight counter (displayed on the edge).
    * **Loops:** Clicking the source node twice creates a self-loop.
* **Edge Interaction:**
    * **Selection:** Clicking an edge selects it (visual outline). Text on edge is not selectable.
    * **Modification:** Right-click an edge to decrement its count or remove it.

### 3.2. Manual Mapping (The "Overlay" Logic)

Users define the "Ground Truth" mapping between $G_1$ and $G_2$.

* **Mapping Process:**
    1.  Select a node in Canvas $G_1$ (Node highlights).
    2.  Select a node in Canvas $G_2$ (Node highlights).
    3.  Trigger "Map" (via button or implicit second click).
* **Visual Feedback:**
    * Mapped pairs share a unique color coding (e.g., Node 0 in $G_1$ is Green, mapped Node 5 in $G_2$ turns Green).
    * Unmapped nodes remain default color.
* **Constraint:** One-to-One (Injective) mapping.

### 3.3. Solution Canvas (Placeholder)

* **State:** Initially **Empty**.
* **Behavior:** This area is reserved. Do **not** implement the mathematical MCS algorithm from the paper yet, as the tool is intended to verify that very algorithm.
* **Future Proofing:** Ensure the codebase has a slot/component ready to render a third graph here in the future.

### 3.4. File I/O (The Parser)

**Export Format (`.txt`):**
The file must contain 3 distinct graph sections (Graph 1, Graph 2, and Solution Graph). Even though the Solution Canvas is empty in the UI, the file structure must support the placeholder for the backend to fill or for the user to manually edit later.

Format structure (Adjacency Matrices):

```text
[Number of vertices N]
[Row 0: N integers space-separated]
...
[Row N-1]
[Number of vertices M]
[Row 0: M integers space-separated]
...
[Row M-1]
[Number of vertices K (Solution)]
...
```

* **Load:** Upload `.txt`. Parse matrices.
    * *Note:* Since the text file only contains topology (matrix) and not geometry (x,y), the loader should apply a simple force-directed layout or circular layout to position the nodes initially so they don't stack at (0,0).
* **Save:** Download `.txt`.
    * Exports the current topology of $G_1$, $G_2$.
    * Exports the Solution section (likely just `0` vertices or an empty matrix for now).

## 4\. Data Structures (TypeScript Interfaces)

```typescript
// Basic Adjacency Matrix
type AdjacencyMatrix = number[][];

interface Node {
  id: number;
  x: number;
  y: number;
}

interface GraphState {
  nodes: Node[];
  // Matrix stores the edges: matrix[source][target] = count
  matrix: AdjacencyMatrix; 
  // Viewport offset for panning
  viewOffset: { x: number; y: number }; 
  selectedElement: { type: 'node' | 'edge', id: string } | null;
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
|  [Load File] [Save File]                              |
+-------------------------------------------------------+
|  INSTRUCTIONS:                                        |
|  - Double Click: Add Node                             |
|  - Right Click Drag: Pan Canvas                       |
|  - Drag Node: Move                                    |
+--------------------------+----------------------------+
|        EDITOR G1         |         EDITOR G2          |
|                          |                            |
|     (Interactive SVG)    |     (Interactive SVG)      |
|                          |                            |
+--------------------------+----------------------------+
|             SOLUTION CANVAS (Placeholder)             |
|        (Currently Empty - Work in Progress)           |
+-------------------------------------------------------+
```

## 6\. Implementation Steps (Guide for Coding Agent)

1.  **Project Scaffold:** Vite + React + TS.
2.  **Core Math:** Implement `AdjacencyMatrix` logic (resize, update edges).
3.  **Canvas Component:**
    * Create `InteractiveCanvas`.
    * Implement `onContextMenu` (Right click) for panning (updating `viewOffset`).
    * Implement `onDoubleClick` for adding nodes at `(e.clientX - rect.left - offsetX, ...)`.
    * Implement `onMouseDown` on Nodes for dragging logic.
4.  **Rendering:**
    * Render Nodes as SVG `<circle>` with `<text>` (css `user-select: none`).
    * Render Edges as SVG `<path>` or `<line>`.
    * Implement outlines for `selectedElement`.
5.  **Mapping Logic:** State management to link $G_1$ selection to $G_2$ selection.
6.  **I/O Parser:**
    * Parser for the strict 3-graph text format.
    * Auto-layout function (e.g., `nodes[i] = {x: cos(i)*r, y: sin(i)*r}`) for loaded files without coordinates.
7.  **Styling:** Ensure clear separation between G1 and G2.

## 7\. Styling & CSS Requirements

* **Selection:** Selected nodes/edges must have a high-contrast outline (e.g., Orange or Blue glow).
* **Text:** All labels (Node IDs, Edge weights) must have `user-select: none; pointer-events: none;` to ensure clicks pass through to the shape or prevent text highlighting.
* **Pan Cursor:** When right-click dragging, change cursor to `grabbing`.