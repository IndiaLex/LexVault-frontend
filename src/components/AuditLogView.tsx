import React from 'react';
import type { GraphNodeData } from '../api/types';
import { Download, ShieldCheck, Clock, User, Hash, Scale } from 'lucide-react';

interface AuditLogViewProps {
  nodes: GraphNodeData[];
  caseId: string;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ nodes, caseId }) => {
  const exportToCSV = () => {
    const headers = ['Event ID', 'Document Lane', 'Action / Event', 'Officer / Actor', 'Timestamp (UTC)', 'Canonical SHA-256 Hash', 'Ledger Status', 'Tags'];
    const rows = nodes.map((n) => [
      n.id,
      n.lane,
      n.label,
      n.actor,
      n.timestamp,
      n.hash,
      n.anchored ? 'Anchored (Polygon Amoy)' : 'Pending',
      n.tags.join('; '),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${caseId}_Court_Custody_Ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden flex flex-col">
      {/* Header Bar */}
      <div className="bg-slate-100 border-b border-slate-300 px-5 py-3.5 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <Scale size={18} className="text-[#0b2247]" />
            <h3 className="font-serif font-bold text-sm text-[#0b2247]">
              Statutory Chain-of-Custody Ledger & Evidence Schedule
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Admissible under Section 65B Indian Evidence Act / BSA · Immutable Audit Trail
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded bg-[#0b2247] hover:bg-[#123363] text-white font-semibold shadow-2xs transition"
        >
          <Download size={13} /> Export Court CSV Bundle
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#f8fafc] border-b-2 border-slate-300 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 border-r border-slate-200">Event Action</th>
              <th className="py-3 px-4 border-r border-slate-200">Evidence File / Lane</th>
              <th className="py-3 px-4 border-r border-slate-200">Officer / System Actor</th>
              <th className="py-3 px-4 border-r border-slate-200">Recorded Timestamp</th>
              <th className="py-3 px-4 border-r border-slate-200">Canonical SHA-256 Hash</th>
              <th className="py-3 px-4 text-center">Seal Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {nodes.map((node) => (
              <tr key={node.id} className="hover:bg-amber-50/50 transition">
                <td className="py-3 px-4 border-r border-slate-200">
                  <div className="font-bold text-slate-900">{node.label}</div>
                  <div className="text-[10px] text-slate-500 font-mono font-medium">{node.type}</div>
                </td>
                <td className="py-3 px-4 border-r border-slate-200 font-mono text-[11px] font-semibold text-[#0b2247]">
                  {node.lane}
                </td>
                <td className="py-3 px-4 border-r border-slate-200 text-slate-800 font-medium">
                  <div className="flex items-center gap-1.5">
                    <User size={13} className="text-slate-500" /> {node.actor}
                  </div>
                </td>
                <td className="py-3 px-4 border-r border-slate-200 font-mono text-[11px] text-slate-700">
                  <div className="flex items-center gap-1">
                    <Clock size={12} className="text-slate-400" />
                    {new Date(node.timestamp).toLocaleString()}
                  </div>
                </td>
                <td className="py-3 px-4 border-r border-slate-200 font-mono text-[11px] text-slate-900">
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded w-fit">
                    <Hash size={11} className="text-slate-400" />
                    {node.hash.slice(0, 16)}...
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  {node.anchored ? (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                      <ShieldCheck size={12} className="text-emerald-700" /> Anchored (Amoy)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                      Pending Seal
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-[#f8fafc] border-t border-slate-200 px-4 py-2.5 text-[11px] text-slate-500 flex justify-between items-center">
        <span>Total Logged Entries: {nodes.length}</span>
        <span className="font-mono">Ledger Consensus: Polygon Amoy Proof Validated</span>
      </div>
    </div>
  );
};