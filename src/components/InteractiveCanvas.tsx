import React, {useState, useRef, useEffect} from 'react';
import ContextMenu, {type MenuOption} from './ContextMenu';
import Modal from './Modal';
import './ContextMenu.css';

type AdjacencyMatrix = number[][];

interface Node {
    id: number;
    x: number;
    y: number;
}

interface GraphState {
    nodes: Node[];
    matrix: AdjacencyMatrix;
    viewOffset: { x: number; y: number };
    scale: number;
    selectedElement: { type: 'node' | 'edge'; id: string } | null;
}

interface NodeMapping {
    [g1Index: number]: { g2Index: number; colorIndex: number };
}

interface InteractiveCanvasProps {
    graph: GraphState;
    setGraph: React.Dispatch<React.SetStateAction<GraphState>>;
    onNodeSelectForMapping?: (nodeId: number | null) => void;
    onRemoveMapping?: (g1NodeId: number) => void;
    onSaveGraph?: (filename: string) => void;
    nodeMapping?: NodeMapping;
    isG2?: boolean;
    isSolution?: boolean;
    selectionForMapping?: number | null;
    nodeRadius: number;
    curveOffset: number;
}

const COLORS = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b',
    '#e377c2', '#7f7f7f', '#bcbd22', '#17becf', '#aec7e8', '#ffbb78',
    '#98df8a', '#ff9896', '#c5b0d5', '#c49c94', '#f7b6d2', '#c7c7c7',
    '#dbdb8d', '#9edae5'
];
const SELF_LOOP_RADIUS = 30;
const DRAG_THRESHOLD = 5; // Pixels to move before it's a drag

