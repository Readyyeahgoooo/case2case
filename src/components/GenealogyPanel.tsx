import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, GitBranch, ExternalLink } from 'lucide-react';
import { GenealogyChain, getCaseById, GraphNode } from '../data/hkCaseLaws';

interface GenealogyPanelProps {
  chain: GenealogyChain | null;
  activeCaseId: string | null;
  onSelectCase: (caseId: string) => void;
  onClose: () => void;
}

export default function GenealogyPanel({ chain, activeCaseId, onSelectCase, onClose }: GenealogyPanelProps) {
  if (!chain) return null;

  const chainCases = chain.caseIds
    .map(id => getCaseById(id))
    .filter(Boolean) as GraphNode[];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: -320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -320, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute left-4 top-4 bottom-4 w-80 glass-panel flex flex-col z-20 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800/60">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-indigo-400">
              <GitBranch className="w-5 h-5" />
              <h2 className="font-semibold text-sm tracking-wide uppercase">Genealogy</h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <h3 className="text-lg font-bold text-white leading-tight">{chain.name}</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{chain.description}</p>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="genealogy-timeline">
            {chainCases.map((caseNode, index) => {
              const isActive = caseNode.id === activeCaseId;
              const court = caseNode.metadata?.court || '';
              const date = caseNode.metadata?.date || '';

              return (
                <motion.div
                  key={caseNode.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={`genealogy-node ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectCase(caseNode.id)}
                >
                  {/* Relationship label (between nodes) */}
                  {index > 0 && (
                    <div className="absolute -top-1 left-0 right-0 flex justify-center">
                      <span className="text-[9px] font-mono text-indigo-400/60 bg-slate-900/80 px-1.5 rounded">
                        {getRelationshipLabel(chain.caseIds[index - 1], caseNode.id)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-200 leading-snug truncate">
                        {caseNode.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        {court && (
                          <span className={`court-badge court-badge--${court.replace(/\s/g, '')}`}>
                            {court}
                          </span>
                        )}
                        {date && (
                          <span className="text-[10px] text-slate-500 font-mono">{date}</span>
                        )}
                      </div>
                    </div>
                    {isActive && (
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-400 pulse-active mt-1.5" />
                    )}
                  </div>

                  {/* Mini description */}
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                    {caseNode.metadata?.keyPrinciples?.[0] || caseNode.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800/40">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{chainCases.length} cases in chain</span>
            <span className="font-mono">{chain.id}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function getRelationshipLabel(fromId: string, toId: string): string {
  // Simplified relationship labels for the genealogy view
  const relationships: Record<string, Record<string, string>> = {
    'HKCI-001': { 'HKCI-002': '→ Adopted by' },
    'HKCI-002': { 'HKCI-003': '→ Restated by' },
    'HKCI-003': { 'HKCI-004': '→ Applied by' },
    'HKCI-004': { 'HKCI-006': '→ Reaffirmed by' },
    'HKCI-006': { 'HKCI-017': '→ Restated by' },
    'HKCI-007': { 'HKCI-009': '→ Cited by' },
    'HKCI-009': { 'HKCI-013': '→ Questioned by' },
    'HKCI-013': { 'HKCI-010': '→ Distinguished by' },
    'HKCI-010': { 'HKCI-011': '→ Followed by' },
    'HKCI-011': { 'HKCI-012': '→ Resolved by' },
    'HKCI-012': { 'HKCI-014': '→ Synthesized by' },
    'HKCI-018': { 'HKCI-020': '→ Adopted by' },
    'HKCI-020': { 'HKCI-019': '→ Affirmed by' },
    'HKCI-019': { 'HKCI-017': '→ Applied by' },
  };
  return relationships[fromId]?.[toId] || '→ Develops';
}
