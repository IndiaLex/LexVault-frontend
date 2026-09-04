import React, { useState } from 'react';
import type { CaseDossier } from '../api/types';
import { CaseChatbotView } from './CaseChatbotView';
import { Bot, Sparkles, X, ChevronDown } from 'lucide-react';

interface FloatingAIChatWidgetProps {
  caseId: string;
  dossier?: CaseDossier;
}

export const FloatingAIChatWidget: React.FC<FloatingAIChatWidgetProps> = ({
  caseId,
  dossier,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-[#0b2247] hover:bg-[#123363] text-white shadow-2xl border-2 border-[#d97706] hover:scale-105 transition-all duration-200 cursor-pointer group"
          title="Open IndiaLex Case AI Assistant"
        >
          <div className="relative">
            <Bot size={18} className="text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full" />
          </div>
          <span className="text-xs font-bold font-serif tracking-wide">
            Ask Case AI
          </span>
          <Sparkles size={13} className="text-amber-300" />
        </button>
      )}

      {/* Floating Chat Drawer Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-32px)] h-[560px] max-h-[calc(100vh-80px)] bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Quick minimize header bar */}
          <div className="bg-[#07162e] text-white px-4 py-2 flex justify-between items-center text-xs border-b border-slate-700/50">
            <span className="font-mono text-[10px] text-amber-400 flex items-center gap-1">
              <Sparkles size={11} /> AI COPILOT QUICK DRAWER
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Minimize Drawer"
              >
                <ChevronDown size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Close"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <CaseChatbotView caseId={caseId} dossier={dossier} isCompact={true} />
          </div>
        </div>
      )}
    </>
  );
};
