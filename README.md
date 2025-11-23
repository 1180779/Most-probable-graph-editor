# The Graph Editor - Powered by a Pretrained Generative Transformer

Welcome to the Graph Editor, a feature-rich, interactive tool for creating and manipulating graphs. This project was brought to you in large part by the capabilities of Large Language Models, showcasing a modern, AI-assisted approach to software development.

Check it out on github pages [here](https://1180779.github.io/Most-probable-graph-editor/)

## Features

*   **Interactive Canvases**: Multiple canvases for comparing and analyzing graphs (Graph 1, Graph 2, and a Solution view).
*   **Dynamic UI**:
    *   Resizable vertical and horizontal panes to customize your workspace.
    *   Toggleable visibility for the second graph and solution canvases via the "View" menu.
    *   A clean, app-like menu bar for all major operations.
*   **Complete Canvas Control**:
    *   **Pan**: Pan the canvas by middle-mouse-clicking and dragging.
    *   **Zoom**: Zoom in and out using the mouse wheel. The zoom is centered on your cursor for intuitive control.
    *   **Save/Load Canvas**: Save the entire state of a canvas (including node positions, zoom, and pan) to a JSON file and load it back later.
*   **Graph Manipulation**:
    *   **Add Nodes**: Double-click on an empty area of the canvas to create a new node.
    *   **Add Edges**: Right-click and drag from a source node to a target node to create an edge.
    *   **Multi-Select**: Hold **Shift** while clicking nodes or drag a selection box to select multiple nodes.
    *   **Move Nodes**: Click and drag a single node or multiple selected nodes.
    *   **Copy Nodes**: Select multiple nodes and right-click to access "Copy Selected Nodes" which duplicates the selected nodes with their internal edge structure. The copied nodes are automatically selected for easy repositioning.
*   **Rich Context Menus**:
    *   **Node Menu**: Right-click a node to delete it, add a self-loop, or manage its mapping.
    *   **Edge Menu**: Right-click an edge to delete it or set its weight using a modal dialog.
    *   **Canvas Menu**: Right-click the canvas to access high-level functions, including clearing the canvas and creating complex subgraphs.
*   **Subgraph Generation**:
    *   Quickly add common graph structures via the "Add Subgraph" context menu:
        *   Path & Double Path
        *   Cycle & Double Cycle
        *   Wheel & Double Wheel
        *   Clique & Double Clique
*   **Node Mapping**:
    *   Select a node in Graph 1 and a node in Graph 2 to create a visual mapping between them.
    *   Mapped nodes are colored to indicate their connection. The coloring is stable and will not change on subsequent mappings.
    *   Use the **'M'** key as a shortcut to map currently selected nodes.
*   **Project State**: Save and load the entire application state, including all graphs and mappings, to a single file.

## How to Use

1.  **Adding Nodes**: Double-click on the canvas.
2.  **Adding Edges**: Right-click and drag from one node to another.
3.  **Panning**: Middle-mouse-click and drag.
4.  **Zooming**: Use the mouse scroll wheel.
5.  **Copying Nodes**:
    *   Select multiple nodes (shift-click or drag a selection box).
    *   Right-click on the canvas.
    *   Choose "Copy Selected Nodes" from the context menu.
    *   The copied nodes will appear offset from the originals and will be automatically selected for easy repositioning.
6.  **Mapping Nodes**:
    *   Click a node in Graph 1.
    *   Click a node in Graph 2.
    *   Press the **'M'** key or use the "Map Selected Nodes" option in the "Tools" menu.
7.  **Accessing Menus**:
    *   **Top Menu Bar**: Access all major features like state management, UI settings, and mapping tools.
    *   **Context Menus**: Right-click on nodes, edges, or the canvas itself for context-specific actions.

## A Note on Development

This project was developed iteratively with significant assistance from an AI code assistant. The development process favored rapid prototyping and feature implementation over a rigid, predefined architecture. As such, you will find that the architecture is emergent rather than formally documented. This README serves as the primary guide to the project's functionality and structure.
