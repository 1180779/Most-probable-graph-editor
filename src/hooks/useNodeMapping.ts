import { useState, useCallback } from 'react';
import type { NodeMapping } from '../types/graph.types';

export interface SelectionForMapping {
  g1: number | null;
  g2: number | null;
}

export function useNodeMapping(initialMapping: NodeMapping = {}, initialColorIndex: number = 0) {
  const [nodeMapping, setNodeMapping] = useState<NodeMapping>(initialMapping);
  const [selectionForMapping, setSelectionForMapping] = useState<SelectionForMapping>({ g1: null, g2: null });
  const [nextColorIndex, setNextColorIndex] = useState(initialColorIndex);

  const handleNodeSelection = useCallback((graphId: 'g1' | 'g2', nodeId: number | null) => {
    setSelectionForMapping(prev => ({ ...prev, [graphId]: nodeId }));
  }, []);

  const handleMapNodes = useCallback(() => {
    const { g1, g2 } = selectionForMapping;
    if (g1 === null || g2 === null) return false;

    const isG1NodeMapped = Object.keys(nodeMapping).some(key => parseInt(key, 10) === g1);
    const isG2NodeMapped = Object.values(nodeMapping).some(val => val.g2Index === g2);

    if (isG1NodeMapped || isG2NodeMapped) {
      return false; // Indicate failure
    }

    setNodeMapping(prev => ({ ...prev, [g1]: { g2Index: g2, colorIndex: nextColorIndex } }));
    setNextColorIndex(prev => prev + 1);
    setSelectionForMapping({ g1: null, g2: null });
    return true; // Indicate success
  }, [selectionForMapping, nodeMapping, nextColorIndex]);

  const handleClearAllMappings = useCallback(() => {
    setNodeMapping({});
    setNextColorIndex(0);
    setSelectionForMapping({ g1: null, g2: null });
  }, []);

  const handleRemoveMapping = useCallback((g1NodeId: number) => {
    setNodeMapping(prev => {
      const newMapping = { ...prev };
      delete newMapping[g1NodeId];
      return newMapping;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectionForMapping({ g1: null, g2: null });
  }, []);

  return {
    nodeMapping,
    setNodeMapping,
    selectionForMapping,
    nextColorIndex,
    setNextColorIndex,
    handleNodeSelection,
    handleMapNodes,
    handleClearAllMappings,
    handleRemoveMapping,
    clearSelection,
  };
}