const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
                                                                 graph,
                                                                 setGraph,
                                                                 onNodeSelectForMapping,
                                                                 onRemoveMapping,
                                                                 onSaveGraph,
                                                                 nodeMapping = {},
                                                                 isG2 = false,
                                                                 isSolution = false,
                                                                 selectionForMapping,
                                                                 nodeRadius,
                                                                 curveOffset,
                                                             }) => {
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({x: 0, y: 0});
    const [draggingInfo, setDraggingInfo] = useState<{
        mouseStartX: number;
        mouseStartY: number;
        nodeInitialPositions: Map<number, { x: number; y: number }>;
    } | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: number } | null>(null);
    const [edgeContextMenu, setEdgeContextMenu] = useState<{
        x: number;
        y: number;
        sourceId: number;
        targetId: number
    } | null>(null);
    const [canvasContextMenu, setCanvasContextMenu] = useState<{ x: number; y: number } | null>(null);
    const [multiNodeContextMenu, setMultiNodeContextMenu] = useState<{ x: number; y: number } | null>(null);
    const [edgeCreation, setEdgeCreation] = useState<{
        startNodeId: number;
        endPos: { x: number; y: number }
    } | null>(null);
    const [rightClickDragInfo, setRightClickDragInfo] = useState<{
        startX: number;
        startY: number;
        nodeId: number
    } | null>(null);
    const [rightClickCanvasInfo, setRightClickCanvasInfo] = useState<{ startX: number; startY: number } | null>(null);
    const [selectionBox, setSelectionBox] = useState<{
        startX: number;
        startY: number;
        endX: number;
        endY: number
    } | null>(null);
    const [selectedNodeIds, setSelectedNodeIds] = useState<Set<number>>(new Set());
    const [canvasMouseDownInfo, setCanvasMouseDownInfo] = useState<{ x: number; y: number } | null>(null);

    // Modals for subgraph creation
    const [isPathModalOpen, setIsPathModalOpen] = useState(false);
    const [pathVertices, setPathVertices] = useState('5');
    const [pathEdgeCount, setPathEdgeCount] = useState('1');

    const [isDoublePathModalOpen, setIsDoublePathModalOpen] = useState(false);
    const [doublePathVertices, setDoublePathVertices] = useState('5');
    const [doublePathEdgeCount, setDoublePathEdgeCount] = useState('1');

    const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
    const [cycleVertices, setCycleVertices] = useState('5');
    const [cycleEdgeCount, setCycleEdgeCount] = useState('1');

    const [isDoubleCycleModalOpen, setIsDoubleCycleModalOpen] = useState(false);
    const [doubleCycleVertices, setDoubleCycleVertices] = useState('5');
    const [doubleCycleEdgeCount, setDoubleCycleEdgeCount] = useState('1');

    const [isWheelModalOpen, setIsWheelModalOpen] = useState(false);
    const [wheelVertices, setWheelVertices] = useState('5');
    const [wheelEdgeCount, setWheelEdgeCount] = useState('1');

    const [isDoubleWheelModalOpen, setIsDoubleWheelModalOpen] = useState(false);
    const [doubleWheelVertices, setDoubleWheelVertices] = useState('5');
    const [doubleWheelEdgeCount, setDoubleWheelEdgeCount] = useState('1');

    const [isCliqueModalOpen, setIsCliqueModalOpen] = useState(false);
    const [cliqueVertices, setCliqueVertices] = useState('5');
    const [cliqueEdgeCount, setCliqueEdgeCount] = useState('1');

    const [isEdgeModalOpen, setIsEdgeModalOpen] = useState(false);
    const [currentEdge, setCurrentEdge] = useState<{ sourceId: number; targetId: number } | null>(null);
    const [newEdgeCount, setNewEdgeCount] = useState('1');
    const svgRef = useRef<SVGSVGElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const svgElement = svgRef.current;
        if (!svgElement) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const scaleAmount = -e.deltaY * 0.001;
            setGraph(g => {
                const newScale = Math.max(0.1, g.scale + scaleAmount);
                const rect = svgElement.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                const newViewOffsetX = mouseX - (mouseX - g.viewOffset.x) * (newScale / g.scale);
                const newViewOffsetY = mouseY - (mouseY - g.viewOffset.y) * (newScale / g.scale);

                return {
                    ...g,
                    scale: newScale,
                    viewOffset: {x: newViewOffsetX, y: newViewOffsetY},
                };
            });
        };

        svgElement.addEventListener('wheel', handleWheel, {passive: false});

        return () => {
            svgElement.removeEventListener('wheel', handleWheel);
        };
    }, [graph.scale, graph.viewOffset.x, graph.viewOffset.y, setGraph]);

    const getRelativeMousePos = (e: React.MouseEvent) => {
        if (!svgRef.current) return {x: 0, y: 0};
        const rect = svgRef.current.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const getGraphPos = (e: React.MouseEvent) => {
        const {x, y} = getRelativeMousePos(e);
        return {
            x: (x - graph.viewOffset.x) / graph.scale,
            y: (y - graph.viewOffset.y) / graph.scale,
        };
    };

    const handleDoubleClick = (e: React.MouseEvent<SVGSVGElement>) => {
        if (e.target !== svgRef.current) return;
        setContextMenu(null);
        onNodeSelectForMapping?.(null);
        const {x, y} = getGraphPos(e);
        const newNode: Node = {id: graph.nodes.length, x, y};
        const newMatrix = graph.matrix.map(row => [...row, 0]);
        newMatrix.push(Array(graph.nodes.length + 1).fill(0));
        setGraph(g => ({...g, nodes: [...g.nodes, newNode], matrix: newMatrix, selectedElement: null}));
    };

    const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
        if (e.target === svgRef.current) {
            setContextMenu(null);
            setEdgeContextMenu(null);
            setCanvasContextMenu(null);
            setMultiNodeContextMenu(null);
            onNodeSelectForMapping?.(null);

            if (e.button === 0) {
                const {x, y} = getGraphPos(e);
                setCanvasMouseDownInfo({x, y});
            } else if (e.button === 2) {
                e.preventDefault();
                if (selectedNodeIds.size < 2) {
                    setSelectedNodeIds(new Set());
                    setGraph(g => ({...g, selectedElement: null}));
                }
                setRightClickCanvasInfo({startX: e.clientX, startY: e.clientY});
            }
        } else if (e.button === 1) {
            setIsPanning(true);
            setPanStart({x: e.clientX, y: e.clientY});
        }
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (canvasMouseDownInfo) {
            const {x: currentX, y: currentY} = getGraphPos(e);
            const dist = Math.sqrt(Math.pow(currentX - canvasMouseDownInfo.x, 2) + Math.pow(currentY - canvasMouseDownInfo.y, 2));

            if (dist > DRAG_THRESHOLD) {
                if (selectedNodeIds.size > 0) {
                    const nodeInitialPositions = new Map<number, { x: number; y: number }>();
                    graph.nodes.forEach(n => {
                        if (selectedNodeIds.has(n.id)) {
                            nodeInitialPositions.set(n.id, {x: n.x, y: n.y});
                        }
                    });
                    setDraggingInfo({
                        mouseStartX: canvasMouseDownInfo.x,
                        mouseStartY: canvasMouseDownInfo.y,
                        nodeInitialPositions,
                    });
                } else {
                    if (!e.shiftKey) {
                        setSelectedNodeIds(new Set());
                    }
                    setGraph(g => ({...g, selectedElement: null}));
                    setSelectionBox({
                        startX: canvasMouseDownInfo.x,
                        startY: canvasMouseDownInfo.y,
                        endX: currentX,
                        endY: currentY,
                    });
                }
                setCanvasMouseDownInfo(null);
            }
        }

        if (selectionBox) {
            const {x, y} = getGraphPos(e);
            setSelectionBox(sb => (sb ? {...sb, endX: x, endY: y} : null));
            return;
        }

        if (isPanning) {
            const dx = e.clientX - panStart.x;
            const dy = e.clientY - panStart.y;
            setGraph(g => ({...g, viewOffset: {x: g.viewOffset.x + dx, y: g.viewOffset.y + dy}}));
            setPanStart({x: e.clientX, y: e.clientY});
        } else if (draggingInfo) {
            const {x: mouseX, y: mouseY} = getGraphPos(e);
            const dx = mouseX - draggingInfo.mouseStartX;
            const dy = mouseY - draggingInfo.mouseStartY;

            setGraph(g => ({
                ...g,
                nodes: g.nodes.map(n => {
                    const initialPos = draggingInfo.nodeInitialPositions.get(n.id);
                    if (initialPos) {
                        return {...n, x: initialPos.x + dx, y: initialPos.y + dy};
                    }
                    return n;
                }),
            }));
        } else if (rightClickDragInfo) {
            const dist = Math.sqrt(Math.pow(e.clientX - rightClickDragInfo.startX, 2) + Math.pow(e.clientY - rightClickDragInfo.startY, 2));
            if (dist > DRAG_THRESHOLD) {
                onNodeSelectForMapping?.(null);
                const startNode = graph.nodes.find(n => n.id === rightClickDragInfo.nodeId);
                if (startNode) {
                    setEdgeCreation({startNodeId: rightClickDragInfo.nodeId, endPos: {x: startNode.x, y: startNode.y}});
                }
                setRightClickDragInfo(null);
            }
        } else if (rightClickCanvasInfo) {
            const dist = Math.sqrt(Math.pow(e.clientX - rightClickCanvasInfo.startX, 2) + Math.pow(e.clientY - rightClickCanvasInfo.startY, 2));
            if (dist > DRAG_THRESHOLD) {
                setIsPanning(true);
                setPanStart({x: e.clientX, y: e.clientY});
                setRightClickCanvasInfo(null);
            }
        } else if (edgeCreation) {
            const {x, y} = getGraphPos(e);
            setEdgeCreation(ec => (ec ? {...ec, endPos: {x, y}} : null));
        }
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (canvasMouseDownInfo) {
            if (!e.shiftKey) {
                setSelectedNodeIds(new Set());
                setGraph(g => ({...g, selectedElement: null}));
            }
            setCanvasMouseDownInfo(null);
        }

        if (selectionBox) {
            const {startX, startY, endX, endY} = selectionBox;
            const minX = Math.min(startX, endX);
            const maxX = Math.max(startX, endX);
            const minY = Math.min(startY, endY);
            const maxY = Math.max(startY, endY);

            const newlySelectedIds = new Set(selectedNodeIds);
            graph.nodes.forEach(node => {
                if (node.x >= minX && node.x <= maxX && node.y >= minY && node.y <= maxY) {
                    newlySelectedIds.add(node.id);
                }
            });
            setSelectedNodeIds(newlySelectedIds);
            setSelectionBox(null);
        }

        if (rightClickDragInfo) {
            onNodeSelectForMapping?.(null);
            setContextMenu({
                x: rightClickDragInfo.startX,
                y: rightClickDragInfo.startY,
                nodeId: rightClickDragInfo.nodeId
            });
        }
        if (rightClickCanvasInfo) {
            if (selectedNodeIds.size > 1) {
                setMultiNodeContextMenu({x: rightClickCanvasInfo.startX, y: rightClickCanvasInfo.startY});
            } else {
                setCanvasContextMenu({x: rightClickCanvasInfo.startX, y: rightClickCanvasInfo.startY});
            }
            setRightClickCanvasInfo(null);
        }
        setIsPanning(false);
        setDraggingInfo(null);
        setEdgeCreation(null);
        setRightClickDragInfo(null);
    };

    const handleContextMenu = (e: React.MouseEvent) => e.preventDefault();

    const handleNodeMouseDown = (e: React.MouseEvent, nodeId: number) => {
        e.stopPropagation();
        setContextMenu(null);
        setEdgeContextMenu(null);
        setCanvasContextMenu(null);
        setMultiNodeContextMenu(null);

        if (e.button === 0) {
            const {x: mouseStartX, y: mouseStartY} = getGraphPos(e);

            let nodesToDrag = new Set(selectedNodeIds);
            if (e.shiftKey) {
                setGraph(g => ({...g, selectedElement: null}));
                if (nodesToDrag.has(nodeId)) {
                    nodesToDrag.delete(nodeId);
                } else {
                    nodesToDrag.add(nodeId);
                }
            } else if (!nodesToDrag.has(nodeId)) {
                nodesToDrag = new Set([nodeId]);
            }
            setSelectedNodeIds(nodesToDrag);

            const nodeInitialPositions = new Map<number, { x: number; y: number }>();
            graph.nodes.forEach(n => {
                if (nodesToDrag.has(n.id)) {
                    nodeInitialPositions.set(n.id, {x: n.x, y: n.y});
                }
            });

            setDraggingInfo({mouseStartX, mouseStartY, nodeInitialPositions});

        } else if (e.button === 2) {
            e.preventDefault();
            setSelectedNodeIds(new Set());
            setGraph(g => ({...g, selectedElement: null}));
            setRightClickDragInfo({startX: e.clientX, startY: e.clientY, nodeId});
        }
    };

    const handleNodeMouseUp = (_: React.MouseEvent, targetNodeId: number) => {
        if (edgeCreation && edgeCreation.startNodeId !== targetNodeId) {
            const newMatrix = graph.matrix.map(r => [...r]);
            newMatrix[edgeCreation.startNodeId][targetNodeId]++;
            setGraph(g => ({...g, matrix: newMatrix}));
        }
        setEdgeCreation(null);
    };

    const handleNodeClick = (e: React.MouseEvent, nodeId: number) => {
        e.stopPropagation();
        if (onNodeSelectForMapping) {
            onNodeSelectForMapping(nodeId);
            setGraph(g => ({...g, selectedElement: {type: 'node', id: nodeId.toString()}}));
            setSelectedNodeIds(new Set());
        } else if (!e.shiftKey) {
            setGraph(g => ({...g, selectedElement: {type: 'node', id: nodeId.toString()}}));
            setSelectedNodeIds(new Set([nodeId]));
        }
    };

    const handleEdgeClick = (e: React.MouseEvent, sourceId: number, targetId: number) => {
        e.stopPropagation();
        onNodeSelectForMapping?.(null);
        setSelectedNodeIds(new Set());
        const edgeId = `${sourceId}-${targetId}`;
        if (graph.selectedElement?.id === edgeId) {
            const newMatrix = graph.matrix.map(r => [...r]);
            newMatrix[sourceId][targetId]++;
            setGraph(g => ({...g, matrix: newMatrix}));
        } else {
            setGraph(g => ({...g, selectedElement: {type: 'edge', id: edgeId}}));
        }
    };

    const handleEdgeContextMenu = (e: React.MouseEvent, sourceId: number, targetId: number) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu(null);
        setSelectedNodeIds(new Set());
        const edgeId = `${sourceId}-${targetId}`;
        if (graph.selectedElement?.type === 'edge' && graph.selectedElement.id === edgeId) {
            const newMatrix = graph.matrix.map(r => [...r]);
            let newCount = newMatrix[sourceId][targetId];
            if (newCount > 0) {
                newCount--;
                newMatrix[sourceId][targetId] = newCount;
            }
            setGraph(g => ({
                ...g,
                matrix: newMatrix,
                selectedElement: newCount === 0 ? null : g.selectedElement,
            }));
        } else {
            setGraph(g => ({...g, selectedElement: null}));
            setEdgeContextMenu({x: e.clientX, y: e.clientY, sourceId, targetId});
        }
    };

    const deleteNode = (nodeId: number) => {
        setGraph(g => {
            const newNodes = g.nodes.filter(n => n.id !== nodeId).map(n => (n.id > nodeId ? {...n, id: n.id - 1} : n));
            const newMatrix = g.matrix
                .filter((_, i) => i !== nodeId)
                .map(row => row.filter((_, j) => j !== nodeId));
            return {
                ...g,
                nodes: newNodes,
                matrix: newMatrix,
                selectedElement: null,
            };
        });
    };

    const deleteSelectedNodes = () => {
        if (selectedNodeIds.size === 0) return;

        setGraph(g => {
            const idMapping = new Map<number, number>();
            let newId = 0;
            for (let i = 0; i < g.nodes.length; i++) {
                if (!selectedNodeIds.has(i)) {
                    idMapping.set(i, newId++);
                }
            }

            const newNodes = g.nodes
                .filter(n => !selectedNodeIds.has(n.id))
                .map(n => ({...n, id: idMapping.get(n.id)!}));

            const newMatrix = g.matrix
                .filter((_, i) => !selectedNodeIds.has(i))
                .map(row => row.filter((_, j) => !selectedNodeIds.has(j)));

            return {
                ...g,
                nodes: newNodes,
                matrix: newMatrix,
                selectedElement: null,
            };
        });

        setSelectedNodeIds(new Set());
    };

    const addSelfLoop = (nodeId: number) => {
        const newMatrix = graph.matrix.map(r => [...r]);
        newMatrix[nodeId][nodeId]++;
        setGraph(g => ({...g, matrix: newMatrix}));
    };

    const deleteEdge = (sourceId: number, targetId: number) => {
        const newMatrix = graph.matrix.map(r => [...r]);
        newMatrix[sourceId][targetId] = 0;
        setGraph(g => ({...g, matrix: newMatrix, selectedElement: null}));
    };

    const handleSetEdgeCount = () => {
        if (!currentEdge) return;
        const count = parseInt(newEdgeCount, 10);
        if (!isNaN(count) && count >= 0) {
            const newMatrix = graph.matrix.map(r => [...r]);
            newMatrix[currentEdge.sourceId][currentEdge.targetId] = count;
            setGraph(g => ({...g, matrix: newMatrix}));
        } else {
            alert('Invalid input. Please enter a non-negative integer.');
        }
        setIsEdgeModalOpen(false);
        setCurrentEdge(null);
    };

    const openSetEdgeCountModal = (sourceId: number, targetId: number) => {
        setCurrentEdge({sourceId, targetId});
        setNewEdgeCount(String(graph.matrix[sourceId][targetId] || 1));
        setIsEdgeModalOpen(true);
    };

    const clearCanvas = () => {
        setGraph({
            nodes: [],
            matrix: [],
            viewOffset: {x: 0, y: 0},
            scale: 1,
            selectedElement: null,
        });
    };

    const handleLoadGraph = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const lines = content.split('\n');
            const size = parseInt(lines[0], 10);
            if (isNaN(size)) {
                alert('Invalid graph file format.');
                return;
            }
            const matrix = lines.slice(1, 1 + size).map(line => line.split(' ').map(Number));
            const numNodes = matrix.length;
            const nodes: Node[] = [];
            const radius = 150;
            const centerX = 250;
            const centerY = 250;
            for (let i = 0; i < numNodes; i++) {
                const angle = (i / numNodes) * 2 * Math.PI;
                nodes.push({id: i, x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle)});
            }
            setGraph(g => ({
                ...g,
                nodes,
                matrix,
                selectedElement: null,
            }));
        };
        reader.readAsText(file);
        if (event.target) {
            event.target.value = '';
        }
    };

    const triggerLoadGraph = () => {
        fileInputRef.current?.click();
    };

    const saveCanvas = () => {
        const fileContent = JSON.stringify(graph, null, 2);
        const blob = new Blob([fileContent], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'canvas_state.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleLoadCanvas = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const loadedGraph = JSON.parse(content);
                // Basic validation
                if (loadedGraph.nodes && loadedGraph.matrix && loadedGraph.viewOffset && loadedGraph.scale) {
                    setGraph(loadedGraph);
                } else {
                    alert('Invalid canvas state file format.');
                }
            } catch (_error) {
                alert('Error loading canvas state file.');
            }
        };
        reader.readAsText(file);
        if (event.target) {
            event.target.value = '';
        }
    };

    const triggerLoadCanvas = () => {
        canvasFileInputRef.current?.click();
    };

    const handleAddPath = () => {
        const numVertices = parseInt(pathVertices, 10);
        const edgeCount = parseInt(pathEdgeCount, 10);

        if (isNaN(numVertices) || numVertices <= 0 || isNaN(edgeCount) || edgeCount < 0) {
            alert('Invalid input. Please enter a positive number of vertices and a non-negative edge count.');
            return;
        }

        setGraph(g => {
            const startId = g.nodes.length;
            const newNodes: Node[] = [];
            const newIds = new Set<number>();

            const {x: startX, y: startY} = canvasContextMenu
                ? {
                    x: (canvasContextMenu.x - g.viewOffset.x) / g.scale,
                    y: (canvasContextMenu.y - g.viewOffset.y) / g.scale
                }
                : {x: 100, y: 100};

            for (let i = 0; i < numVertices; i++) {
                const newNodeId = startId + i;
                newNodes.push({
                    id: newNodeId,
                    x: startX + i * (nodeRadius * 4),
                    y: startY,
                });
                newIds.add(newNodeId);
            }

            const newSize = g.matrix.length + numVertices;
            const newMatrix = Array.from({length: newSize}, () => Array(newSize).fill(0));

            for (let i = 0; i < g.matrix.length; i++) {
                for (let j = 0; j < g.matrix.length; j++) {
                    newMatrix[i][j] = g.matrix[i][j];
                }
            }

            for (let i = 0; i < numVertices - 1; i++) {
                newMatrix[startId + i][startId + i + 1] = edgeCount;
            }

            setSelectedNodeIds(newIds);

            return {
                ...g,
                nodes: [...g.nodes, ...newNodes],
                matrix: newMatrix,
            };
        });
        setIsPathModalOpen(false);
    };

    const handleAddDoublePath = () => {
        const numVertices = parseInt(doublePathVertices, 10);
        const edgeCount = parseInt(doublePathEdgeCount, 10);

        if (isNaN(numVertices) || numVertices <= 0 || isNaN(edgeCount) || edgeCount < 0) {
            alert('Invalid input. Please enter a positive number of vertices and a non-negative edge count.');
            return;
        }

        setGraph(g => {
            const startId = g.nodes.length;
            const newNodes: Node[] = [];
            const newIds = new Set<number>();

            const {x: startX, y: startY} = canvasContextMenu
                ? {
                    x: (canvasContextMenu.x - g.viewOffset.x) / g.scale,
                    y: (canvasContextMenu.y - g.viewOffset.y) / g.scale
                }
                : {x: 100, y: 100};

            for (let i = 0; i < numVertices; i++) {
                const newNodeId = startId + i;
                newNodes.push({
                    id: newNodeId,
                    x: startX + i * (nodeRadius * 4),
                    y: startY,
                });
                newIds.add(newNodeId);
            }

            const newSize = g.matrix.length + numVertices;
            const newMatrix = Array.from({length: newSize}, () => Array(newSize).fill(0));

            for (let i = 0; i < g.matrix.length; i++) {
                for (let j = 0; j < g.matrix.length; j++) {
                    newMatrix[i][j] = g.matrix[i][j];
                }
            }

            for (let i = 0; i < numVertices - 1; i++) {
                newMatrix[startId + i][startId + i + 1] = edgeCount;
                newMatrix[startId + i + 1][startId + i] = edgeCount; // Doubly connected
            }

            setSelectedNodeIds(newIds);

            return {
                ...g,
                nodes: [...g.nodes, ...newNodes],
                matrix: newMatrix,
            };
        });
        setIsDoublePathModalOpen(false);
    };

    const handleAddCycle = () => {
        const numVertices = parseInt(cycleVertices, 10);
        const edgeCount = parseInt(cycleEdgeCount, 10);

        if (isNaN(numVertices) || numVertices <= 2 || isNaN(edgeCount) || edgeCount < 0) {
            alert('Invalid input. Please enter a number of vertices >= 3 and a non-negative edge count.');
            return;
        }

        setGraph(g => {
            const startId = g.nodes.length;
            const newNodes: Node[] = [];
            const newIds = new Set<number>();

            const {x: centerX, y: centerY} = canvasContextMenu
                ? {
                    x: (canvasContextMenu.x - g.viewOffset.x) / g.scale,
                    y: (canvasContextMenu.y - g.viewOffset.y) / g.scale
                }
                : {x: 200, y: 200};

            const radius = nodeRadius * 3 * numVertices / (2 * Math.PI); // Adjust radius based on numVertices

            for (let i = 0; i < numVertices; i++) {
                const angle = (i / numVertices) * 2 * Math.PI;
                const newNodeId = startId + i;
                newNodes.push({
                    id: newNodeId,
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle),
                });
                newIds.add(newNodeId);
            }

            const newSize = g.matrix.length + numVertices;
            const newMatrix = Array.from({length: newSize}, () => Array(newSize).fill(0));

            for (let i = 0; i < g.matrix.length; i++) {
                for (let j = 0; j < g.matrix.length; j++) {
                    newMatrix[i][j] = g.matrix[i][j];
                }
            }

            for (let i = 0; i < numVertices; i++) {
                const nextNode = (i + 1) % numVertices;
                newMatrix[startId + i][startId + nextNode] = edgeCount;
            }

            setSelectedNodeIds(newIds);

            return {
                ...g,
                nodes: [...g.nodes, ...newNodes],
                matrix: newMatrix,
            };
        });
        setIsCycleModalOpen(false);
    };

    const handleAddDoubleCycle = () => {
        const numVertices = parseInt(doubleCycleVertices, 10);
        const edgeCount = parseInt(doubleCycleEdgeCount, 10);

        if (isNaN(numVertices) || numVertices <= 2 || isNaN(edgeCount) || edgeCount < 0) {
            alert('Invalid input. Please enter a number of vertices >= 3 and a non-negative edge count.');
            return;
        }

        setGraph(g => {
            const startId = g.nodes.length;
            const newNodes: Node[] = [];
            const newIds = new Set<number>();

            const {x: centerX, y: centerY} = canvasContextMenu
                ? {
                    x: (canvasContextMenu.x - g.viewOffset.x) / g.scale,
                    y: (canvasContextMenu.y - g.viewOffset.y) / g.scale
                }
                : {x: 200, y: 200};

            const radius = nodeRadius * 3 * numVertices / (2 * Math.PI);

            for (let i = 0; i < numVertices; i++) {
                const angle = (i / numVertices) * 2 * Math.PI;
                const newNodeId = startId + i;
                newNodes.push({
                    id: newNodeId,
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle),
                });
                newIds.add(newNodeId);
            }

            const newSize = g.matrix.length + numVertices;
            const newMatrix = Array.from({length: newSize}, () => Array(newSize).fill(0));

            for (let i = 0; i < g.matrix.length; i++) {
                for (let j = 0; j < g.matrix.length; j++) {
                    newMatrix[i][j] = g.matrix[i][j];
                }
            }

            for (let i = 0; i < numVertices; i++) {
                const nextNode = (i + 1) % numVertices;
                newMatrix[startId + i][startId + nextNode] = edgeCount;
                newMatrix[startId + nextNode][startId + i] = edgeCount; // Doubly connected
            }

            setSelectedNodeIds(newIds);

            return {
                ...g,
                nodes: [...g.nodes, ...newNodes],
                matrix: newMatrix,
            };
        });
        setIsDoubleCycleModalOpen(false);
    };

    const handleAddWheel = () => {
        const numVertices = parseInt(wheelVertices, 10);
        const edgeCount = parseInt(wheelEdgeCount, 10);

        if (isNaN(numVertices) || numVertices <= 3 || isNaN(edgeCount) || edgeCount < 0) {
            alert('Invalid input. Please enter a number of vertices >= 4 and a non-negative edge count.');
            return;
        }

        setGraph(g => {
            const startId = g.nodes.length;
            const newNodes: Node[] = [];
            const newIds = new Set<number>();

            const {x: centerX, y: centerY} = canvasContextMenu
                ? {
                    x: (canvasContextMenu.x - g.viewOffset.x) / g.scale,
                    y: (canvasContextMenu.y - g.viewOffset.y) / g.scale
                }
                : {x: 200, y: 200};

            const outerRadius = nodeRadius * 3 * (numVertices - 1) / (2 * Math.PI);

            // Center node
            const centerNodeId = startId;
            newNodes.push({id: centerNodeId, x: centerX, y: centerY});
            newIds.add(centerNodeId);

            // Outer nodes
            for (let i = 0; i < numVertices - 1; i++) {
                const angle = (i / (numVertices - 1)) * 2 * Math.PI;
                const newNodeId = startId + 1 + i;
                newNodes.push({
                    id: newNodeId,
                    x: centerX + outerRadius * Math.cos(angle),
                    y: centerY + outerRadius * Math.sin(angle),
                });
                newIds.add(newNodeId);
            }

            const newSize = g.matrix.length + numVertices;
            const newMatrix = Array.from({length: newSize}, () => Array(newSize).fill(0));

            for (let i = 0; i < g.matrix.length; i++) {
                for (let j = 0; j < g.matrix.length; j++) {
                    newMatrix[i][j] = g.matrix[i][j];
                }
            }

            // Edges for the outer cycle
            for (let i = 0; i < numVertices - 1; i++) {
                const currentNode = startId + 1 + i;
                const nextNode = startId + 1 + (i + 1) % (numVertices - 1);
                newMatrix[currentNode][nextNode] = edgeCount;
            }

            // Edges from center to outer nodes
            for (let i = 0; i < numVertices - 1; i++) {
                const outerNode = startId + 1 + i;
                newMatrix[centerNodeId][outerNode] = edgeCount;
            }

            setSelectedNodeIds(newIds);

            return {
                ...g,
                nodes: [...g.nodes, ...newNodes],
                matrix: newMatrix,
            };
        });
        setIsWheelModalOpen(false);
    };

    const handleAddDoubleWheel = () => {
        const numVertices = parseInt(doubleWheelVertices, 10);
        const edgeCount = parseInt(doubleWheelEdgeCount, 10);

        if (isNaN(numVertices) || numVertices <= 3 || isNaN(edgeCount) || edgeCount < 0) {
            alert('Invalid input. Please enter a number of vertices >= 4 and a non-negative edge count.');
            return;
        }

        setGraph(g => {
            const startId = g.nodes.length;
            const newNodes: Node[] = [];
            const newIds = new Set<number>();

            const {x: centerX, y: centerY} = canvasContextMenu
                ? {
                    x: (canvasContextMenu.x - g.viewOffset.x) / g.scale,
                    y: (canvasContextMenu.y - g.viewOffset.y) / g.scale
                }
                : {x: 200, y: 200};

            const outerRadius = nodeRadius * 3 * (numVertices - 1) / (2 * Math.PI);

            // Center node
            const centerNodeId = startId;
            newNodes.push({id: centerNodeId, x: centerX, y: centerY});
            newIds.add(centerNodeId);

            // Outer nodes
            for (let i = 0; i < numVertices - 1; i++) {
                const angle = (i / (numVertices - 1)) * 2 * Math.PI;
                const newNodeId = startId + 1 + i;
                newNodes.push({
                    id: newNodeId,
                    x: centerX + outerRadius * Math.cos(angle),
                    y: centerY + outerRadius * Math.sin(angle),
                });
                newIds.add(newNodeId);
            }

            const newSize = g.matrix.length + numVertices;
            const newMatrix = Array.from({length: newSize}, () => Array(newSize).fill(0));

            for (let i = 0; i < g.matrix.length; i++) {
                for (let j = 0; j < g.matrix.length; j++) {
                    newMatrix[i][j] = g.matrix[i][j];
                }
            }

            // Edges for the outer cycle (doubly connected)
            for (let i = 0; i < numVertices - 1; i++) {
                const currentNode = startId + 1 + i;
                const nextNode = startId + 1 + (i + 1) % (numVertices - 1);
                newMatrix[currentNode][nextNode] = edgeCount;
                newMatrix[nextNode][currentNode] = edgeCount;
            }

            // Edges from center to outer nodes (doubly connected)
            for (let i = 0; i < numVertices - 1; i++) {
                const outerNode = startId + 1 + i;
                newMatrix[centerNodeId][outerNode] = edgeCount;
                newMatrix[outerNode][centerNodeId] = edgeCount;
            }

            setSelectedNodeIds(newIds);

            return {
                ...g,
                nodes: [...g.nodes, ...newNodes],
                matrix: newMatrix,
            };
        });
        setIsDoubleWheelModalOpen(false);
    };

    const handleAddClique = () => {
        const numVertices = parseInt(cliqueVertices, 10);
        const edgeCount = parseInt(cliqueEdgeCount, 10);

        if (isNaN(numVertices) || numVertices <= 0 || isNaN(edgeCount) || edgeCount < 0) {
            alert('Invalid input. Please enter a positive number of vertices and a non-negative edge count.');
            return;
        }

        setGraph(g => {
            const startId = g.nodes.length;
            const newNodes: Node[] = [];
            const newIds = new Set<number>();

            const {x: centerX, y: centerY} = canvasContextMenu
                ? {
                    x: (canvasContextMenu.x - g.viewOffset.x) / g.scale,
                    y: (canvasContextMenu.y - g.viewOffset.y) / g.scale
                }
                : {x: 200, y: 200};

            const radius = nodeRadius * 3 * numVertices / (2 * Math.PI);

            for (let i = 0; i < numVertices; i++) {
                const angle = (i / numVertices) * 2 * Math.PI;
                const newNodeId = startId + i;
                newNodes.push({
                    id: newNodeId,
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle),
                });
                newIds.add(newNodeId);
            }

            const newSize = g.matrix.length + numVertices;
            const newMatrix = Array.from({length: newSize}, () => Array(newSize).fill(0));

            for (let i = 0; i < g.matrix.length; i++) {
                for (let j = 0; j < g.matrix.length; j++) {
                    newMatrix[i][j] = g.matrix[i][j];
                }
            }

            for (let i = 0; i < numVertices; i++) {
                for (let j = 0; j < numVertices; j++) {
                    if (i !== j) {
                        newMatrix[startId + i][startId + j] = edgeCount;
                    }
                }
            }

            setSelectedNodeIds(newIds);

            return {
                ...g,
                nodes: [...g.nodes, ...newNodes],
                matrix: newMatrix,
            };
        });
        setIsCliqueModalOpen(false);
    };

    const shuffleSelectedNodes = () => {
        const selectedIds = Array.from(selectedNodeIds);
        if (selectedIds.length < 2) return;

        // Fisher‑Yates shuffle
        const shuffledIds = [...selectedIds];
        for (let i = shuffledIds.length - 1; i > 0; i--) {
            const r = Math.floor(Math.random() * (i + 1));
            [shuffledIds[i], shuffledIds[r]] = [shuffledIds[r], shuffledIds[i]];
        }

        const permutation = new Map<number, number>();
        selectedIds.forEach((oldId, i) => permutation.set(oldId, shuffledIds[i]));

        const reversePermutation = new Map<number, number>();
        shuffledIds.forEach((newId, i) => reversePermutation.set(newId, selectedIds[i]));
        const fullReversePermutation = (id: number) => reversePermutation.get(id) ?? id;

        const newSelectedNodeIds = new Set(selectedIds.map(id => permutation.get(id)!));

        setGraph(g => {
            const newNodes = g.nodes.map(node => ({...node, id: permutation.get(node.id) ?? node.id}));

            const n = g.matrix.length;
            const reorderedMatrix = Array.from({length: n}, (_, i) =>
                Array.from({length: n}, (_, j) => {
                    const oldI = fullReversePermutation(i);
                    const oldJ = fullReversePermutation(j);
                    return g.matrix[oldI][oldJ];
                })
            );

            newNodes.sort((a, b) => a.id - b.id);

            return {
                ...g,
                nodes: newNodes,
                matrix: reorderedMatrix,
            };
        });

        setSelectedNodeIds(newSelectedNodeIds);
    };

    const getNodeColor = (nodeId: number) => {
        if (isSolution) {
            const mappedInfo = Object.values(nodeMapping).find(
                (mapping) => mapping.g2Index === nodeId
            );
            if (mappedInfo) {
                return COLORS[mappedInfo.colorIndex % COLORS.length];
            }
        } else if (!isG2) {
            if (nodeMapping[nodeId]) {
                return COLORS[nodeMapping[nodeId].colorIndex % COLORS.length];
            }
        } else {
            const mappedInfo = Object.values(nodeMapping).find(
                (mapping) => mapping.g2Index === nodeId
            );
            if (mappedInfo) {
                return COLORS[mappedInfo.colorIndex % COLORS.length];
            }
        }
        return '#3498db';
    };

    const getEdgePath = (source: Node, target: Node, isBidirectional: boolean) => {
        if (source.id === target.id) {
            const x = source.x;
            const y = source.y;
            return `M ${x} ${y - nodeRadius} A ${SELF_LOOP_RADIUS} ${SELF_LOOP_RADIUS} 0 1 1 ${x + 1} ${y - nodeRadius}`;
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

        return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
    };

    const getTextPosition = (source: Node, target: Node, isBidirectional: boolean) => {
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / dist;
        const ny = dy / dist;

        if (source.id === target.id) {
            return {x: source.x, y: source.y - nodeRadius - SELF_LOOP_RADIUS - 10};
        }
        if (isBidirectional) {
            const labelOffset = curveOffset / 2 + 10;
            return {x: midX - ny * labelOffset, y: midY + nx * labelOffset};
        }
        return {x: midX - ny * 15, y: midY + nx * 15};
    };

    const contextMenuOptions = (nodeId: number): MenuOption[] => {
        const options: MenuOption[] = [
            {label: 'Delete Node', action: () => deleteNode(nodeId)},
            {label: 'Add Self-loop', action: () => addSelfLoop(nodeId)},
        ];

        if (onRemoveMapping) {
            if (!isG2 && nodeMapping[nodeId]) {
                options.push({label: 'Remove Mapping', action: () => onRemoveMapping(nodeId)});
            } else if (isG2) {
                const g1NodeId = Object.keys(nodeMapping).find(key => nodeMapping[Number(key)].g2Index === nodeId);
                if (g1NodeId !== undefined) {
                    options.push({label: 'Remove Mapping', action: () => onRemoveMapping(Number(g1NodeId))});
                }
            }
        }

        return options;
    };

    const canvasContextMenuOptions = (): MenuOption[] => {
        const options: MenuOption[] = [
            {
                label: 'Add Subgraph',
                subOptions: [
                    {label: 'Path', action: () => setIsPathModalOpen(true)},
                    {label: 'Double Path', action: () => setIsDoublePathModalOpen(true)},
                    {label: 'Cycle', action: () => setIsCycleModalOpen(true)},
                    {label: 'Double Cycle', action: () => setIsDoubleCycleModalOpen(true)},
                    {label: 'Wheel', action: () => setIsWheelModalOpen(true)},
                    {label: 'Double Wheel', action: () => setIsDoubleWheelModalOpen(true)},
                    {label: 'Clique', action: () => setIsCliqueModalOpen(true)},
                ]
            },
            {label: 'Clear Canvas', action: clearCanvas},
            {label: 'Save Canvas', action: saveCanvas},
            {label: 'Load Canvas', action: triggerLoadCanvas},
        ];
        if (onSaveGraph) {
            options.push({label: 'Save Graph', action: () => onSaveGraph('graph.txt')});
        }
        options.push({label: 'Load Graph', action: triggerLoadGraph});
        return options;
    };

    const multiNodeContextMenuOptions = (): MenuOption[] => {
        const options: MenuOption[] = [];
        if (selectedNodeIds.size > 0) {
            options.push({label: 'Remove Selected Nodes', action: deleteSelectedNodes});
            options.push({label: 'Shuffle Selected Nodes', action: shuffleSelectedNodes});
        }
        return options;
    };

    return (
        <div style={{flex: 1, border: '1px solid #ddd', position: 'relative', overflow: 'hidden'}}>
            <input type="file" ref={fileInputRef} onChange={handleLoadGraph} accept=".txt" style={{display: 'none'}}/>
            <input type="file" ref={canvasFileInputRef} onChange={handleLoadCanvas} accept=".json"
                   style={{display: 'none'}}/>
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    options={contextMenuOptions(contextMenu.nodeId)}
                />
            )}
            {edgeContextMenu && (
                <ContextMenu
                    x={edgeContextMenu.x}
                    y={edgeContextMenu.y}
                    onClose={() => setEdgeContextMenu(null)}
                    options={[
                        {
                            label: 'Delete Edge',
                            action: () => deleteEdge(edgeContextMenu.sourceId, edgeContextMenu.targetId)
                        },
                        {
                            label: 'Set Edge Count',
                            action: () => openSetEdgeCountModal(edgeContextMenu.sourceId, edgeContextMenu.targetId)
                        },
                    ]}
                />
            )}
            {canvasContextMenu && (
                <ContextMenu
                    x={canvasContextMenu.x}
                    y={canvasContextMenu.y}
                    onClose={() => setCanvasContextMenu(null)}
                    options={canvasContextMenuOptions()}
                />
            )}
            {multiNodeContextMenu && (
                <ContextMenu
                    x={multiNodeContextMenu.x}
                    y={multiNodeContextMenu.y}
                    onClose={() => setMultiNodeContextMenu(null)}
                    options={multiNodeContextMenuOptions()}
                />
            )}
            <Modal isOpen={isPathModalOpen} onClose={() => setIsPathModalOpen(false)}>
                <h2>Add Path</h2>
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <label>
                        Number of Vertices:
                        <input
                            type="number"
                            value={pathVertices}
                            onChange={e => setPathVertices(e.target.value)}
                            min="1"
                        />
                    </label>
                    <label>
                        Edge Count per Pair:
                        <input
                            type="number"
                            value={pathEdgeCount}
                            onChange={e => setPathEdgeCount(e.target.value)}
                            min="0"
                        />
                    </label>
                    <button onClick={handleAddPath}>Add Path</button>
                </div>
            </Modal>
            <Modal isOpen={isDoublePathModalOpen} onClose={() => setIsDoublePathModalOpen(false)}>
                <h2>Add Double Path</h2>
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <label>
                        Number of Vertices:
                        <input
                            type="number"
                            value={doublePathVertices}
                            onChange={e => setDoublePathVertices(e.target.value)}
                            min="1"
                        />
                    </label>
                    <label>
                        Edge Count per Pair:
                        <input
                            type="number"
                            value={doublePathEdgeCount}
                            onChange={e => setDoublePathEdgeCount(e.target.value)}
                            min="0"
                        />
                    </label>
                    <button onClick={handleAddDoublePath}>Add Double Path</button>
                </div>
            </Modal>
            <Modal isOpen={isCycleModalOpen} onClose={() => setIsCycleModalOpen(false)}>
                <h2>Add Cycle</h2>
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <label>
                        Number of Vertices:
                        <input
                            type="number"
                            value={cycleVertices}
                            onChange={e => setCycleVertices(e.target.value)}
                            min="3"
                        />
                    </label>
                    <label>
                        Edge Count per Pair:
                        <input
                            type="number"
                            value={cycleEdgeCount}
                            onChange={e => setCycleEdgeCount(e.target.value)}
                            min="0"
                        />
                    </label>
                    <button onClick={handleAddCycle}>Add Cycle</button>
                </div>
            </Modal>
            <Modal isOpen={isDoubleCycleModalOpen} onClose={() => setIsDoubleCycleModalOpen(false)}>
                <h2>Add Double Cycle</h2>
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <label>
                        Number of Vertices:
                        <input
                            type="number"
                            value={doubleCycleVertices}
                            onChange={e => setDoubleCycleVertices(e.target.value)}
                            min="3"
                        />
                    </label>
                    <label>
                        Edge Count per Pair:
                        <input
                            type="number"
                            value={doubleCycleEdgeCount}
                            onChange={e => setDoubleCycleEdgeCount(e.target.value)}
                            min="0"
                        />
                    </label>
                    <button onClick={handleAddDoubleCycle}>Add Double Cycle</button>
                </div>
            </Modal>
            <Modal isOpen={isWheelModalOpen} onClose={() => setIsWheelModalOpen(false)}>
                <h2>Add Wheel</h2>
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <label>
                        Number of Vertices (including center):
                        <input
                            type="number"
                            value={wheelVertices}
                            onChange={e => setWheelVertices(e.target.value)}
                            min="4"
                        />
                    </label>
                    <label>
                        Edge Count per Pair:
                        <input
                            type="number"
                            value={wheelEdgeCount}
                            onChange={e => setWheelEdgeCount(e.target.value)}
                            min="0"
                        />
                    </label>
                    <button onClick={handleAddWheel}>Add Wheel</button>
                </div>
            </Modal>
            <Modal isOpen={isDoubleWheelModalOpen} onClose={() => setIsDoubleWheelModalOpen(false)}>
                <h2>Add Double Wheel</h2>
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <label>
                        Number of Vertices (including center):
                        <input
                            type="number"
                            value={doubleWheelVertices}
                            onChange={e => setDoubleWheelVertices(e.target.value)}
                            min="4"
                        />
                    </label>
                    <label>
                        Edge Count per Pair:
                        <input
                            type="number"
                            value={doubleWheelEdgeCount}
                            onChange={e => setDoubleWheelEdgeCount(e.target.value)}
                            min="0"
                        />
                    </label>
                    <button onClick={handleAddDoubleWheel}>Add Double Wheel</button>
                </div>
            </Modal>
            <Modal isOpen={isCliqueModalOpen} onClose={() => setIsCliqueModalOpen(false)}>
                <h2>Add Clique</h2>
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <label>
                        Number of Vertices:
                        <input
                            type="number"
                            value={cliqueVertices}
                            onChange={e => setCliqueVertices(e.target.value)}
                            min="1"
                        />
                    </label>
                    <label>
                        Edge Count per Pair:
                        <input
                            type="number"
                            value={cliqueEdgeCount}
                            onChange={e => setCliqueEdgeCount(e.target.value)}
                            min="0"
                        />
                    </label>
                    <button onClick={handleAddClique}>Add Clique</button>
                </div>
            </Modal>
            <Modal isOpen={isEdgeModalOpen} onClose={() => setIsEdgeModalOpen(false)}>
                <h2>Set Edge Count</h2>
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <label>
                        Edge Count:
                        <input
                            type="number"
                            value={newEdgeCount}
                            onChange={e => setNewEdgeCount(e.target.value)}
                            min="0"
                        />
                    </label>
                    <button onClick={handleSetEdgeCount}>Set Count</button>
                </div>
            </Modal>
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                style={{cursor: isPanning ? 'grabbing' : 'default'}}
                onDoubleClick={handleDoubleClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onContextMenu={handleContextMenu}
            >
                <defs>
                    <marker
                        id="arrowhead"
                        markerWidth="8"
                        markerHeight="6"
                        markerUnits="strokeWidth"
                        refX="6"
                        refY="3"
                        orient="auto"
                        viewBox="0 0 8 6"
                    >
                        <path d="M0 0 L8 3 L0 6 Z" fill="#999"/>
                    </marker>

                    <marker
                        id="arrowhead-selected"
                        markerWidth="8"
                        markerHeight="6"
                        markerUnits="strokeWidth"
                        refX="6"
                        refY="3"
                        orient="auto"
                        viewBox="0 0 8 6"
                    >
                        <path d="M0 0 L8 3 L0 6 Z" fill="orange"/>
                    </marker>
                </defs>
                <g transform={`translate(${graph.viewOffset.x}, ${graph.viewOffset.y}) scale(${graph.scale})`}>
                    {selectionBox && (
                        <rect
                            x={Math.min(selectionBox.startX, selectionBox.endX)}
                            y={Math.min(selectionBox.startY, selectionBox.endY)}
                            width={Math.abs(selectionBox.startX - selectionBox.endX)}
                            height={Math.abs(selectionBox.startY - selectionBox.endY)}
                            fill="rgba(0, 123, 255, 0.2)"
                            stroke="rgba(0, 123, 255, 0.6)"
                            strokeWidth="1"
                            strokeDasharray="4 2"
                        />
                    )}
                    {graph.matrix.map((row, i) =>
                        row.map((count, j) => {
                            if (count > 0) {
                                const source = graph.nodes.find(n => n.id === i);
                                const target = graph.nodes.find(n => n.id === j);
                                if (source && target) {
                                    const edgeId = `${i}-${j}`;
                                    const isSelected = graph.selectedElement?.id === edgeId;
                                    const isBidirectional = graph.matrix[j]?.[i] > 0 && i !== j;
                                    const path = getEdgePath(source, target, isBidirectional);
                                    const textPos = getTextPosition(source, target, isBidirectional);

                                    return (
                                        <g key={edgeId} onClick={(e) => handleEdgeClick(e, i, j)}
                                           onContextMenu={(e) => handleEdgeContextMenu(e, i, j)}>
                                            <path d={path} stroke="transparent" strokeWidth="15" fill="none"
                                                  style={{cursor: 'pointer'}}/>
                                            <path
                                                d={path}
                                                stroke={isSelected ? 'orange' : '#999'}
                                                strokeWidth="2"
                                                fill="none"
                                                markerEnd={isSelected ? 'url(#arrowhead-selected)' : 'url(#arrowhead)'}
                                                style={{pointerEvents: 'none'}}
                                            />
                                            <text
                                                x={textPos.x}
                                                y={textPos.y}
                                                textAnchor="middle"
                                                dy=".3em"
                                                fill="#333"
                                                stroke="white"
                                                strokeWidth="0.25em"
                                                paintOrder="stroke"
                                                style={{userSelect: 'none', pointerEvents: 'none', fontSize: '14px'}}
                                            >
                                                {count}
                                            </text>
                                        </g>
                                    );
                                }
                            }
                            return null;
                        })
                    )}

                    {edgeCreation && (
                        <line
                            x1={graph.nodes.find(n => n.id === edgeCreation.startNodeId)?.x}
                            y1={graph.nodes.find(n => n.id === edgeCreation.startNodeId)?.y}
                            x2={edgeCreation.endPos.x}
                            y2={edgeCreation.endPos.y}
                            stroke="#3498db"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                        />
                    )}

                    {graph.nodes.map(node => {
                        const isSelected = selectedNodeIds.has(node.id);
                        return (
                            <g
                                key={node.id}
                                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                                onMouseUp={(e) => handleNodeMouseUp(e, node.id)}
                                onClick={(e) => handleNodeClick(e, node.id)}
                                style={{cursor: 'pointer'}}
                            >
                                <circle
                                    cx={node.x}
                                    cy={node.y}
                                    r={nodeRadius}
                                    fill={getNodeColor(node.id)}
                                    stroke={selectionForMapping === node.id || isSelected ? 'orange' : '#2980b9'}
                                    strokeWidth={3}
                                />
                                <text x={node.x} y={node.y} textAnchor="middle" dy=".3em" fill="white"
                                      style={{userSelect: 'none', pointerEvents: 'none'}}>
                                    {node.id}
                                </text>
                            </g>
                        );
                    })}
                </g>
            </svg>
        </div>
    );
};

export default InteractiveCanvas;
