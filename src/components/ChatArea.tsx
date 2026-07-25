import React, { useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare } from 'lucide-react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

interface ChatAreaProps {
  messages: ChatMessage[];
  inputValue: string;
  setInputValue: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  onClear: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  inputValue,
  setInputValue,
  onSubmit,
  loading,
  onClear,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
        onSubmit(fakeEvent);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      {/* Chat Area Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(10, 10, 20, 0.4)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--color-primary-glow)',
            border: '1px solid var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)'
          }}>
            <Bot size={20} className="animate-pulse" />
          </div>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700 }}>Support-GPT Assistant</h2>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>RAG Engine Live • Powered by HuggingFace</p>
          </div>
        </div>
        
        {messages.length > 0 && (
          <button 
            onClick={onClear}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontSize: '11px',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            className="clear-chat-btn"
          >
            Clear Conversation
          </button>
        )}
      </div>

      {/* Message List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {messages.length === 0 ? (
          <div style={{
            margin: 'auto',
            maxWidth: '480px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            color: 'var(--text-muted)'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'var(--bg-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
              border: '1px solid var(--border-color)'
            }}>
              <MessageSquare size={28} />
            </div>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '18px' }}>Ask Support-GPT</h3>
            <p style={{ fontSize: '13px', lineHeight: 1.6 }}>
              Upload your reference documents in the sidebar. Ask questions, and the RAG assistant will retrieve relevant chunks and generate accurate responses with citation tags.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={idx} 
                className="fade-in"
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  gap: '12px',
                  maxWidth: '85%',
                  alignSelf: isUser ? 'flex-end' : 'flex-start'
                }}
              >
                {/* Bot Icon */}
                {!isUser && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary)',
                    flexShrink: 0
                  }}>
                    <Sparkles size={16} />
                  </div>
                )}

                {/* Bubble */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div 
                    style={{
                      background: isUser ? 'var(--color-primary)' : 'var(--bg-card)',
                      border: isUser ? 'none' : '1px solid var(--border-color)',
                      borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      padding: '12px 16px',
                      fontSize: '13.5px',
                      lineHeight: 1.6,
                      color: 'var(--text-primary)',
                      whiteSpace: 'pre-wrap',
                      boxShadow: isUser ? '0 4px 15px rgba(108, 93, 211, 0.25)' : 'none'
                    }}
                  >
                    {msg.content}
                  </div>

                  {/* Sources Badges */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', marginRight: '4px' }}>
                        Sources:
                      </span>
                      {msg.sources.map((src, sidx) => (
                        <span 
                          key={sidx}
                          style={{
                            fontSize: '10px',
                            background: 'rgba(108, 93, 211, 0.1)',
                            border: '1px solid rgba(108, 93, 211, 0.3)',
                            color: '#c3baff',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 500
                          }}
                        >
                          📄 {src}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* User Icon */}
                {isUser && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--color-primary-glow)',
                    border: '1px solid var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary)',
                    flexShrink: 0
                  }}>
                    <User size={16} />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading typing state */}
        {loading && (
          <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}>
              <Bot size={16} className="animate-spin" />
            </div>
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px 16px 16px 4px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span className="dot" style={{ animationDelay: '0ms' }} />
              <span className="dot" style={{ animationDelay: '150ms' }} />
              <span className="dot" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Panel */}
      <div style={{
        padding: '0 24px 24px 24px',
        background: 'transparent'
      }}>
        <form onSubmit={onSubmit} style={{ position: 'relative' }}>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={loading ? "Generating response..." : "Ask a question about your indexed documents..."}
            disabled={loading}
            rows={2}
            style={{
              width: '100%',
              background: 'rgba(16, 16, 32, 0.65)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '16px 70px 16px 16px',
              fontSize: '13px',
              color: 'var(--text-primary)',
              outline: 'none',
              resize: 'none',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-sans)',
              lineHeight: '1.5'
            }}
            className="chat-textarea"
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            style={{
              position: 'absolute',
              right: '12px',
              bottom: '16px',
              background: inputValue.trim() ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
              border: 'none',
              color: inputValue.trim() ? '#fff' : 'var(--text-muted)',
              width: '40px',
              height: '36px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputValue.trim() ? 'pointer' : 'default',
              transition: 'all 0.2s',
              boxShadow: inputValue.trim() ? '0 4px 10px rgba(108, 93, 211, 0.3)' : 'none'
            }}
            className="send-btn"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      <style>{`
        .chat-textarea:focus {
          border-color: var(--color-primary) !important;
          box-shadow: 0 0 10px rgba(108, 93, 211, 0.15) !important;
        }
        .clear-chat-btn:hover {
          background: rgba(255,255,255,0.05) !important;
          color: var(--text-primary) !important;
          border-color: var(--text-muted) !important;
        }
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--text-secondary);
          display: inline-block;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
        .send-btn:hover:not(:disabled) {
          background: #5548b1 !important;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};
