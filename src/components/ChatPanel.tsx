import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { queryGraphRAG } from '../lib/gemini';
import { getCaseById } from '../data/hkCaseLaws';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  nodeIds?: string[];
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onHighlightNodes: (nodeIds: string[]) => void;
  onSelectCase?: (caseId: string) => void;
}

// Parse AI response to find case IDs and render them as clickable badges
function renderMessageContent(
  content: string,
  nodeIds: string[] | undefined,
  onSelectCase?: (caseId: string) => void
): React.ReactNode {
  if (!nodeIds || nodeIds.length === 0 || !onSelectCase) {
    return content;
  }

  // Split content and replace case ID mentions with badges
  const parts: React.ReactNode[] = [];
  let remainingText = content;
  let keyCounter = 0;

  // Build a map of case IDs to their display names
  const caseMap = new Map<string, string>();
  nodeIds.forEach(id => {
    const c = getCaseById(id);
    if (c) {
      caseMap.set(id, c.name);
    }
  });

  // Replace case ID references in text
  for (const [id, name] of caseMap) {
    const regex = new RegExp(`(${id.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const segments = remainingText.split(regex);
    if (segments.length > 1) {
      const newParts: React.ReactNode[] = [];
      segments.forEach((seg, i) => {
        if (seg.toLowerCase() === id.toLowerCase()) {
          newParts.push(
            <button
              key={`badge-${keyCounter++}`}
              onClick={() => onSelectCase(id)}
              className="citation-badge citation-badge--case mx-0.5 inline-flex"
              title={name}
            >
              {id}
            </button>
          );
        } else {
          newParts.push(seg);
        }
      });
      // If we found matches, reconstruct
      if (newParts.length > 1) {
        parts.push(...newParts);
        remainingText = '';
      }
    }
  }

  if (remainingText && parts.length === 0) {
    return content;
  }

  if (remainingText) {
    parts.push(remainingText);
  }

  return <>{parts}</>;
}

export default function ChatPanel({ isOpen, onClose, onHighlightNodes, onSelectCase }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: 'Welcome to the HK Case Law GraphRAG. Ask me about the cases, legal concepts, or citation genealogy in the galaxy. Try:\n\n• "What is the triable issue test?"\n• "Trace the deposit forfeiture genealogy"\n• "Compare Ladenbau and Mass International"',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    onHighlightNodes([]); // Clear highlights

    try {
      const response = await queryGraphRAG(userMessage.content);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response.answer,
        nodeIds: response.relevantNodeIds,
      };
      setMessages(prev => [...prev, aiMessage]);
      onHighlightNodes(response.relevantNodeIds);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'Sorry, I encountered an error while processing your request. Please check that your GEMINI_API_KEY is set in .env.local.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute right-4 top-4 bottom-4 w-80 glass-panel flex flex-col z-10 overflow-hidden"
        >
          <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles className="w-5 h-5" />
              <h2 className="font-semibold text-sm tracking-wide uppercase">AI RAG Chat</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-sm'
                      : 'bg-slate-800/80 text-slate-200 rounded-tl-sm border border-slate-700/60'
                  }`}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {msg.role === 'ai'
                    ? renderMessageContent(msg.content, msg.nodeIds, onSelectCase)
                    : msg.content
                  }
                </div>
                {msg.nodeIds && msg.nodeIds.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {msg.nodeIds.map(id => {
                      const c = getCaseById(id);
                      return (
                        <button
                          key={id}
                          onClick={() => onSelectCase?.(id)}
                          className="citation-badge citation-badge--case"
                          title={c?.name || id}
                        >
                          {id}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start">
                <div className="bg-slate-800/80 text-slate-400 rounded-2xl rounded-tl-sm px-4 py-2.5 border border-slate-700/60 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs">Searching graph...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800/40">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about the galaxy..."
                className="w-full bg-slate-800/60 text-sm text-white rounded-full pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-700/60 placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
