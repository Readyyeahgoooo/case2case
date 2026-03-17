import React, { useState } from 'react';
import GraphGalaxy from './components/GraphGalaxy';
import ChatPanel from './components/ChatPanel';
import NodeDetails from './components/NodeDetails';
import { hkCaseLawsData, GraphNode } from './data/hkCaseLaws';
import { Sparkles, MessageSquare } from 'lucide-react';

export default function App() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [isChatOpen, setIsChatOpen] = useState(true);

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
  };

  const handleHighlightNodes = (nodeIds: string[]) => {
    setHighlightNodes(new Set(nodeIds));
  };

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
        
        {/* Legend & Controls */}
        <div className="flex flex-col items-end gap-4 pointer-events-auto">
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
                <span className="text-sm text-slate-300">Thematic (Blurred Lines)</span>
              </div>
            </div>
          </div>

          {!isChatOpen && (
            <button 
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full shadow-lg transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">Open AI Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* 3D Graph */}
      <GraphGalaxy 
        data={hkCaseLawsData} 
        onNodeClick={handleNodeClick} 
        onBackgroundClick={() => {
          setSelectedNode(null);
          setHighlightNodes(new Set());
        }}
        highlightNodes={highlightNodes}
      />

      {/* UI Overlays */}
      <div className="pointer-events-auto">
        <ChatPanel 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
          onHighlightNodes={handleHighlightNodes} 
        />
        {selectedNode && (
          <NodeDetails 
            node={selectedNode} 
            onClose={() => setSelectedNode(null)} 
          />
        )}
      </div>
    </div>
  );
}
