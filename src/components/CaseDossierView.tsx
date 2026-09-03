import React, { useState } from 'react';
import type { CaseDossier, User } from '../api/types';
import {
  UserX,
  ShieldAlert,
  Package,
  PlusCircle,
  CheckCircle2,
  X,
  Save
} from 'lucide-react';

interface CaseDossierViewProps {
  dossier: CaseDossier;
  user: User;
}

export const CaseDossierView: React.FC<CaseDossierViewProps> = ({ dossier, user }) => {
  const [subTab, setSubTab] = useState<'dossier' | 'diary' | 'malkhana'>('dossier');
  
  // Interactive State for Diary & Property Register
  const [diaryEntries, setDiaryEntries] = useState(dossier.diaryEntries);
  const [properties, setProperties] = useState(dossier.propertyRegister);

  // Modal controls
  const [showDiaryModal, setShowDiaryModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);

  // Diary Form
  const [activityInput, setActivityInput] = useState('');
  const [outcomeInput, setOutcomeInput] = useState('');

  // Property Form
  const [propDesc, setPropDesc] = useState('');
  const [propSource, setPropSource] = useState('');
  const [propLocation, setPropLocation] = useState<'Malkhana Store' | 'Forensic Science Lab (FSL)' | 'Court Safe'>('Malkhana Store');

  const handleAddDiaryEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityInput) return;
    const newEntry = {
      dayNumber: diaryEntries.length + 1,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      activity: activityInput,
      conductedBy: user.name,
      outcome: outcomeInput || 'Recorded into official case diary.',
    };
    setDiaryEntries([...diaryEntries, newEntry]);
    setActivityInput('');
    setOutcomeInput('');
    setShowDiaryModal(false);
  };

  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propDesc) return;
    const newProp = {
      propertyId: `PROP-2026-09${properties.length + 1}`,
      description: propDesc,
      seizedFrom: propSource || 'Crime scene / Investigation area',
      custodyLocation: propLocation,
      sealIntact: true,
    };
    setProperties([...properties, newProp]);
    setPropDesc('');
    setPropSource('');
    setShowPropertyModal(false);
  };

  return (
    <div className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden">
      {/* Sub navigation inside Case */}
      <div className="bg-slate-100 border-b border-slate-300 px-4 py-2 flex justify-between items-center">
        <div className="flex gap-2 text-xs font-semibold">
          <button
            onClick={() => setSubTab('dossier')}
            className={`px-3 py-1.5 rounded transition ${
              subTab === 'dossier'
                ? 'bg-[#0b2247] text-white shadow-2xs'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            FIR & Person Dossier (Victim / Accused)
          </button>
          <button
            onClick={() => setSubTab('diary')}
            className={`px-3 py-1.5 rounded transition ${
              subTab === 'diary'
                ? 'bg-[#0b2247] text-white shadow-2xs'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            Investigation Case Diary (Zimni) ({diaryEntries.length})
          </button>
          <button
            onClick={() => setSubTab('malkhana')}
            className={`px-3 py-1.5 rounded transition ${
              subTab === 'malkhana'
                ? 'bg-[#0b2247] text-white shadow-2xs'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            Malkhana & Evidence Register ({properties.length})
          </button>
        </div>

        <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
          Status: {dossier.status}
        </span>
      </div>

      <div className="p-6 text-slate-800 text-xs">
        {/* TAB 1: Real Investigation Dossier */}
        {subTab === 'dossier' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-200 pb-5">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Police Station</span>
                <p className="text-sm font-semibold text-slate-900">{dossier.policeStation}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Applicable Acts & Sections</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {dossier.actsSections.map((sec) => (
                    <span
                      key={sec}
                      className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-mono font-bold text-[10px]"
                    >
                      {sec}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Investigating Officer (IO)</span>
                <p className="text-sm font-semibold text-slate-900">{dossier.investigatingOfficer}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Victim Protection Section */}
              <div className="border border-red-200 bg-red-50/60 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-800 font-bold mb-3">
                  <ShieldAlert size={16} />
                  <span>Victim Identity Protection (Sec. 228A IPC Mandate)</span>
                </div>
                <div className="space-y-2 text-xs">
                  <p>
                    <strong>Assigned Pseudonym:</strong> {dossier.victim.alias}
                  </p>
                  <p>
                    <strong>Age / Gender:</strong> {dossier.victim.age} yrs / {dossier.victim.gender}
                  </p>
                  <p>
                    <strong>Encrypted Reference:</strong>{' '}
                    <span className="font-mono text-[11px] bg-white px-2 py-0.5 border border-red-300 rounded text-red-900 font-bold">
                      {dossier.victim.maskedIdentityRef}
                    </span>
                  </p>
                  <div className="text-[11px] text-red-700 bg-red-100 p-2.5 rounded mt-2 border border-red-200 leading-relaxed">
                    <strong>Statutory Safeguard:</strong> Disclosing victim identity in police reports or court bundles is a punishable offense. SecureDocX automatically masks all statements before export.
                  </div>
                </div>
              </div>

              {/* Suspect / Accused Dossier */}
              <div className="border border-slate-300 bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold mb-3">
                  <UserX size={16} className="text-[#0b2247]" />
                  <span>Suspects & Accused Persons</span>
                </div>
                <div className="space-y-3">
                  {dossier.suspects.map((suspect, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded border border-slate-200 shadow-2xs space-y-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">
                          {suspect.name} ({suspect.alias})
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                          {suspect.status}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{suspect.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Case Diary (Zimni) */}
        {subTab === 'diary' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Case Diary (Sec. 172 Cr.P.C. / Sec. 192 BNSS)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Daily chronological investigation record. Entries are append-only.
                </p>
              </div>
              {user.role === 'officer' && (
                <button
                  onClick={() => setShowDiaryModal(true)}
                  className="flex items-center gap-1.5 bg-[#0b2247] text-white px-3 py-1.5 rounded text-xs hover:bg-[#123363] font-medium shadow-2xs"
                >
                  <PlusCircle size={14} /> Add Daily Diary Entry
                </button>
              )}
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Day / Date</th>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Activity & Step Taken</th>
                    <th className="py-2.5 px-3">Conducting Officer</th>
                    <th className="py-2.5 px-3">Investigation Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {diaryEntries.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        Day {entry.dayNumber} ({entry.date})
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono">{entry.time}</td>
                      <td className="py-2.5 px-3 text-slate-800 font-medium">{entry.activity}</td>
                      <td className="py-2.5 px-3 text-slate-600">{entry.conductedBy}</td>
                      <td className="py-2.5 px-3 text-slate-700">{entry.outcome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Malkhana & Evidence Register */}
        {subTab === 'malkhana' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Malkhana (Property Room) & Seizure Register
                </h3>
                <p className="text-[11px] text-slate-500">
                  Chain-of-custody tracking for seized physical and digital exhibits.
                </p>
              </div>
              {user.role === 'officer' && (
                <button
                  onClick={() => setShowPropertyModal(true)}
                  className="flex items-center gap-1.5 bg-[#0b2247] text-white px-3 py-1.5 rounded text-xs hover:bg-[#123363] font-medium shadow-2xs"
                >
                  <Package size={14} /> Seize & Register New Property
                </button>
              )}
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Property ID</th>
                    <th className="py-2.5 px-3">Exhibit Description</th>
                    <th className="py-2.5 px-3">Source / Seized From</th>
                    <th className="py-2.5 px-3">Present Custody Location</th>
                    <th className="py-2.5 px-3 text-center">Seal Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {properties.map((item) => (
                    <tr key={item.propertyId} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#0b2247]">
                        {item.propertyId}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 font-medium">{item.description}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.seizedFrom}</td>
                      <td className="py-2.5 px-3">
                        <span className="bg-blue-50 text-[#0b2247] border border-blue-200 px-2 py-0.5 rounded font-semibold text-[10px]">
                          {item.custodyLocation}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {item.sealIntact ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                            <CheckCircle2 size={13} /> Intact & Signed
                          </span>
                        ) : (
                          <span className="text-red-600 font-bold">Seal Broken</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Add Diary Entry */}
      {showDiaryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-300">
            <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-[#0b2247]">Add Daily Case Diary (Zimni) Entry</h3>
              <button onClick={() => setShowDiaryModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddDiaryEntry} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Investigation Step / Action Taken</label>
                <textarea
                  required
                  rows={3}
                  value={activityInput}
                  onChange={(e) => setActivityInput(e.target.value)}
                  placeholder="e.g. Visited crime spot, questioned security personnel, collected CCTV drive..."
                  className="w-full border border-slate-300 rounded p-2 focus:outline-[#0b2247]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Outcome / Finding</label>
                <input
                  type="text"
                  value={outcomeInput}
                  onChange={(e) => setOutcomeInput(e.target.value)}
                  placeholder="e.g. Witness identified vehicle model; exhibit sealed."
                  className="w-full border border-slate-300 rounded p-2 focus:outline-[#0b2247]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDiaryModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0b2247] text-white rounded font-semibold flex items-center gap-1"
                >
                  <Save size={13} /> Save Diary Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Register Property */}
      {showPropertyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-300">
            <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-[#0b2247]">Register Seized Property in Malkhana</h3>
              <button onClick={() => setShowPropertyModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddProperty} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Exhibit Description</label>
                <input
                  required
                  type="text"
                  value={propDesc}
                  onChange={(e) => setPropDesc(e.target.value)}
                  placeholder="e.g. SanDisk 64GB Pen Drive containing CCTV footage"
                  className="w-full border border-slate-300 rounded p-2 focus:outline-[#0b2247]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Source / Seized From</label>
                <input
                  type="text"
                  value={propSource}
                  onChange={(e) => setPropSource(e.target.value)}
                  placeholder="e.g. Commercial premise opposite to crime location"
                  className="w-full border border-slate-300 rounded p-2 focus:outline-[#0b2247]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Custody Location</label>
                <select
                  value={propLocation}
                  onChange={(e) => setPropLocation(e.target.value as any)}
                  className="w-full border border-slate-300 rounded p-2 focus:outline-[#0b2247]"
                >
                  <option value="Malkhana Store">Malkhana Store</option>
                  <option value="Forensic Science Lab (FSL)">Forensic Science Lab (FSL)</option>
                  <option value="Court Safe">Court Safe</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPropertyModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0b2247] text-white rounded font-semibold flex items-center gap-1"
                >
                  <Save size={13} /> Register Exhibit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};