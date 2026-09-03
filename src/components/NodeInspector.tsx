import React, { useState } from 'react';
import type { GraphNodeData, VerificationResult } from '../api/types';
import { api } from '../api';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Loader2, 
  ExternalLink, 
  Hash, 
  Clock, 
  User, 
  Tag, 
  AlertTriangle,
  X
} from 'lucide-react';

interface NodeInspectorProps {
  node: GraphNodeData | null;
  onClose: () => void;
  isTampered?: boolean;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({ 
  node, 
  onClose,
  isTampered = false 
}) => {
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  if (!node) return null;

  const handleVerify = async () => {
    setVerifying(true);
    setResult(null);
    try {
      const res = await api.verifyNodeHash(node.hash);
      if (isTampered) {
        setResult({
          ...res,
          valid: false,
        });
      } else {
        setResult(res);
      }
    } catch (err) {
      console.error('Verification error:', err);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 bg-white border-l border-slate-300 shadow-2xl flex flex-col antialiased">
      {/* Drawer Header */}
      <div className="bg-[#0b2247] text-white p-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono text-amber-300 tracking-wider uppercase">
            {node.lane}
          </span>
          <h3 className="font-serif font-bold text-sm">{node.label}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-300 hover:text-white hover:bg-[#123363] transition"
        >
          <X size={18} />
        </button>
      </div>

      {/* Metadata Attributes */}
      <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs text-slate-800">
        <div>
          <label className="text-slate-500 text-[11px] font-semibold flex items-center gap-1.5 mb-1 uppercase tracking-wider">
            <User size={13} className="text-[#0b2247]" /> Authorized Officer / Agent
          </label>
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200 font-medium">
            {node.actor}
          </div>
        </div>

        <div>
          <label className="text-slate-500 text-[11px] font-semibold flex items-center gap-1.5 mb-1 uppercase tracking-wider">
            <Clock size={13} className="text-[#0b2247]" /> Recorded Timestamp (UTC)
          </label>
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200 font-mono text-[11px]">
            {new Date(node.timestamp).toLocaleString()}
          </div>
        </div>

        <div>
          <label className="text-slate-500 text-[11px] font-semibold flex items-center gap-1.5 mb-1 uppercase tracking-wider">
            <Hash size={13} className="text-[#0b2247]" /> Canonical SHA-256 Digest
          </label>
          <div className="bg-slate-100 p-2.5 rounded border border-slate-200 font-mono text-[10px] break-all leading-relaxed select-all">
            {node.hash}
          </div>
        </div>

        <div>
          <label className="text-slate-500 text-[11px] font-semibold flex items-center gap-1.5 mb-1.5 uppercase tracking-wider">
            <Tag size={13} className="text-[#0b2247]" /> Contextual Tags
          </label>
          <div className="flex flex-wrap gap-1.5">
            {node.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-300 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {isTampered && (
          <div className="p-3 bg-red-50 border border-red-300 rounded text-red-800 flex items-start gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-600" />
            <div className="text-[11px] leading-snug">
              <strong className="block mb-0.5">Tamper Flag Triggered</strong>
              File integrity altered out-of-band. Calculated digest diverges from the sealed Merkle anchor.
            </div>
          </div>
        )}
      </div>

      {/* Footer / Verification */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <button
          onClick={handleVerify}
          disabled={verifying}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded bg-[#0b2247] hover:bg-[#123363] disabled:bg-slate-400 text-white font-semibold text-xs shadow-sm transition"
        >
          {verifying ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Verifying On-Chain Proof...
            </>
          ) : (
            'Verify Cryptographic Seal'
          )}
        </button>

        {result && (
          <div
            className={`mt-3 p-3 rounded border text-xs transition-all ${
              result.valid
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-red-50 border-red-300 text-red-900'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold mb-1">
              {result.valid ? <ShieldCheck size={16} className="text-emerald-600" /> : <ShieldAlert size={16} className="text-red-600" />}
              {result.valid ? 'Seal Authenticated On-Chain' : 'Verification Mismatch'}
            </div>
            
            <p className="text-[11px] text-slate-600 mb-2">
              {result.valid
                ? `Matched Merkle Root in Block #${result.block_number} on Polygon Amoy (80002)`
                : 'Digest rejected: does not match the anchored state in CustodyLedger.'}
            </p>

            <a
              href={result.explorer_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-blue-700 hover:underline font-mono font-medium"
            >
              View PolygonScan Receipt <ExternalLink size={11} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};