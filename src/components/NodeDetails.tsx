import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Book, Scale, Tag, ExternalLink, ChevronDown, ChevronUp, GitBranch, ArrowRightLeft } from 'lucide-react';
import { GraphNode, getCitingCases, getCitedCases, getGenealogyForCase, GenealogyChain } from '../data/hkCaseLaws';

interface NodeDetailsProps {
  node: GraphNode | null;
  onClose: () => void;
  onSelectCase?: (caseId: string) => void;
  onOpenGenealogy?: (chain: GenealogyChain) => void;
}

export default function NodeDetails({ node, onClose, onSelectCase, onOpenGenealogy }: NodeDetailsProps) {
  const [showFacts, setShowFacts] = useState(false);

  if (!node) return null;

  const getIcon = () => {
    switch (node.type) {
      case 'case': return <Scale className="w-6 h-6 text-blue-400" />;
      case 'topic': return <Book className="w-6 h-6 text-emerald-400" />;
      case 'tag': return <Tag className="w-6 h-6 text-purple-400" />;
    }
  };

  const getTypeLabel = () => {
    switch (node.type) {
      case 'case': return 'Case Law';
      case 'topic': return 'Legal Topic';
      case 'tag': return 'Thematic Tag';
    }
  };

  const citingCases = node.type === 'case' ? getCitingCases(node.id) : [];
  const citedCases = node.type === 'case' ? getCitedCases(node.id) : [];
  const genealogy = node.type === 'case' ? getGenealogyForCase(node.id) : undefined;
  const meta = node.metadata;

  return (
    <AnimatePresence>
      <motion.div
        key={node.id}
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 200, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute bottom-4 left-4 w-[420px] max-h-[70vh] glass-panel flex flex-col z-10 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800/60 flex items-start justify-between shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700/60 shrink-0">
              {getIcon()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-0.5">
                {getTypeLabel()}
              </div>
              <h3 className="font-bold text-slate-100 leading-tight text-sm">
                {node.name}
              </h3>
              {meta?.citation && (
                <div className="text-xs text-indigo-400 font-mono mt-1">{meta.citation}</div>
              )}
              {/* Court & Date badges */}
              {meta && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {meta.court && (
                    <span className={`court-badge court-badge--${meta.court.replace(/\s/g, '')}`}>
                      {meta.court}
                    </span>
                  )}
                  {meta.date && (
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/40">
                      {meta.date}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors mt-1 shrink-0 ml-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Description */}
            <p className="text-sm text-slate-300 leading-relaxed">
              {node.description}
            </p>

            {/* Facts Summary (collapsible) */}
            {meta?.factsSummary && (
              <div className="bg-slate-800/30 rounded-lg border border-slate-700/30 overflow-hidden">
                <button
                  onClick={() => setShowFacts(!showFacts)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-300 transition-colors"
                >
                  <span>Facts</span>
                  {showFacts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                <AnimatePresence>
                  {showFacts && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-3 pb-3 text-xs text-slate-400 leading-relaxed">
                        {meta.factsSummary}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Key Principles */}
            {meta?.keyPrinciples && meta.keyPrinciples.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Key Principles
                </h4>
                <ul className="space-y-1.5">
                  {meta.keyPrinciples.map((p, i) => (
                    <li key={i} className="flex gap-2 text-xs text-slate-300 leading-relaxed">
                      <span className="text-indigo-400/60 shrink-0 mt-0.5">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ruling */}
            {meta?.ruling && (
              <div className="bg-indigo-500/6 border border-indigo-500/15 rounded-lg p-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1.5">
                  Ruling
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">{meta.ruling}</p>
              </div>
            )}

            {/* Judges */}
            {meta?.judges && meta.judges.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Judge(s)
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {meta.judges.map((j, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-800/60 text-slate-300 rounded-md border border-slate-700/40">
                      {j}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {meta?.tags && meta.tags.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {meta.tags.map((tag, i) => (
                    <span key={i} className="citation-badge citation-badge--tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Citation Genealogy */}
            {(citedCases.length > 0 || citingCases.length > 0) && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Citations
                </h4>

                {/* Cases this case cites (upstream) */}
                {citedCases.length > 0 && (
                  <div className="mb-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Cites ↓</span>
                    <div className="mt-1 space-y-1">
                      {citedCases.map(({ case: c, label }) => (
                        <button
                          key={c.id}
                          onClick={() => onSelectCase?.(c.id)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-blue-500/10 transition-colors text-left group"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400/60" />
                          <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors truncate flex-1">
                            {c.name}
                          </span>
                          <span className="rel-label rel-label--{label.toLowerCase()}">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cases citing this case (downstream) */}
                {citingCases.length > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Cited By ↑</span>
                    <div className="mt-1 space-y-1">
                      {citingCases.map(({ case: c, label }) => (
                        <button
                          key={c.id}
                          onClick={() => onSelectCase?.(c.id)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-blue-500/10 transition-colors text-left group"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
                          <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors truncate flex-1">
                            {c.name}
                          </span>
                          <span className="rel-label rel-label--{label.toLowerCase()}">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Genealogy chain link */}
            {genealogy && (
              <button
                onClick={() => onOpenGenealogy?.(genealogy)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-indigo-500/8 border border-indigo-500/20 hover:bg-indigo-500/15 transition-colors group"
              >
                <GitBranch className="w-4 h-4 text-indigo-400" />
                <div className="flex-1 text-left">
                  <div className="text-xs font-medium text-indigo-300">View Genealogy Chain</div>
                  <div className="text-[10px] text-slate-500">{genealogy.name}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-indigo-400/50 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* HKLII Link */}
            {meta?.hkliiUrl && (
              <a
                href={meta.hkliiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-500/8 border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-300">View on HKLII</span>
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 p-3 border-t border-slate-800/40 flex justify-between items-center text-xs text-slate-500">
          <span className="font-mono">{node.id}</span>
          <span>Weight: {node.val}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
