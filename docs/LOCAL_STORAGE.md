# Local Storage Implementation

This document describes the local storage functionality implemented in the Most Probable Builder application.

## Overview

The application now automatically saves and restores user preferences using the browser's local storage API. This ensures that your settings persist across browser sessions.

## What Gets Saved

The following settings are automatically saved to local storage:

### Visual Settings
- **Node Radius**: The size of nodes in the graph visualization (default: 10)
- **Edge Curve Angle**: The curvature of edges between nodes (default: 0)
- **Layout Radius**: The radius of the circular layout (default: 100)

### View Settings
- **Horizontal Divider Position**: The position of the horizontal divider between top and bottom sections (default: 50%)
- **Vertical Divider Position**: The position of the vertical divider between Graph 1 and Graph 2 (default: 50%)
- **Show Graph 2**: Whether Graph 2 is visible (default: true)
- **Show Solution**: Whether the Solution canvas is visible (default: true)

### Solution Construction Settings
- **Edge Combine Strategy**: How edges are combined when creating the solution graph (default: 'max')
  - Options: 'max' or 'min'

## What Does NOT Get Saved

To avoid performance issues and excessive storage usage, the following are intentionally **not** saved to local storage:

- **Graph Data**: The actual nodes and edges of Graph 1, Graph 2, and the Solution graph
- **Node Mappings**: The current node mapping state
- **Selection State**: Currently selected nodes or edges

These can be saved/loaded using the file-based "Save State" and "Load State" features in the Project menu.

## How It Works

### Automatic Save
Settings are automatically saved to local storage whenever they change. There's no need to manually save your preferences.

### Automatic Load
When you open the application, it automatically loads your previously saved settings. If no settings are found (first time use), default values are used.

### Storage Key
All settings are stored under a single key: `mostProbableBuilderSettings`

## Resetting Settings

You can reset all settings to their default values in two ways:

1. **Via Settings Panel**: Open Settings (Project → Settings) and click the "Reset to Defaults" button
2. **Manual Clearing**: Clear your browser's local storage for this site

## Technical Details

### Implementation Files

- **`src/utils/localStorage.ts`**: Contains all local storage utility functions
  - `loadSettings()`: Loads settings from local storage
  - `saveSettings()`: Saves settings to local storage
  - `clearSettings()`: Clears settings from local storage
  - `getDefaultSettings()`: Returns default settings

- **`src/App.tsx`**: Main application component that:
  - Loads settings on initial render
  - Automatically saves settings when they change via `useEffect` hook
  - Provides reset functionality

### Data Structure

Settings are stored as a JSON object with the following structure:

```typescript
interface AppSettings {
  nodeRadius: number;
  curveOffset: number;
  layoutRadius: number;
  horizontalDivider: number;
  verticalDivider: number;
  showGraph2: boolean;
  showSolution: boolean;
  edgeCombineStrategy: 'max' | 'min';
}
```

### Error Handling

The implementation includes error handling for:
- Failed reads from local storage (returns defaults)
- Failed writes to local storage (logs error to console)
- Missing or corrupted data (merges with defaults)

## Browser Compatibility

Local storage is supported in all modern browsers:
- Chrome/Edge: Yes
- Firefox: Yes
- Safari: Yes
- Opera: Yes

Note: Local storage is domain-specific, so settings will not transfer between different deployments of the application.

## Storage Limits

Browsers typically allow 5-10 MB of local storage per domain. The settings saved by this application use only a few hundred bytes, so storage limits should not be a concern.

## Privacy Considerations

- All data is stored locally in your browser
- No data is sent to any server
- Settings are specific to your browser and device
- Clearing browser data will clear these settings

