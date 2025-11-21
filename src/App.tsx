import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import InteractiveCanvas from './components/InteractiveCanvas';
import SettingsPanel from './components/SettingsPanel';
import MenuBar, { type MenuBarItem } from './components/MenuBar';

// Data Structures as per spec
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

const initialGraphState: GraphState = {
  nodes: [],
  matrix: [],
  viewOffset: { x: 0, y: 0 },
  scale: 1,
  selectedElement: null,
};

const App: React.FC = () => {
  const [graph1, setGraph1] = useState<GraphState>(initialGraphState);
  const [graph2, setGraph2] = useState<GraphState>(initialGraphState);
  const [solutionGraph, setSolutionGraph] = useState<GraphState>(initialGraphState);
  const [nodeMapping, setNodeMapping] = useState<NodeMapping>({});
  const [selectionForMapping, setSelectionForMapping] = useState<{ g1: number | null; g2: number | null }>({ g1: null, g2: null });
  const [horizontalDivider, setHorizontalDivider] = useState(50);
  const [verticalDivider, setVerticalDivider] = useState(50);
  const [isDraggingHorizontal, setIsDraggingHorizontal] = useState(false);
  const [isDraggingVertical, setIsDraggingVertical] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGraph2, setShowGraph2] = useState(true);
  const [showSolution, setShowSolution] = useState(true);
  const [nodeRadius, setNodeRadius] = useState(10);
  const [curveOffset, setCurveOffset] = useState(0);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const stateFileInputRef = useRef<HTMLInputElement>(null);
  const [nextColorIndex, setNextColorIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'm') {
        handleMapNodes();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectionForMapping, nodeMapping]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingHorizontal && mainContentRef.current) {
        const rect = mainContentRef.current.getBoundingClientRect();
        const newPosition = ((e.clientY - rect.top) / rect.height) * 100;
        if (newPosition > 10 && newPosition < 90) {
          setHorizontalDivider(newPosition);
        }
      } else if (isDraggingVertical && mainContentRef.current) {
        const topGraphsRect = mainContentRef.current.children[0].getBoundingClientRect();
        const newPosition = ((e.clientX - topGraphsRect.left) / topGraphsRect.width) * 100;
        if (newPosition > 10 && newPosition < 90) {
          setVerticalDivider(newPosition);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingHorizontal(false);
      setIsDraggingVertical(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingHorizontal, isDraggingVertical]);

  const formatMatrix = (matrix: AdjacencyMatrix): string => {
    const n = matrix.length;
    if (n === 0) return '0';
    return `${n}\n${matrix.map(row => row.join(' ')).join('\n')}`;
  };

  const handleSaveGraph = (graph: GraphState, filename: string) => {
    const fileContent = formatMatrix(graph.matrix);
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveState = () => {
    const state = {
      graph1,
      graph2,
      nodeMapping,
      nextColorIndex,
    };
    const fileContent = JSON.stringify(state, null, 2);
    const blob = new Blob([fileContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project_state.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadState = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const state = JSON.parse(content);
        if (state.graph1 && state.graph2 && state.nodeMapping) {
          setGraph1(state.graph1);
          setGraph2(state.graph2);
          setNodeMapping(state.nodeMapping);
          setNextColorIndex(state.nextColorIndex || 0);
        } else {
          alert('Invalid state file format.');
        }
      } catch (error) {
        alert('Error loading state file. Make sure it is a valid JSON file.');
      }
    };
    reader.readAsText(file);
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleNodeSelection = (graphId: 'g1' | 'g2', nodeId: number | null) => {
    setSelectionForMapping(prev => ({ ...prev, [graphId]: nodeId }));
  };

  const handleMapNodes = () => {
    const { g1, g2 } = selectionForMapping;
    if (g1 === null || g2 === null) return;

    const isG1NodeMapped = Object.keys(nodeMapping).some(key => parseInt(key, 10) === g1);
    const isG2NodeMapped = Object.values(nodeMapping).some(val => val.g2Index === g2);

    if (isG1NodeMapped || isG2NodeMapped) {
      alert('One of the selected nodes is already mapped.');
      return;
    }

    setNodeMapping(prev => ({ ...prev, [g1]: { g2Index: g2, colorIndex: nextColorIndex } }));
    setNextColorIndex(prev => prev + 1);
    setSelectionForMapping({ g1: null, g2: null });
    setGraph1(g => ({ ...g, selectedElement: null }));
    setGraph2(g => ({ ...g, selectedElement: null }));
  };

  const handleClearAllMappings = () => {
    setNodeMapping({});
    setNextColorIndex(0);
  };

  const handleRemoveMapping = (g1NodeId: number) => {
    setNodeMapping(prev => {
      const newMapping = { ...prev };
      delete newMapping[g1NodeId];
      return newMapping;
    });
  };

  const createMappedGraph = () => {
    const mappedG1Nodes = Object.keys(nodeMapping).map(Number);
    const numNodes = mappedG1Nodes.length;
    if (numNodes === 0) {
      setSolutionGraph(initialGraphState);
      return;
    }

    const newMatrix: AdjacencyMatrix = Array(numNodes).fill(0).map(() => Array(numNodes).fill(0));
    const newNodes: Node[] = mappedG1Nodes.map((g1NodeId, i) => {
      const g1Node = graph1.nodes.find(n => n.id === g1NodeId);
      return { id: i, x: g1Node?.x || 0, y: g1Node?.y || 0 };
    });

    for (let i = 0; i < numNodes; i++) {
      for (let j = 0; j < numNodes; j++) {
        const g1Source = mappedG1Nodes[i];
        const g1Target = mappedG1Nodes[j];
        const g2Source = nodeMapping[g1Source].g2Index;
        const g2Target = nodeMapping[g1Target].g2Index;

        const g1EdgeCount = graph1.matrix[g1Source]?.[g1Target] || 0;
        const g2EdgeCount = graph2.matrix[g2Source]?.[g2Target] || 0;

        newMatrix[i][j] = Math.max(g1EdgeCount, g2EdgeCount);
      }
    }

    setSolutionGraph({
      nodes: newNodes,
      matrix: newMatrix,
      viewOffset: { x: 0, y: 0 },
      scale: 1,
      selectedElement: null,
    });
  };

  const triggerStateFileLoad = () => {
    stateFileInputRef.current?.click();
  };

  const menuItems: MenuBarItem[] = [
    {
      label: 'Project',
      options: [
        {
          label: 'State',
          subOptions: [
            { label: 'Save State', action: handleSaveState },
            { label: 'Load State', action: triggerStateFileLoad },
          ]
        },
        { label: 'Settings', action: () => setShowSettings(!showSettings) },
      ]
    },
    {
        label: 'View',
        options: [
            { label: 'Graph 2', action: () => setShowGraph2(!showGraph2) },
            { label: 'Solution', action: () => setShowSolution(!showSolution) },
        ]
    },
    {
      label: 'Tools',
      options: [
        { label: 'Map Selected Nodes (M)', action: handleMapNodes, disabled: selectionForMapping.g1 === null || selectionForMapping.g2 === null },
        { label: 'Clear mapping', action: handleClearAllMappings },
        { label: 'Create from mapping', action: createMappedGraph },
      ]
    }
  ];

  return (
    <div className="app-container">
      <header className="app-header">
        <MenuBar items={menuItems} />
        <input type="file" ref={stateFileInputRef} onChange={handleLoadState} accept=".json" style={{ display: 'none' }} />
      </header>
      {showSettings && (
        <SettingsPanel
          nodeRadius={nodeRadius}
          setNodeRadius={setNodeRadius}
          curveOffset={curveOffset}
          setCurveOffset={setCurveOffset}
          onClose={() => setShowSettings(false)}
        />
      )}
      <main className="main-content" ref={mainContentRef}>
        <div className="top-graphs-container" style={{ height: `${horizontalDivider}%` }}>
          <div className="graph-editor-container" style={{ width: showGraph2 ? `${verticalDivider}%` : '100%' }}>
            <h2>Graph 1 (G1)</h2>
            <InteractiveCanvas
              graph={graph1}
              setGraph={setGraph1}
              onNodeSelectForMapping={(nodeId) => handleNodeSelection('g1', nodeId)}
              onRemoveMapping={handleRemoveMapping}
              onSaveGraph={(filename) => handleSaveGraph(graph1, filename)}
              nodeMapping={nodeMapping}
              selectionForMapping={selectionForMapping.g1}
              nodeRadius={nodeRadius}
              curveOffset={curveOffset}
            />
          </div>
          {showGraph2 && <div className="resizer-vertical" onMouseDown={() => setIsDraggingVertical(true)} />}
          {showGraph2 && (
            <div className="graph-editor-container" style={{ width: `${100 - verticalDivider}%` }}>
              <h2>Graph 2 (G2)</h2>
              <InteractiveCanvas
                graph={graph2}
                setGraph={setGraph2}
                onNodeSelectForMapping={(nodeId) => handleNodeSelection('g2', nodeId)}
                onRemoveMapping={handleRemoveMapping}
                onSaveGraph={(filename) => handleSaveGraph(graph2, filename)}
                nodeMapping={nodeMapping}
                isG2
                selectionForMapping={selectionForMapping.g2}
                nodeRadius={nodeRadius}
                curveOffset={curveOffset}
              />
            </div>
          )}
        </div>
        {showSolution && <div className="resizer-horizontal" onMouseDown={() => setIsDraggingHorizontal(true)} />}
        {showSolution && (
          <div className="solution-container" style={{ height: `${100 - horizontalDivider}%` }}>
            <h2>Solution Canvas</h2>
            <InteractiveCanvas
              graph={solutionGraph}
              setGraph={setSolutionGraph}
              onSaveGraph={(filename) => handleSaveGraph(solutionGraph, filename)}
              nodeMapping={nodeMapping}
              isSolution
              nodeRadius={nodeRadius}
              curveOffset={curveOffset}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
