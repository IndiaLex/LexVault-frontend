import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, CaseSummary, CaseDossier } from '../api/types';
import { api } from '../api';
import {
  FolderGit2,
  Search,
  ArrowUpRight,
  Plus,
  Landmark,
  FileText,
  Loader2,
  X,
  Save,
  LogOut,
  ShieldAlert,
  UserCheck,
  BookOpen,
  Building2,
  Calendar,
} from 'lucide-react';

interface CaseListPageProps {
  user: User | null;
}

export const CaseListPage: React.FC<CaseListPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalTab, setModalTab] = useState<'fir' | 'parties' | 'investigation'>('fir');
  const [creating, setCreating] = useState(false);

  // Comprehensive FIR Form State
  const [formData, setFormData] = useState({
    // Step 1: FIR Parameters
    firNumber: `FIR-2026-0${Math.floor(200 + Math.random() * 800)}`,
    title: '',
    policeStation: 'Civil Lines Police Station, Central District',
    district: 'Central District, New Delhi',
    actsSections: 'IPC 354, IPC 452, BNS 74',
    dateOfOccurrence: new Date().toISOString().slice(0, 16),
    dateReported: new Date().toISOString().slice(0, 16),
    investigatingOfficer: user?.name || 'Inspector Sharma',

    // Step 2: Complainant & Victim
    complainantName: '',
    complainantContact: '+91 ',
    complainantAddress: '',
    victimAlias: 'Victim Alpha-1',
    victimAge: '28',
    victimGender: 'Female',
    victimIsProtected: true,
    victimMaskedRef: `REF-228A-DEL-2026-${Math.floor(1000 + Math.random() * 9000)}`,

    // Step 3: Accused & Initial Case Diary
    suspectName: '',
    suspectAlias: '',
    suspectStatus: 'Under Interrogation',
    suspectDetails: '',
    initialDiaryActivity: 'FIR registered upon formal complaint. IO visited crime scene for spot inspection.',
    initialDiaryOutcome: 'Site inspection completed; rough sketch prepared; initial exhibits cordoned off.',
    propertyDesc: '',
    propertySeizedFrom: '',
  });

  const loadCases = async () => {
    setLoading(true);
    try {
      const data = await api.getCases();
      setCases(data);
    } catch (err) {
      console.error('Failed to load cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a Case Title / Allegation');
      setModalTab('fir');
      return;
    }

    setCreating(true);

    const fullTitle = `${formData.firNumber} — ${formData.title.trim()}`;
    const dossier: CaseDossier = {
      firNumber: formData.firNumber,
      policeStation: formData.policeStation,
      district: formData.district,
      actsSections: formData.actsSections
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      dateOfOccurrence: formData.dateOfOccurrence.replace('T', ' '),
      dateReported: formData.dateReported.replace('T', ' '),
      investigatingOfficer: formData.investigatingOfficer,
      status: 'Under Investigation',
      complainant: {
        name: formData.complainantName || 'Complainant on Record',
        contact: formData.complainantContact || '+91 98000 00000',
        address: formData.complainantAddress || 'Confidential Police Record',
      },
      victim: {
        alias: formData.victimAlias,
        age: parseInt(formData.victimAge, 10) || 28,
        gender: formData.victimGender,
        isProtected: formData.victimIsProtected,
        maskedIdentityRef: formData.victimMaskedRef,
      },
      suspects: formData.suspectName.trim()
        ? [
            {
              name: formData.suspectName.trim(),
              alias: formData.suspectAlias.trim() || 'N/A',
              status: formData.suspectStatus as any,
              details: formData.suspectDetails.trim() || 'Alleged involvement under investigation.',
            },
          ]
        : [],
      diaryEntries: [
        {
          dayNumber: 1,
          date: formData.dateReported.split('T')[0],
          time: formData.dateReported.split('T')[1] || '10:00',
          activity: formData.initialDiaryActivity,
          conductedBy: formData.investigatingOfficer,
          outcome: formData.initialDiaryOutcome,
        },
      ],
      propertyRegister: formData.propertyDesc.trim()
        ? [
            {
              propertyId: 'EX-2026-01',
              description: formData.propertyDesc.trim(),
              seizedFrom: formData.propertySeizedFrom.trim() || 'Scene of crime',
              custodyLocation: 'Malkhana Store',
              sealIntact: true,
            },
          ]
        : [],
    };

    try {
      const created = await api.createCase({ title: fullTitle, dossier });
      setShowCreateModal(false);
      if (created && created.id) {
        navigate(`/case/${created.id}`);
      } else {
        await loadCases();
      }
    } catch (err) {
      console.error('Failed to create case:', err);
      alert('Failed to register new case. Please verify backend connection.');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    navigate('/login');
  };

  const filteredCases = cases.filter(
    (c) =>
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.station && c.station.toLowerCase().includes(searchTerm.toLowerCase()))
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
                  IndiaLex Case Docket Register
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

          <div className="flex items-center gap-3">
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

            <button
              onClick={handleLogout}
              title="Logout Session"
              className="p-2 rounded-lg bg-[#123363] hover:bg-rose-900/60 border border-slate-600 text-slate-300 hover:text-white transition"
            >
              <LogOut size={16} />
            </button>
          </div>
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

          {user?.role !== 'auditor' && (
            <button
              onClick={() => {
                setModalTab('fir');
                setShowCreateModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#0b2247] hover:bg-[#123363] text-white text-xs font-semibold shadow-sm transition"
            >
              <Plus size={14} /> Register New FIR Docket
            </button>
          )}
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
        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-500 gap-2">
            <Loader2 size={18} className="animate-spin text-[#0b2247]" />
            <span className="text-xs">Loading case dockets from state registry...</span>
          </div>
        ) : (
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
                      {c.dossier?.firNumber || (c.title.includes('FIR-') ? c.title.split('—')[0].trim() : c.id.slice(0, 13))}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {c.status}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-slate-900 text-sm group-hover:text-[#0b2247] transition">
                    {c.title.includes('—') ? c.title.split('—')[1].trim() : c.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-1">{c.station || 'Civil Lines Police Station'}</p>
                  <div className="text-[10px] font-mono text-slate-500 mt-1 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded inline-block">
                    {c.acts || 'Sec. 154 Cr.P.C. / BNSS'}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-[11px] text-slate-600">
                  <span className="flex items-center gap-1 font-medium">
                    <FileText size={13} className="text-[#0b2247]" />
                    {c.dossier?.propertyRegister?.length || c.documentsCount || 0} Case Exhibits
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-[#0b2247] group-hover:translate-x-0.5 transition">
                    Open Docket <ArrowUpRight size={13} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Comprehensive Modal: Register New FIR Docket */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-slate-300 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-3 border-b border-slate-200 pb-3 shrink-0">
              <div>
                <h3 className="font-serif font-bold text-base text-[#0b2247]">
                  Register New First Information Report (FIR) Docket
                </h3>
                <p className="text-[11px] text-slate-500">
                  Statutory intake pursuant to Sec. 154 Cr.P.C. / Sec. 173 BNSS · Cryptographic Ledger
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="flex border-b border-slate-200 mb-4 shrink-0 text-xs">
              <button
                type="button"
                onClick={() => setModalTab('fir')}
                className={`px-4 py-2 font-semibold border-b-2 transition flex items-center gap-1.5 ${
                  modalTab === 'fir'
                    ? 'border-[#0b2247] text-[#0b2247] bg-slate-50'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Building2 size={14} /> 1. FIR & Jurisdiction
              </button>
              <button
                type="button"
                onClick={() => setModalTab('parties')}
                className={`px-4 py-2 font-semibold border-b-2 transition flex items-center gap-1.5 ${
                  modalTab === 'parties'
                    ? 'border-[#0b2247] text-[#0b2247] bg-slate-50'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <UserCheck size={14} /> 2. Complainant & Victim Card
              </button>
              <button
                type="button"
                onClick={() => setModalTab('investigation')}
                className={`px-4 py-2 font-semibold border-b-2 transition flex items-center gap-1.5 ${
                  modalTab === 'investigation'
                    ? 'border-[#0b2247] text-[#0b2247] bg-slate-50'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <BookOpen size={14} /> 3. Suspect & Case Diary (Zimni)
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
              {/* TAB 1: FIR & JURISDICTION */}
              {modalTab === 'fir' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">FIR Number</label>
                      <input
                        type="text"
                        required
                        value={formData.firNumber}
                        onChange={(e) => handleInputChange('firNumber', e.target.value)}
                        className="w-full border border-slate-300 rounded p-2 focus:outline-[#0b2247] font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Police Station</label>
                      <input
                        type="text"
                        required
                        value={formData.policeStation}
                        onChange={(e) => handleInputChange('policeStation', e.target.value)}
                        className="w-full border border-slate-300 rounded p-2 focus:outline-[#0b2247]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Case Title / Offence Heading
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. State vs. Unknown (Trespass & Financial Cyber Fraud at Vertex Corp)"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full border border-slate-300 rounded p-2 focus:outline-[#0b2247]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">District / Jurisdiction</label>
                      <input
                        type="text"
                        required
                        value={formData.district}
                        onChange={(e) => handleInputChange('district', e.target.value)}
                        className="w-full border border-slate-300 rounded p-2 focus:outline-[#0b2247]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Applicable Acts & Sections
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. IPC 354, 452, BNS 74, IT Act 66D"
                        value={formData.actsSections}
                        onChange={(e) => handleInputChange('actsSections', e.target.value)}
                        className="w-full border border-slate-300 rounded p-2 focus:outline-[#0b2247]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Date of Occurrence</label>
                      <div className="flex items-center gap-1.5 border border-slate-300 rounded px-2 py-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        <input
                          type="datetime-local"
                          required
                          value={formData.dateOfOccurrence}
                          onChange={(e) => handleInputChange('dateOfOccurrence', e.target.value)}
                          className="w-full bg-transparent focus:outline-none text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Date Reported to Station</label>
                      <div className="flex items-center gap-1.5 border border-slate-300 rounded px-2 py-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        <input
                          type="datetime-local"
                          required
                          value={formData.dateReported}
                          onChange={(e) => handleInputChange('dateReported', e.target.value)}
                          className="w-full bg-transparent focus:outline-none text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Investigating Officer (IO)</label>
                    <input
                      type="text"
                      required
                      value={formData.investigatingOfficer}
                      onChange={(e) => handleInputChange('investigatingOfficer', e.target.value)}
                      className="w-full border border-slate-300 rounded p-2 focus:outline-[#0b2247]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: COMPLAINANT & VICTIM CARD */}
              {modalTab === 'parties' && (
                <div className="space-y-4">
                  {/* Complainant Section */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                    <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <UserCheck size={14} className="text-[#0b2247]" /> Complainant / Informant Details
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-600 text-[11px] mb-0.5">Full Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Smt. Sunita Devi"
                          value={formData.complainantName}
                          onChange={(e) => handleInputChange('complainantName', e.target.value)}
                          className="w-full border border-slate-300 bg-white rounded p-1.5 focus:outline-[#0b2247]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 text-[11px] mb-0.5">Contact Number</label>
                        <input
                          type="text"
                          placeholder="+91 98101 23456"
                          value={formData.complainantContact}
                          onChange={(e) => handleInputChange('complainantContact', e.target.value)}
                          className="w-full border border-slate-300 bg-white rounded p-1.5 focus:outline-[#0b2247]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-600 text-[11px] mb-0.5">Residential Address</label>
                      <input
                        type="text"
                        placeholder="e.g. House No. 42, Civil Lines, Central District, New Delhi"
                        value={formData.complainantAddress}
                        onChange={(e) => handleInputChange('complainantAddress', e.target.value)}
                        className="w-full border border-slate-300 bg-white rounded p-1.5 focus:outline-[#0b2247]"
                      />
                    </div>
                  </div>

                  {/* Victim Safeguard Card */}
                  <div className="bg-rose-50/70 border border-rose-200 rounded-lg p-3 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                        <ShieldAlert size={14} className="text-rose-700" />
                        Victim Identity Protection (Section 228A IPC Mandate)
                      </h4>
                      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.victimIsProtected}
                          onChange={(e) => handleInputChange('victimIsProtected', e.target.checked)}
                          className="rounded border-rose-300 text-[#0b2247]"
                        />
                        Protected Identity
                      </label>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-slate-600 text-[11px] mb-0.5">Pseudonym / Alias</label>
                        <input
                          type="text"
                          value={formData.victimAlias}
                          onChange={(e) => handleInputChange('victimAlias', e.target.value)}
                          className="w-full border border-slate-300 bg-white rounded p-1.5 focus:outline-[#0b2247]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 text-[11px] mb-0.5">Age</label>
                        <input
                          type="number"
                          value={formData.victimAge}
                          onChange={(e) => handleInputChange('victimAge', e.target.value)}
                          className="w-full border border-slate-300 bg-white rounded p-1.5 focus:outline-[#0b2247]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 text-[11px] mb-0.5">Gender</label>
                        <select
                          value={formData.victimGender}
                          onChange={(e) => handleInputChange('victimGender', e.target.value)}
                          className="w-full border border-slate-300 bg-white rounded p-1.5 focus:outline-[#0b2247]"
                        >
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other / Non-Binary</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 text-[11px] mb-0.5">
                        Masked Identity Reference Code
                      </label>
                      <input
                        type="text"
                        value={formData.victimMaskedRef}
                        onChange={(e) => handleInputChange('victimMaskedRef', e.target.value)}
                        className="w-full border border-slate-300 bg-white rounded p-1.5 focus:outline-[#0b2247] font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ACCUSED & INITIAL ZIMNI DIARY */}
              {modalTab === 'investigation' && (
                <div className="space-y-4">
                  {/* Accused / Suspect Information */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                    <h4 className="font-bold text-slate-800 text-xs">Accused / Suspect Details (Initial Listing)</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-slate-600 text-[11px] mb-0.5">Suspect Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Rakesh Kumar"
                          value={formData.suspectName}
                          onChange={(e) => handleInputChange('suspectName', e.target.value)}
                          className="w-full border border-slate-300 bg-white rounded p-1.5 focus:outline-[#0b2247]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 text-[11px] mb-0.5">Alias / Moniker</label>
                        <input
                          type="text"
                          placeholder="e.g. Rocky"
                          value={formData.suspectAlias}
                          onChange={(e) => handleInputChange('suspectAlias', e.target.value)}
                          className="w-full border border-slate-300 bg-white rounded p-1.5 focus:outline-[#0b2247]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 text-[11px] mb-0.5">Current Status</label>
                        <select
                          value={formData.suspectStatus}
                          onChange={(e) => handleInputChange('suspectStatus', e.target.value)}
                          className="w-full border border-slate-300 bg-white rounded p-1.5 focus:outline-[#0b2247]"
                        >
                          <option value="Under Interrogation">Under Interrogation</option>
                          <option value="Notice Served (Sec 41A)">Notice Served (Sec 41A)</option>
                          <option value="Arrested">Arrested</option>
                          <option value="Absconding">Absconding</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-600 text-[11px] mb-0.5">Specific Allegations / Custody Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. Detained near Kashmere Gate terminal; forensic device seized for extraction."
                        value={formData.suspectDetails}
                        onChange={(e) => handleInputChange('suspectDetails', e.target.value)}
                        className="w-full border border-slate-300 bg-white rounded p-1.5 focus:outline-[#0b2247]"
                      />
                    </div>
                  </div>

                  {/* Initial Case Diary (Zimni Day 1) */}
                  <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 space-y-2">
                    <h4 className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                      <BookOpen size={14} className="text-amber-800" /> Day 1 Case Diary (Zimni Entry — Sec. 172 Cr.P.C.)
                    </h4>
                    <div>
                      <label className="block text-slate-600 text-[11px] mb-0.5">Investigative Activity Taken</label>
                      <textarea
                        rows={2}
                        value={formData.initialDiaryActivity}
                        onChange={(e) => handleInputChange('initialDiaryActivity', e.target.value)}
                        className="w-full border border-slate-300 bg-white rounded p-1.5 focus:outline-[#0b2247] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-[11px] mb-0.5">Investigation Outcome / Next Direction</label>
                      <input
                        type="text"
                        value={formData.initialDiaryOutcome}
                        onChange={(e) => handleInputChange('initialDiaryOutcome', e.target.value)}
                        className="w-full border border-slate-300 bg-white rounded p-1.5 focus:outline-[#0b2247]"
                      />
                    </div>
                  </div>

                  {/* Initial Property / Malkhana Exhibit (Optional) */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                    <h4 className="font-bold text-slate-800 text-xs">Malkhana Property Exhibit (Optional Initial Seizure)</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-600 text-[11px] mb-0.5">Exhibit Description</label>
                        <input
                          type="text"
                          placeholder="e.g. One Samsung Smartphone in sealed tamper pouch"
                          value={formData.propertyDesc}
                          onChange={(e) => handleInputChange('propertyDesc', e.target.value)}
                          className="w-full border border-slate-300 bg-white rounded p-1.5 focus:outline-[#0b2247]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 text-[11px] mb-0.5">Seized From / Location</label>
                        <input
                          type="text"
                          placeholder="e.g. From possession of accused Rakesh"
                          value={formData.propertySeizedFrom}
                          onChange={(e) => handleInputChange('propertySeizedFrom', e.target.value)}
                          className="w-full border border-slate-300 bg-white rounded p-1.5 focus:outline-[#0b2247]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="border-t border-slate-200 pt-3 flex justify-between items-center shrink-0">
                <div className="flex gap-1.5">
                  {modalTab !== 'fir' && (
                    <button
                      type="button"
                      onClick={() => setModalTab(modalTab === 'investigation' ? 'parties' : 'fir')}
                      className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100"
                    >
                      Back
                    </button>
                  )}
                  {modalTab !== 'investigation' && (
                    <button
                      type="button"
                      onClick={() => setModalTab(modalTab === 'fir' ? 'parties' : 'investigation')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded"
                    >
                      Next Step →
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-1.5 bg-[#0b2247] hover:bg-[#123363] disabled:bg-slate-400 text-white rounded font-semibold flex items-center gap-1.5 shadow"
                  >
                    {creating ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    {creating ? 'Registering FIR...' : 'Register FIR Docket'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};