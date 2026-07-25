import React, { useState, useEffect } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { DocumentManager } from './components/DocumentManager';
import { SettingsPanel } from './components/SettingsPanel';
import { ChatArea } from './components/ChatArea';
import type { ChatMessage } from './components/ChatArea';
import { ProcessVisualizer } from './components/ProcessVisualizer';
import type { RagStage } from './components/ProcessVisualizer';

interface Document {
  document_name: string;
  source_type: string;
  total_chunks: number;
}

export default function App() {
  const [topK, setTopK] = useState<number>(5);
  const [minScore, setMinScore] = useState<number>(0.3);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // RAG pipeline HUD states
  const [ragStage, setRagStage] = useState<RagStage>('idle');
  const [ragMessage, setRagMessage] = useState<string>('');

  // Fallback API Base URL pointing to local server or container environment
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + '/api/v1';

  // Load documents on startup
  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const response = await fetch(`${API_BASE_URL}/documents/`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      } else {
        console.error('Failed to load documents');
      }
    } catch (err) {
      console.warn('Could not connect to backend to fetch documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || chatLoading) return;

    const userText = inputValue;
    setInputValue('');
    
    // Add user message to history
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setChatLoading(true);

    // Dynamic RAG Pipeline Steps Simulation to showcase internal operations
    try {
      setRagStage('embedding');
      setRagMessage('Vectorizing user search query...');
      await new Promise(r => setTimeout(r, 700));

      setRagStage('retrieval');
      setRagMessage('Searching FAISS vector database for relevant chunks...');
      await new Promise(r => setTimeout(r, 700));

      setRagStage('ranking');
      setRagMessage(`Re-ranking: filtering text nodes with similarity score >= ${minScore}`);
      await new Promise(r => setTimeout(r, 600));

      setRagStage('generation');
      setRagMessage('Sending prompt context to HuggingFace Inference API...');

      const response = await fetch(`${API_BASE_URL}/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText,
          top_k: topK,
          min_score: minScore
        })
      });

      if (!response.ok) {
        const errDetails = await response.text();
        throw new Error(errDetails || 'Failed to get RAG response.');
      }

      const data = await response.json();

      setRagStage('completed');
      setRagMessage('Answer successfully synthesized!');
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer || 'No answer generated.',
        sources: data.sources || []
      }]);

      await new Promise(r => setTimeout(r, 1200));
      setRagStage('idle');

    } catch (err: any) {
      console.error(err);
      setRagStage('error');
      setRagMessage('RAG Generation Pipeline Failed!');
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error running query: ${err.message || 'Server connection error.'}`
      }]);

      await new Promise(r => setTimeout(r, 3000));
      setRagStage('idle');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="app-container">
      
      {/* Sidebar - Management & Settings */}
      <div className="sidebar">
        {/* Brand */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(108, 93, 211, 0.03)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 15px rgba(108, 93, 211, 0.35)'
          }}>
            <Bot size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #a3b8ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Support-GPT
            </h1>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              RAG Control Panel
            </p>
          </div>
        </div>

        {/* Content Panel Scrollable */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <DocumentManager
            documents={documents}
            loadingDocs={loadingDocs}
            onRefresh={fetchDocuments}
            apiBaseUrl={API_BASE_URL}
          />
          <SettingsPanel
            topK={topK}
            setTopK={setTopK}
            minScore={minScore}
            setMinScore={setMinScore}
          />
        </div>

        {/* Sidebar Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-color)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Sparkles size={12} style={{ color: 'var(--color-secondary)' }} />
          <span>Gemini Pair-Programming Sandbox</span>
        </div>
      </div>

      {/* Main Panel - Chat Area */}
      <div className="main-content">
        <ChatArea
          messages={messages}
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSubmit={handleChatSubmit}
          loading={chatLoading}
          onClear={handleClearChat}
        />
        
        {/* RAG pipeline steps HUD */}
        <ProcessVisualizer stage={ragStage} message={ragMessage} />
      </div>

    </div>
  );
}
