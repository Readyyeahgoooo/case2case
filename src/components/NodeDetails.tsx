import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Book, Scale, Tag } from 'lucide-react';
import { GraphNode } from '../data/hkCaseLaws';

interface NodeDetailsProps {
  node: GraphNode | null;
  onClose: () => void;
}

export default function NodeDetails({ node, onClose }: NodeDetailsProps) {
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 200, opacity: 0 }}
        className="absolute bottom-4 left-4 w-96 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl z-10 overflow-hidden"
      >
        <div className="p-4 border-b border-slate-800 flex items-start justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
              {getIcon()}
            </div>
            <div>
              <div className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-0.5">
                {getTypeLabel()}
              </div>
              <h3 className="font-bold text-slate-100 leading-tight">
                {node.name}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors mt-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 bg-slate-950/50">
          <p className="text-sm text-slate-300 leading-relaxed">
            {node.description}
          </p>

          {node.metadata && (
            <div className="mt-3 flex gap-2">
              {node.metadata.court && (
                <span className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded-md border border-slate-700">
                  {node.metadata.court}
                </span>
              )}
              {node.metadata.date && (
                <span className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded-md border border-slate-700">
                  {node.metadata.date}
                </span>
              )}
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-between items-center text-xs text-slate-500">
            <span>ID: {node.id}</span>
            <span>Weight: {node.val}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
