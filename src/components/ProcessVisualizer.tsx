import React from 'react';
import { Cpu, Search, Filter, MessageSquare } from 'lucide-react';

export type RagStage = 'idle' | 'embedding' | 'retrieval' | 'ranking' | 'generation' | 'completed' | 'error';

interface ProcessVisualizerProps {
  stage: RagStage;
  message: string;
}

export const ProcessVisualizer: React.FC<ProcessVisualizerProps> = ({ stage, message }) => {
  if (stage === 'idle') return null;

  const steps = [
    {
      id: 'embedding',
      label: 'Vectorizing',
      desc: 'Generating query embeddings',
      icon: Cpu
    },
    {
      id: 'retrieval',
      label: 'Retrieval',
      desc: 'Querying FAISS database',
      icon: Search
    },
    {
      id: 'ranking',
      label: 'Ranking',
      desc: 'Filtering relevant chunks',
      icon: Filter
    },
    {
      id: 'generation',
      label: 'Generation',
      desc: 'HuggingFace LLM synthesis',
      icon: MessageSquare
    }
  ];

  const getStepStatus = (stepId: string) => {
    if (stage === 'error') return 'error';
    if (stage === 'completed') return 'success';
    
    const stageOrder = ['embedding', 'retrieval', 'ranking', 'generation', 'completed'];
    const currentIdx = stageOrder.indexOf(stage);
    const stepIdx = stageOrder.indexOf(stepId);
    
    if (stepIdx < currentIdx) return 'success';
    if (stepIdx === currentIdx) return 'active';
    return 'pending';
  };

  return (
    <div className="glass-panel RAG-hud" style={{ 
      padding: '16px 20px', 
      margin: '0 20px 20px 20px',
      border: '1px solid var(--border-color-glow)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-secondary)' }}>
          ⚡ RAG Processing Pipeline Engine
        </h4>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {message}
        </span>
      </div>

      <div className="hud-steps" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        position: 'relative'
      }}>
        {steps.map((step, idx) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;
          
          let color = 'var(--text-muted)';
          let borderColor = 'var(--border-color)';
          let glowClass = '';
          
          if (status === 'active') {
            color = 'var(--color-secondary)';
            borderColor = 'var(--color-secondary)';
            glowClass = 'hud-step-active';
          } else if (status === 'success') {
            color = 'var(--color-primary)';
            borderColor = 'var(--color-primary)';
          } else if (status === 'error') {
            color = 'var(--color-error)';
            borderColor = 'var(--color-error)';
          }

          return (
            <div key={step.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: `1px solid ${borderColor}`,
              background: status === 'active' ? 'rgba(0, 242, 254, 0.05)' : 'rgba(255,255,255,0.01)',
              position: 'relative',
              transition: 'all 0.3s ease'
            }} className={glowClass}>
              
              {/* Icon Container */}
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: status === 'active' ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255,255,255,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
                flexShrink: 0
              }}>
                <Icon size={16} className={status === 'active' ? 'animate-pulse' : ''} />
              </div>

              {/* Text info */}
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                  {step.label}
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  {step.desc}
                </div>
              </div>

              {/* Progress Connection Line */}
              {idx < 3 && (
                <div style={{
                  position: 'absolute',
                  right: '-10px',
                  top: '50%',
                  width: '4px',
                  height: '1px',
                  background: status === 'success' ? 'var(--color-primary)' : 'var(--border-color)',
                  zIndex: 2
                }} />
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .hud-step-active {
          box-shadow: 0 0 10px rgba(0, 242, 254, 0.15);
          animation: hudGlow 1.5s infinite ease-in-out;
        }
        @keyframes hudGlow {
          0%, 100% { border-color: rgba(0, 242, 254, 0.4); }
          50% { border-color: rgba(0, 242, 254, 0.8); }
        }
      `}</style>
    </div>
  );
};
