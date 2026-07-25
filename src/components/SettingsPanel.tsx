import React from 'react';
import { Sliders, HelpCircle } from 'lucide-react';

interface SettingsPanelProps {
  topK: number;
  setTopK: (val: number) => void;
  minScore: number;
  setMinScore: (val: number) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  topK,
  setTopK,
  minScore,
  setMinScore,
}) => {
  return (
    <div className="glass-card" style={{ padding: '20px', marginTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Sliders size={18} style={{ color: 'var(--color-primary)' }} />
        <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Query Configuration</h3>
      </div>

      {/* Top K Chunks Slider */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
          <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Retrieve Top K Chunks
            <div className="tooltip-trigger" style={{ cursor: 'help', color: 'var(--text-muted)' }}>
              <HelpCircle size={12} />
              <span className="tooltip-text">Determines how many text fragments the vector search retrieves as context for the LLM.</span>
            </div>
          </span>
          <span style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>{topK}</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={topK}
          onChange={(e) => setTopK(parseInt(e.target.value))}
          style={{
            width: '100%',
            accentColor: 'var(--color-primary)',
            background: 'rgba(255,255,255,0.1)',
            height: '4px',
            borderRadius: '2px',
            outline: 'none',
            cursor: 'pointer'
          }}
        />
      </div>

      {/* Min Score Slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
          <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Min Relevance Score
            <div className="tooltip-trigger" style={{ cursor: 'help', color: 'var(--text-muted)' }}>
              <HelpCircle size={12} />
              <span className="tooltip-text">Filters out retrieved text fragments that score below this similarity threshold.</span>
            </div>
          </span>
          <span style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>{minScore.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0.0"
          max="1.0"
          step="0.05"
          value={minScore}
          onChange={(e) => setMinScore(parseFloat(e.target.value))}
          style={{
            width: '100%',
            accentColor: 'var(--color-primary)',
            background: 'rgba(255,255,255,0.1)',
            height: '4px',
            borderRadius: '2px',
            outline: 'none',
            cursor: 'pointer'
          }}
        />
      </div>

      <style>{`
        .tooltip-trigger {
          position: relative;
          display: inline-block;
        }
        .tooltip-trigger .tooltip-text {
          visibility: hidden;
          width: 220px;
          background-color: #121225;
          color: #fff;
          text-align: left;
          border-radius: 6px;
          padding: 8px 12px;
          position: absolute;
          z-index: 10;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          transition: opacity 0.2s;
          font-size: 11px;
          line-height: 1.4;
          border: 1px solid var(--border-color);
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
          pointer-events: none;
        }
        .tooltip-trigger:hover .tooltip-text {
          visibility: visible;
          opacity: 1;
        }
      `}</style>
    </div>
  );
};
