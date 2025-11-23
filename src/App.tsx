import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import InteractiveCanvas from './components/InteractiveCanvas';
import SettingsPanel from './components/SettingsPanel';
import MenuBar, { type MenuBarItem } from './components/MenuBar';
import type { GraphState, EdgeCombineStrategy, SolutionNodeMapping } from './types/graph.types';
import { initialGraphState } from './utils/stateManager';
import { useNodeMapping } from './hooks/useNodeMapping';
import {
  saveStateToFile,
  loadAppState,
  saveGraphToFile,
  createSolutionFromMapping
} from './utils/stateManager';
import { loadSettings, saveSettings } from './utils/localStorage';

const App: React.FC = () => {
  const [graph1, setGraph1] = useState<GraphState>(initialGraphState);
  const [graph2, setGraph2] = useState<GraphState>(initialGraphState);
  const [solutionGraph, setSolutionGraph] = useState<GraphState>(initialGraphState);
  const [solutionNodeMapping, setSolutionNodeMapping] = useState<SolutionNodeMapping>({});

  // Load settings from local storage
  const savedSettings = loadSettings();
  const [edgeCombineStrategy, setEdgeCombineStrategy] = useState<EdgeCombineStrategy>(savedSettings.edgeCombineStrategy);

  const {
    nodeMapping,
    setNodeMapping,
    selectionForMapping,
    nextColorIndex,
    setNextColorIndex,
    handleNodeSelection,
    handleMapNodes,
    handleClearAllMappings,
    handleRemoveMapping,
  } = useNodeMapping();

  const [horizontalDivider, setHorizontalDivider] = useState(savedSettings.horizontalDivider);
  const [verticalDivider, setVerticalDivider] = useState(savedSettings.verticalDivider);
  const [isDraggingHorizontal, setIsDraggingHorizontal] = useState(false);
  const [isDraggingVertical, setIsDraggingVertical] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGraph2, setShowGraph2] = useState(savedSettings.showGraph2);
  const [showSolution, setShowSolution] = useState(savedSettings.showSolution);
  const [nodeRadius, setNodeRadius] = useState(savedSettings.nodeRadius);
  const [curveOffset, setCurveOffset] = useState(savedSettings.curveOffset);
  const [layoutRadius, setLayoutRadius] = useState(savedSettings.layoutRadius);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const stateFileInputRef = useRef<HTMLInputElement>(null);

  // Save settings to local storage whenever they change
  useEffect(() => {
    saveSettings({
      nodeRadius,
      curveOffset,
      layoutRadius,
      horizontalDivider,
      verticalDivider,
      showGraph2,
      showSolution,
      edgeCombineStrategy,
    });
  }, [nodeRadius, curveOffset, layoutRadius, horizontalDivider, verticalDivider, showGraph2, showSolution, edgeCombineStrategy]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'm') {
        const success = handleMapNodes();
        if (!success && selectionForMapping.g1 !== null && selectionForMapping.g2 !== null) {
          alert('One of the selected nodes is already mapped.');
        }
        if (success) {
          setGraph1(g => ({ ...g, selectedElement: null }));
          setGraph2(g => ({ ...g, selectedElement: null }));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectionForMapping, nodeMapping, handleMapNodes]);

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


  const handleSaveState = () => {
    saveStateToFile({
      graph1,
      graph2,
      solutionGraph,
      nodeMapping,
      nextColorIndex,
      edgeCombineStrategy,
    });
  };

  const handleLoadState = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const state = loadAppState(content);
        if (state.graph1) setGraph1(state.graph1);
        if (state.graph2) setGraph2(state.graph2);
        if (state.nodeMapping) setNodeMapping(state.nodeMapping);
        if (state.nextColorIndex !== undefined) setNextColorIndex(state.nextColorIndex);
        if (state.edgeCombineStrategy) setEdgeCombineStrategy(state.edgeCombineStrategy);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Error loading state file. Make sure it is a valid JSON file.');
      }
    };
    reader.readAsText(file);
    if (event.target) {
      event.target.value = '';
    }
  };

  const createMappedGraph = () => {
    const { graph, solutionMapping } = createSolutionFromMapping(graph1, graph2, nodeMapping, edgeCombineStrategy);
    setSolutionGraph(graph);
    setSolutionNodeMapping(solutionMapping);
  };

  const triggerStateFileLoad = () => {
    stateFileInputRef.current?.click();
  };

  const handleResetSettings = () => {
    const defaults = {
      nodeRadius: 10,
      curveOffset: 0,
      layoutRadius: 100,
      horizontalDivider: 50,
      verticalDivider: 50,
      showGraph2: true,
      showSolution: true,
      edgeCombineStrategy: 'max' as EdgeCombineStrategy,
    };

    setNodeRadius(defaults.nodeRadius);
    setCurveOffset(defaults.curveOffset);
    setLayoutRadius(defaults.layoutRadius);
    setHorizontalDivider(defaults.horizontalDivider);
    setVerticalDivider(defaults.verticalDivider);
    setShowGraph2(defaults.showGraph2);
    setShowSolution(defaults.showSolution);
    setEdgeCombineStrategy(defaults.edgeCombineStrategy);
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
        {
          label: 'Edge Combine Strategy',
          subOptions: [
            { label: `Max (Current: ${edgeCombineStrategy === 'max' ? '✓' : ''})`, action: () => setEdgeCombineStrategy('max') },
            { label: `Min (Current: ${edgeCombineStrategy === 'min' ? '✓' : ''})`, action: () => setEdgeCombineStrategy('min') },
          ]
        },
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
          layoutRadius={layoutRadius}
          setLayoutRadius={setLayoutRadius}
          onClose={() => setShowSettings(false)}
          onReset={handleResetSettings}
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
              onSaveGraph={(filename) => saveGraphToFile(graph1, filename)}
              nodeMapping={nodeMapping}
              selectionForMapping={selectionForMapping.g1}
              nodeRadius={nodeRadius}
              curveOffset={curveOffset}
              layoutRadius={layoutRadius}
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
                onSaveGraph={(filename) => saveGraphToFile(graph2, filename)}
                nodeMapping={nodeMapping}
                isG2
                selectionForMapping={selectionForMapping.g2}
                nodeRadius={nodeRadius}
                curveOffset={curveOffset}
                layoutRadius={layoutRadius}
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
              onSaveGraph={(filename) => saveGraphToFile(solutionGraph, filename)}
              nodeMapping={nodeMapping}
              solutionNodeMapping={solutionNodeMapping}
              isSolution
              nodeRadius={nodeRadius}
              curveOffset={curveOffset}
              layoutRadius={layoutRadius}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
