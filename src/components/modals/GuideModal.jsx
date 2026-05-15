import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, BookOpen } from 'lucide-react';
import guideMd from '../../../Guide.md?raw';
import './GuideModal.css';

export default function GuideModal({ onClose }) {
  return (
    <div className="guide-modal-overlay" onClick={onClose}>
      <div className="guide-modal-content" onClick={e => e.stopPropagation()}>
        <div className="guide-modal-header">
          <div className="guide-modal-title">
            <BookOpen size={20} className="guide-title-icon" />
            <span>Trainer Kit Guide</span>
          </div>
          <button className="guide-close-btn" onClick={onClose} aria-label="Close Guide">
            <X size={20} />
          </button>
        </div>
        <div className="guide-modal-body markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {guideMd}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
