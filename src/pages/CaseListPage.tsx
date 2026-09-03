import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../api/types';
import { FolderGit2, Search, ArrowUpRight, Plus, Landmark, FileText } from 'lucide-react';

interface CaseListPageProps {
  user: User | null;
}

export const CaseListPage: React.FC<CaseListPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const cases = [
    {
      id: 'FIR-2026-0417',
      title: 'State vs. Unknown (Trespass & Intimidation)',
      station: 'Civil Lines Police Station, Central District',
      acts: 'IPC 354, 452 · BNS 74',
      documentsCount: 2,
      lastAction: 'Anchored to Polygon Amoy (Block #1420984)',
      status: 'Active Investigation',
      priority: 'High Priority',
    },
    {
      id: 'FIR-2026-0182',
      title: 'State vs. Cyber Syndicate (Financial Impersonation)',
      station: 'Cyber Crime Police Station, North Range',
      acts: 'IT Act Sec. 66C, 66D · IPC 420',
      documentsCount: 5,
      lastAction: 'Forensic Extraction Sealed in Malkhana',
      status: 'Under Review',
      priority: 'Routine',
    },
    {
      id: 'FIR-2026-0094',
      title: 'Seizure & Digital Evidence Chain Verification',
      station: 'Special Crime Branch, Central Range',
      acts: 'IPC 120B, 468, 471',
      documentsCount: 8,
      lastAction: 'Charge Sheet Anchored to Ledger',
      status: 'Court Bundle Exported',
      priority: 'Statutory Fast-Track',
    },
  ];

  const filteredCases = cases.filter(
    (c) =>
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.station.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-900 font-sans flex flex-col antialiased">
      {/* Top National Branding Strip */}
      <header className="bg-[#0b2247] text-white border-b-4 border-[#d97706] shadow-md shrink-0">
        <div className="bg-[#07162e] px-6 py-1.5 flex justify-between items-center text-[11px] text-slate-300 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <Landmark size={13} className="text-[#f59e0b]" />
            <span>Ministry of Home Affairs · National Crime Records Bureau (NCRB)</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono">
            <span>PORTAL: SECUREDOCX / POLICE CASENET</span>
            <span>NATIONAL CUSTODY REGISTRY</span>
          </div>
        </div>

        <div className="px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-md text-[#0b2247] shadow-sm">
              <FolderGit2 size={24} className="text-[#0b2247]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-base tracking-wide text-white">
                  SecureDocX Case Docket Register
                </h1>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-semibold uppercase">
                  State Case Registry
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Official Law Enforcement Portal · Cryptographic Chain of Custody System
              </p>
            </div>
          </div>

          {user && (
            <div className="bg-[#123363] border border-slate-600 rounded-lg px-3 py-1.5 flex items-center gap-3">
              <div className="text-left">
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  {user.name}
                  <span className="text-[9px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded uppercase">
                    {user.role}
                  </span>
                </div>
                <div className="text-[10px] text-slate-300">{user.designation}</div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Register Content */}
      <main className="flex-1 p-8 max-w-6xl w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold font-serif text-[#0b2247]">Registered Case Dockets</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Select an FIR docket to inspect daily Zimni diaries, evidence custody, and cryptographic proofs
            </p>
          </div>

          <button
            onClick={() => navigate('/case/FIR-2026-0417')}
            className="flex items-center gap-1.5 px-3 py-2 rounded bg-[#0b2247] hover:bg-[#123363] text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus size={14} /> Register New FIR Docket
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 shadow-2xs">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search by FIR number, jurisdiction, acts & sections, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent focus:outline-none w-full text-xs text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Case Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCases.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/case/${c.id}`)}
              className="bg-white border border-slate-300 hover:border-[#0b2247] rounded-lg p-5 cursor-pointer transition shadow-2xs hover:shadow-md flex flex-col justify-between space-y-4 group border-t-4 border-t-[#0b2247]"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-xs font-bold text-[#0b2247] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {c.id}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {c.status}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-slate-900 text-sm group-hover:text-[#0b2247] transition">
                  {c.title}
                </h3>
                <p className="text-[11px] text-slate-600 mt-1">{c.station}</p>
                <div className="text-[10px] font-mono text-slate-500 mt-1 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded inline-block">
                  {c.acts}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-[11px] text-slate-600">
                <span className="flex items-center gap-1 font-medium">
                  <FileText size={13} className="text-[#0b2247]" />
                  {c.documentsCount} Case Documents
                </span>
                <span className="flex items-center gap-1 font-semibold text-[#0b2247] group-hover:translate-x-0.5 transition">
                  Open Docket <ArrowUpRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};