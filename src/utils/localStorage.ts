import type { EdgeCombineStrategy } from '../types/graph.types';

const STORAGE_KEY = 'mostProbableBuilderSettings';

export interface AppSettings {
  // Visual settings
  nodeRadius: number;
  curveOffset: number;
  layoutRadius: number;

  // View settings
  horizontalDivider: number;
  verticalDivider: number;
  showGraph2: boolean;
  showSolution: boolean;

  // Solution construction settings
  edgeCombineStrategy: EdgeCombineStrategy;
}

const defaultSettings: AppSettings = {
  nodeRadius: 10,
  curveOffset: 0,
  layoutRadius: 100,
  horizontalDivider: 50,
  verticalDivider: 50,
  showGraph2: true,
  showSolution: true,
  edgeCombineStrategy: 'max',
};

/**
 * Load settings from local storage
 */
export const loadSettings = (): AppSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultSettings;
    }
    const parsed = JSON.parse(stored);
    // Merge with defaults to handle new settings added in updates
    return { ...defaultSettings, ...parsed };
  } catch (error) {
    console.error('Error loading settings from local storage:', error);
    return defaultSettings;
  }
};

/**
 * Save settings to local storage
 */
export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings to local storage:', error);
  }
};

/**
 * Clear all settings from local storage
 */
export const clearSettings = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing settings from local storage:', error);
  }
};

/**
 * Get default settings
 */
export const getDefaultSettings = (): AppSettings => {
  return { ...defaultSettings };
};

