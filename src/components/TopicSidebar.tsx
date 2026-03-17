import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronDown, Search, Layers, Scale, BookOpen, X } from 'lucide-react';
import { getTopicHierarchy, GraphNode } from '../data/hkCaseLaws';

interface TopicSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTopic: (topicId: string, caseIds: string[]) => void;
  onSelectCase: (caseId: string) => void;
  onClearFilter: () => void;
  activeTopicId: string | null;
}

export default function TopicSidebar({
  isOpen,
  onClose,
  onSelectTopic,
  onSelectCase,
  onClearFilter,
  activeTopicId,
}: TopicSidebarProps) {
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set(['top-civil', 'top-contract', 'top-evidence']));
  const [searchQuery, setSearchQuery] = useState('');
  const hierarchy = useMemo(() => getTopicHierarchy(), []);

  const toggleExpanded = (topicId: string) => {
    setExpandedTopics(prev => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  };

  const handleTopicClick = (topicId: string, cases: GraphNode[]) => {
    const caseIds = cases.map(c => c.id);
    if (activeTopicId === topicId) {
      onClearFilter();
    } else {
      onSelectTopic(topicId, caseIds);
    }
  };

  const filteredHierarchy = useMemo(() => {
    if (!searchQuery.trim()) return hierarchy;
    const q = searchQuery.toLowerCase();
    return hierarchy.map(l1 => ({
      ...l1,
      children: l1.children
        .map(child => ({
          ...child,
          cases: child.cases.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            c.id.toLowerCase().includes(q)
          ),
        }))
        .filter(child =>
          child.topic.name.toLowerCase().includes(q) ||
          child.cases.length > 0
        ),
    })).filter(l1 => l1.topic.name.toLowerCase().includes(q) || l1.children.length > 0);
  }, [hierarchy, searchQuery]);

  const getL1Icon = (id: string) => {
    switch (id) {
      case 'top-civil': return <Scale className="w-4 h-4" />;
      case 'top-contract': return <BookOpen className="w-4 h-4" />;
      case 'top-evidence': return <Layers className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  const totalCases = hierarchy.reduce((sum, l1) => sum + l1.children.reduce((s, c) => s + c.cases.length, 0), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -320, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute left-4 top-4 bottom-4 w-72 glass-panel flex flex-col z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <Layers className="w-5 h-5" />
              <h2 className="font-semibold text-sm tracking-wide uppercase">Topics</h2>
              <span className="text-xs text-slate-500 font-mono ml-1">({totalCases})</span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="px-4 py-3 border-b border-slate-800/40">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cases & topics..."
                className="search-input"
              />
            </div>
          </div>

          {/* Active filter indicator */}
          {activeTopicId && (
            <div className="px-4 py-2 border-b border-slate-800/40 bg-indigo-500/8">
              <button
                onClick={onClearFilter}
                className="flex items-center gap-2 text-xs text-indigo-300 hover:text-indigo-200 transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Clear filter</span>
              </button>
            </div>
          )}

          {/* Topic Tree */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {filteredHierarchy.map(l1 => (
              <div key={l1.topic.id} className="fade-in">
                {/* L1 Topic */}
                <button
                  onClick={() => toggleExpanded(l1.topic.id)}
                  className="topic-tree-item w-full text-left group"
                >
                  <span className="text-emerald-400/70 group-hover:text-emerald-400 transition-colors">
                    {getL1Icon(l1.topic.id)}
                  </span>
                  {expandedTopics.has(l1.topic.id)
                    ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  }
                  <span className="text-sm font-medium text-slate-200 flex-1">{l1.topic.name}</span>
                  <span className="text-xs text-slate-500 font-mono">
                    {l1.children.reduce((s, c) => s + c.cases.length, 0)}
                  </span>
                </button>

                {/* L2/L3 Topics */}
                <AnimatePresence>
                  {expandedTopics.has(l1.topic.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-4 overflow-hidden"
                    >
                      {l1.children.map(child => (
                        <div key={child.topic.id}>
                          <button
                            onClick={() => handleTopicClick(child.topic.id, child.cases)}
                            className={`topic-tree-item w-full text-left ${activeTopicId === child.topic.id ? 'active' : ''}`}
                          >
                            <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
                            <span className="text-sm text-slate-300 flex-1">{child.topic.name}</span>
                            <span className="text-xs text-slate-500 font-mono">{child.cases.length}</span>
                          </button>

                          {/* Cases under topic (always visible if topic is active) */}
                          <AnimatePresence>
                            {(activeTopicId === child.topic.id || expandedTopics.has(child.topic.id)) && child.cases.length > 0 && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="ml-5 overflow-hidden"
                              >
                                {child.cases.map(c => (
                                  <button
                                    key={c.id}
                                    onClick={() => onSelectCase(c.id)}
                                    className="w-full text-left px-2 py-1.5 rounded-md hover:bg-blue-500/10 transition-colors flex items-center gap-2 group"
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400/50 group-hover:bg-blue-400 transition-colors" />
                                    <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors truncate">
                                      {c.name}
                                    </span>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
