
import React from 'react';
import { Button } from './Button';

interface ModalProps {
  title: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  title, 
  onClose, 
  children, 
  footer, 
  maxWidth = 'max-w-4xl',
  className = ''
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/95 z-[150] flex items-center justify-center p-0 md:p-8 backdrop-blur-xl animate-in fade-in duration-300">
      <div className={`w-full h-full md:h-auto md:max-h-[90vh] ${maxWidth} bg-slate-900 md:border md:border-slate-800 md:rounded-3xl overflow-hidden shadow-2xl flex flex-col ${className}`}>
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 shrink-0">
          <h2 className="text-xl md:text-3xl font-black italic text-white uppercase tracking-tighter">
            {title}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} icon={<i className="fa-solid fa-xmark text-xl"></i>} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 md:p-6 border-t border-slate-800 bg-slate-900/50 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
