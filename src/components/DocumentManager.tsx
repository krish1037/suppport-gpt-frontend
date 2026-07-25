import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface Document {
  document_name: string;
  source_type: string;
  total_chunks: number;
}

interface DocumentManagerProps {
  documents: Document[];
  loadingDocs: boolean;
  onRefresh: () => void;
  apiBaseUrl: string;
}

interface IndexingStep {
  label: string;
  status: 'pending' | 'active' | 'success' | 'error';
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  documents,
  loadingDocs,
  onRefresh,
  apiBaseUrl,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [indexingSteps, setIndexingSteps] = useState<IndexingStep[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stepsList = [
    '📤 Uploading document to server',
    '📄 Extracting text contents',
    '✂️ Splitting text into chunks',
    '🧠 Generating vector embeddings',
    '💾 Indexing into FAISS database',
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    // Check file extension
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.txt', '.pdf', '.docx'].includes(ext)) {
      setUploadError('Unsupported file type. Please upload a .txt, .pdf, or .docx file.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    
    // Initialize steps
    const initialSteps: IndexingStep[] = stepsList.map((step, idx) => ({
      label: step,
      status: idx === 0 ? 'active' : 'pending',
    }));
    setIndexingSteps(initialSteps);

    // Simulated progress transitions to give authentic RAG pipeline visualization
    const stepIntervals: any[] = [];
    const advanceStep = (index: number) => {
      setIndexingSteps(prev => prev.map((s, idx) => {
        if (idx < index) return { ...s, status: 'success' as const };
        if (idx === index) return { ...s, status: 'active' as const };
        return s;
      }));
    };

    // Transition steps gradually over a few seconds while waiting for backend
    stepIntervals.push(setTimeout(() => advanceStep(1), 800));
    stepIntervals.push(setTimeout(() => advanceStep(2), 1600));
    stepIntervals.push(setTimeout(() => advanceStep(3), 2500));
    stepIntervals.push(setTimeout(() => advanceStep(4), 3400));

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${apiBaseUrl}/upload/`, {
        method: 'POST',
        body: formData,
      });

      // Clear timers
      stepIntervals.forEach(clearTimeout);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload and index document.');
      }

      await response.json();

      // Complete all steps
      setIndexingSteps(prev => prev.map(s => ({ ...s, status: 'success' as const })));
      
      // Keep state showing completion for 1.5s, then hide uploader
      setTimeout(() => {
        setUploading(false);
        onRefresh();
      }, 1500);

    } catch (err: any) {
      stepIntervals.forEach(clearTimeout);
      setUploadError(err.message || 'Connection error.');
      setIndexingSteps(prev => prev.map(s => s.status === 'active' ? { ...s, status: 'error' as const } : s));
      
      setTimeout(() => {
        setUploading(false);
      }, 4000);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
          🗂️ Document Management
        </h3>
        
        {/* Upload Box */}
        {!uploading ? (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            style={{
              border: `2px dashed ${dragActive ? 'var(--color-secondary)' : 'var(--border-color)'}`,
              borderRadius: '12px',
              padding: '24px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragActive ? 'rgba(0, 242, 254, 0.05)' : 'rgba(255, 255, 255, 0.02)',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}
            className="upload-dropzone"
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".txt,.pdf,.docx"
              style={{ display: 'none' }}
            />
            <Upload size={32} style={{ color: dragActive ? 'var(--color-secondary)' : 'var(--text-muted)' }} />
            <div>
              <p style={{ fontSize: '13px', fontWeight: 500 }}>
                Drag & drop or <span style={{ color: 'var(--color-primary)' }}>browse</span>
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Supports PDF, DOCX, TXT
              </p>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '16px', border: '1px solid var(--border-color-glow)' }}>
            <h4 style={{ fontSize: '13px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Loader2 size={14} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
              Indexing Document Pipeline
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {indexingSteps.map((step, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  opacity: step.status === 'pending' ? 0.4 : 1,
                  transition: 'opacity 0.2s'
                }}>
                  <span>{step.label}</span>
                  {step.status === 'active' && <Loader2 size={12} className="animate-spin" style={{ color: 'var(--color-primary)' }} />}
                  {step.status === 'success' && <CheckCircle2 size={12} style={{ color: 'var(--color-success)' }} />}
                  {step.status === 'error' && <AlertCircle size={12} style={{ color: 'var(--color-error)' }} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {uploadError && (
          <div style={{ 
            marginTop: '8px', 
            padding: '8px 12px', 
            borderRadius: '6px', 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--color-error)',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <AlertCircle size={14} />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      <hr style={{ border: 'none', borderBottom: '1px solid var(--border-color)' }} />

      {/* Indexed Document List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            📚 Indexed Documents ({documents.length})
          </h3>
        </div>

        {loadingDocs ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
            <Loader2 className="animate-spin" size={20} style={{ color: 'var(--color-primary)' }} />
          </div>
        ) : documents.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '30px 16px', 
            color: 'var(--text-muted)',
            fontSize: '12px',
            border: '1px dashed var(--border-color)',
            borderRadius: '8px'
          }}>
            No documents indexed yet. Upload a file to get started.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
            {documents.map((doc, idx) => (
              <div key={idx} className="glass-card" style={{ 
                padding: '12px', 
                borderLeft: '3px solid var(--color-primary)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <FileText size={16} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: 600, 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis'
                  }}>
                    {doc.document_name}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Type: <span style={{ textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{doc.source_type}</span> | Chunks: <span style={{ color: 'var(--color-secondary)' }}>{doc.total_chunks}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .upload-dropzone:hover {
          background: rgba(108, 93, 211, 0.05) !important;
          border-color: var(--color-primary) !important;
        }
      `}</style>
    </div>
  );
};
