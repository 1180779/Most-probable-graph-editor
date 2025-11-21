import React from 'react';
import './SettingsPanel.css';

interface SettingsPanelProps {
  nodeRadius: number;
  setNodeRadius: (radius: number) => void;
  curveOffset: number;
  setCurveOffset: (offset: number) => void;
  layoutRadius: number;
  setLayoutRadius: (radius: number) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  nodeRadius,
  setNodeRadius,
  curveOffset,
  setCurveOffset,
  layoutRadius,
  setLayoutRadius,
  onClose,
}) => {
  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h3>Settings</h3>
        <button onClick={onClose} className="close-btn">&times;</button>
      </div>
      <div className="setting">
        <label>Node Radius: {nodeRadius}</label>
        <input
          type="range"
          min="10"
          max="50"
          value={nodeRadius}
          onChange={(e) => setNodeRadius(Number(e.target.value))}
        />
      </div>
      <div className="setting">
        <label>Edge Curve Angle: {curveOffset}</label>
        <input
          type="range"
          min="0"
          max="200"
          value={curveOffset}
          onChange={(e) => setCurveOffset(Number(e.target.value))}
        />
      </div>
      <div className="setting">
        <label>Layout Radius: {layoutRadius}</label>
        <input
          type="range"
          min="20"
          max="500"
          value={layoutRadius}
          onChange={(e) => setLayoutRadius(Number(e.target.value))}
        />
      </div>
    </div>
  );
};

export default SettingsPanel;
