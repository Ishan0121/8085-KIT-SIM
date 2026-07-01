import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, BookOpen } from 'lucide-react';
import guideMd from '../../../Guide.md?raw';

export default function GuideModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[1000] flex items-center justify-center p-5 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700/50 rounded-xl w-full max-w-[900px] max-h-[90vh] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden animate-in slide-in-from-bottom-4 zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-black/20 shrink-0">
          <div className="flex items-center gap-3 font-inter text-lg font-semibold text-slate-100">
            <BookOpen size={20} className="text-cyan-400" />
            <span>Trainer Kit Guide</span>
          </div>
          <button className="bg-transparent border-none text-slate-400 cursor-pointer p-1.5 rounded-md flex items-center justify-center transition-colors hover:bg-slate-800 hover:text-slate-100" onClick={onClose} aria-label="Close Guide">
            <X size={20} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto font-inter text-slate-300 leading-relaxed markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {guideMd}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
