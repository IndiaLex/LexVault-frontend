import React, { useState, useRef, useEffect } from 'react';
import type { CaseChatMessage, CaseDossier } from '../api/types';
import { api } from '../api';
import { 
  Bot, 
  Send, 
  Sparkles, 
  FileText, 
  RotateCcw, 
  User, 
  CheckCircle2, 
  HelpCircle
} from 'lucide-react';

interface CaseChatbotViewProps {
  caseId: string;
  dossier?: CaseDossier;
  isCompact?: boolean;
}

const DEFAULT_SUGGESTIONS = [
  'Summarize FIR allegations & statutory acts',
  'List protected victim identity safeguards under Sec 228A',
  'Check chain of custody on seized digital evidence',
  'Draft Section 65B Electronic Evidence summary',
];

export const CaseChatbotView: React.FC<CaseChatbotViewProps> = ({
  caseId,
  dossier,
  isCompact = false,
}) => {
  const [messages, setMessages] = useState<CaseChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: `Greetings, Officer. I am your **IndiaLex Judicial Evidence Copilot** for docket **${dossier?.firNumber || caseId}**.\n\nAll digitized evidence, forensic extraction logs, and Polygon Amoy chain-of-custody proofs are indexed. You can ask me legal questions, statutory compliance checks, or evidence provenance inquiries.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidence: 0.99,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMessage: CaseChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await api.askCaseAI(caseId, query, messages);
      const aiMessage: CaseChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: response.citations,
        confidence: response.confidence || 0.95,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      const errorMessage: CaseChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `Error processing legal query: ${err.message || 'AI service response unavailable'}. Please verify case index connectivity.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        sender: 'ai',
        text: `Conversation reset. Ask any question regarding **${dossier?.firNumber || caseId}** investigation documents, forensic logs, or chain-of-custody records.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: 0.99,
      },
    ]);
  };

  return (
    <div className={`flex flex-col bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden ${isCompact ? 'h-full' : 'h-[calc(100vh-180px)] min-h-[500px]'}`}>
      {/* Top Copilot Header */}
      <div className="bg-[#0b2247] text-white px-5 py-3.5 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-sm tracking-wide">
                IndiaLex Judicial Intelligence Copilot
              </h3>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono uppercase font-semibold">
                Online · Case RAG
              </span>
            </div>
            <p className="text-[10px] text-slate-300">
              Docket: {dossier?.firNumber || caseId} · {dossier?.policeStation || 'National Evidence Ledger'}
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          title="Reset Conversation"
          className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 transition cursor-pointer"
        >
          <RotateCcw size={12} /> Clear
        </button>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#f8fafc]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-lg bg-[#0b2247] text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                <Bot size={17} />
              </div>
            )}

            <div
              className={`max-w-[82%] rounded-xl p-4 text-xs leading-relaxed shadow-2xs ${
                msg.sender === 'user'
                  ? 'bg-[#0b2247] text-white rounded-br-none'
                  : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none'
              }`}
            >
              {/* Message Header */}
              <div className="flex justify-between items-center pb-1.5 mb-1.5 border-b border-current/10 text-[10px] opacity-75">
                <span className="font-semibold">
                  {msg.sender === 'user' ? 'Investigating Officer' : 'IndiaLex Copilot'}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message Text */}
              <div className="whitespace-pre-wrap font-sans space-y-2">
                {msg.text.split('\n\n').map((para, pIdx) => (
                  <p key={pIdx}>{para}</p>
                ))}
              </div>

              {/* Citations & Evidence References */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-500 font-bold mb-1.5 flex items-center gap-1">
                    <FileText size={12} className="text-[#0b2247]" /> Evidence References Cited:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.citations.map((cite, cIdx) => (
                      <span
                        key={cIdx}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 font-mono text-[10px]"
                      >
                        {cite.filename} {cite.page ? `· Page ${cite.page}` : ''}
                      </span>
                    ))}
                    {msg.confidence && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[10px]">
                        <CheckCircle2 size={10} /> {Math.round(msg.confidence * 100)}% Match
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-xs">
                <User size={16} />
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-lg bg-[#0b2247] text-amber-400 flex items-center justify-center shrink-0 shadow-xs animate-pulse">
              <Bot size={17} />
            </div>
            <div className="bg-white border border-slate-200 text-slate-500 px-4 py-3 rounded-xl rounded-bl-none text-xs flex items-center gap-2 shadow-2xs">
              <span className="inline-block w-2 h-2 rounded-full bg-[#0b2247] animate-bounce" />
              <span className="inline-block w-2 h-2 rounded-full bg-[#0b2247] animate-bounce [animation-delay:0.2s]" />
              <span className="inline-block w-2 h-2 rounded-full bg-[#0b2247] animate-bounce [animation-delay:0.4s]" />
              <span className="font-medium text-slate-600 ml-1">Analyzing statutory case records & proofs...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="text-slate-400 font-bold uppercase tracking-wider shrink-0 text-[9px] flex items-center gap-1">
          <HelpCircle size={11} /> Suggested:
        </span>
        {DEFAULT_SUGGESTIONS.map((suggestion, sIdx) => (
          <button
            key={sIdx}
            type="button"
            onClick={() => handleSendMessage(suggestion)}
            disabled={isLoading}
            className="shrink-0 px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-[#0b2247] hover:bg-blue-50/50 text-slate-700 font-medium transition cursor-pointer disabled:opacity-50 text-[11px]"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask a question regarding ${dossier?.firNumber || caseId} evidence, custody logs, or statutes...`}
            disabled={isLoading}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#0b2247] focus:border-transparent text-slate-900 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0b2247] hover:bg-[#123363] text-white text-xs font-bold transition disabled:opacity-40 shadow-sm cursor-pointer"
        >
          <Send size={14} /> Send
        </button>
      </form>
    </div>
  );
};
