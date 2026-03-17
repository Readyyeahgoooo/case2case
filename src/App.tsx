import React, { useState, useCallback } from 'react';
import GraphGalaxy from './components/GraphGalaxy';
import ChatPanel from './components/ChatPanel';
import NodeDetails from './components/NodeDetails';
import TopicSidebar from './components/TopicSidebar';
import GenealogyPanel from './components/GenealogyPanel';
import { hkCaseLawsData, GraphNode, GenealogyChain, getCaseById } from './data/hkCaseLaws';
import { Sparkles, MessageSquare, Layers, GitBranch } from 'lucide-react';

export default function App() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isTopicSidebarOpen, setIsTopicSidebarOpen] = useState(false);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [filterNodeIds, setFilterNodeIds] = useState<Set<string> | null>(null);
  const [activeGenealogy, setActiveGenealogy] = useState<GenealogyChain | null>(null);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
  }, []);

  const handleHighlightNodes = useCallback((nodeIds: string[]) => {
    setHighlightNodes(new Set(nodeIds));
  }, []);

  const handleSelectTopic = useCallback((topicId: string, caseIds: string[]) => {
    setActiveTopicId(topicId);
    setFilterNodeIds(new Set(caseIds));
    setHighlightNodes(new Set(caseIds));
  }, []);

  const handleClearFilter = useCallback(() => {
    setActiveTopicId(null);
    setFilterNodeIds(null);
    setHighlightNodes(new Set());
  }, []);

  const handleSelectCase = useCallback((caseId: string) => {
    const caseNode = hkCaseLawsData.nodes.find(n => n.id === caseId);
    if (caseNode) {
      setSelectedNode(caseNode);
      // Navigate the 3D graph to this node
      setTimeout(() => {
        (window as any).__graphNavigateToNode?.(caseId);
      }, 100);
    }
  }, []);

  const handleOpenGenealogy = useCallback((chain: GenealogyChain) => {
    setActiveGenealogy(chain);
    setIsTopicSidebarOpen(false);
    // Highlight all cases in the genealogy chain
    setHighlightNodes(new Set(chain.caseIds));
  }, []);

  const handleCloseGenealogy = useCallback(() => {
    setActiveGenealogy(null);
    setHighlightNodes(new Set());
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setSelectedNode(null);
    setHighlightNodes(new Set());
  }, []);

  return (
    <div className="relative w-full h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10 pointer-events-none flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-indigo-400" />
            HK Case Law Galaxy
          </h1>
          <p className="text-slate-400 mt-2 max-w-md text-sm leading-relaxed">
            A transparent AI RAG map visualizing the connections between Hong Kong case laws, legal concepts, and statutes.
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          {/* Legend */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-xl">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Node Types</h3>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                <span className="text-sm text-slate-300">Case Law</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                <span className="text-sm text-slate-300">Legal Topic</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></div>
                <span className="text-sm text-slate-300">Thematic Tag</span>
              </div>
            </div>

            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Linkage System</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                <span className="text-sm text-slate-300">Citation (Genealogy)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-px bg-emerald-500/50"></div>
                <span className="text-sm text-slate-300">Hierarchy (Topic)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-px bg-white/20 border-t border-dashed border-white/40"></div>
                <span className="text-sm text-slate-300">Thematic</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setIsTopicSidebarOpen(!isTopicSidebarOpen);
                if (activeGenealogy) setActiveGenealogy(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all text-sm font-medium ${
                isTopicSidebarOpen
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800/80 backdrop-blur border border-slate-700 text-slate-300 hover:bg-slate-700/80 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Topics</span>
            </button>

            {!isChatOpen && (
              <button 
                onClick={() => setIsChatOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full shadow-lg transition-colors text-sm font-medium"
              >
                <MessageSquare className="w-4 h-4" />
                <span>AI Chat</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3D Graph */}
      <GraphGalaxy 
        data={hkCaseLawsData} 
        onNodeClick={handleNodeClick} 
        onBackgroundClick={handleBackgroundClick}
        highlightNodes={highlightNodes}
        filterNodeIds={filterNodeIds}
      />

      {/* UI Overlays */}
      <div className="pointer-events-auto">
        {/* Topic Sidebar */}
        <TopicSidebar
          isOpen={isTopicSidebarOpen && !activeGenealogy}
          onClose={() => setIsTopicSidebarOpen(false)}
          onSelectTopic={handleSelectTopic}
          onSelectCase={handleSelectCase}
          onClearFilter={handleClearFilter}
          activeTopicId={activeTopicId}
        />

        {/* Genealogy Panel */}
        <GenealogyPanel
          chain={activeGenealogy}
          activeCaseId={selectedNode?.id || null}
          onSelectCase={handleSelectCase}
          onClose={handleCloseGenealogy}
        />

        {/* Chat Panel */}
        <ChatPanel 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
          onHighlightNodes={handleHighlightNodes}
          onSelectCase={handleSelectCase}
        />

        {/* Node Details */}
        {selectedNode && (
          <NodeDetails 
            node={selectedNode} 
            onClose={() => setSelectedNode(null)}
            onSelectCase={handleSelectCase}
            onOpenGenealogy={handleOpenGenealogy}
          />
        )}
      </div>
    </div>
  );
}
