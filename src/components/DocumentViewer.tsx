import React, { useState } from 'react';
import type { RedactionBox } from '../api/types';
import { ShieldAlert, Eye, EyeOff, FileText, CheckCircle2, Printer } from 'lucide-react';

interface DocumentViewerProps {
  documentTitle: string;
  boxes: RedactionBox[];
  canUnredact?: boolean;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentTitle,
  boxes,
  canUnredact = true,
}) => {
  const [showUnredacted, setShowUnredacted] = useState(false);

  return (
    <div className="flex flex-col bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden">
      {/* Document Action Ribbon */}
      <div className="flex justify-between items-center px-5 py-3 bg-slate-100 border-b border-slate-300">
        <div className="flex items-center gap-2.5">
          <FileText size={18} className="text-[#0b2247]" />
          <div>
            <span className="text-xs font-bold text-slate-900">{documentTitle}</span>
            <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
              {boxes.length} Statutory Redactions Applied
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canUnredact && (
            <button
              onClick={() => setShowUnredacted(!showUnredacted)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded font-semibold border transition shadow-2xs ${
                showUnredacted
                  ? 'bg-amber-500 text-slate-950 border-amber-600 hover:bg-amber-400'
                  : 'bg-white hover:bg-slate-50 text-[#0b2247] border-slate-300'
              }`}
            >
              {showUnredacted ? <EyeOff size={14} /> : <Eye size={14} />}
              {showUnredacted ? 'Re-Apply Statutory Masking' : 'Reveal Unredacted Original (Authorized IO Only)'}
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-300"
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Official Parchment/Paper Container */}
      <div className="p-8 flex justify-center bg-slate-200/70 overflow-x-auto">
        <div className="relative w-[650px] min-h-[460px] bg-white border border-slate-300 rounded shadow-md p-9 text-slate-900 font-serif leading-relaxed text-xs select-none">
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-800 pb-3 mb-5 flex justify-between items-start text-[11px] font-sans">
            <div>
              <div className="font-bold uppercase tracking-wider text-slate-900 text-sm">
                FIRST INFORMATION REPORT (F.I.R.)
              </div>
              <div className="text-[10px] text-slate-600">
                (Under Section 154 Criminal Procedure Code / Sec. 173 BNSS)
              </div>
            </div>
            <div className="text-right text-[10px] text-slate-600 font-mono">
              <strong>PS:</strong> Civil Lines, Central District<br />
              <strong>District:</strong> North-Central Delhi
            </div>
          </div>

          <div className="space-y-3.5 text-[11px]">
            <p>
              <strong>1. Date and Time of Occurrence:</strong> 01 September 2026, 20:30 hrs<br />
              <strong>2. Date and Time of Report at PS:</strong> 02 September 2026, 09:15 hrs<br />
              <strong>3. Sections of Law:</strong> IPC Sections 354, 452 read with BNS Section 74
            </p>

            <div className="p-3 bg-slate-50 border-l-2 border-[#0b2247] rounded space-y-1">
              <strong>4. Statement of Complainant / Victim:</strong>
              <p className="mt-1 leading-relaxed">
                The complainant, <span className="font-sans font-semibold underline">Sunita Devi</span>, resident of House #42, Sector 12, Civil Lines, reported that an unknown male forced entry into her premises. The complainant gave emergency contact number <span className="font-mono">9876543210</span> and verified identity through national identity card ending in <span className="font-mono">XXXX-4491</span>.
              </p>
            </div>

            <p>
              <strong>5. Action Taken by Investigating Officer:</strong><br />
              Case registered and marked to Insp. Vikram Sharma for spot inspection and Malkhana seizure. The victim details have been ingested into the encrypted vault for automated Section 228A PII redaction prior to court file transmission.
            </p>
          </div>

          {/* Bottom Stamps */}
          <div className="mt-10 pt-4 border-t border-slate-300 flex justify-between items-center text-[10px] font-sans text-slate-600">
            <span className="font-semibold text-slate-700">Official Case Record · Certified True Copy</span>
            <span className="flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 size={12} className="text-emerald-600" /> Hash Verified On-Chain
            </span>
          </div>

          {/* Redaction Bounding Boxes */}
          {!showUnredacted &&
            boxes.map((box) => (
              <div
                key={box.entity_id}
                title={`Statutory Redaction: ${box.reason} (${Math.round(box.confidence * 100)}% confidence)`}
                style={{
                  left: `${box.x * 100}%`,
                  top: `${box.y * 100}%`,
                  width: `${box.width * 100}%`,
                  height: `${box.height * 100}%`,
                }}
                className="absolute bg-black text-amber-300 border border-amber-500/80 rounded flex items-center justify-center cursor-help shadow"
              >
                <span className="text-[8px] font-mono uppercase font-bold tracking-tight px-1 flex items-center gap-0.5">
                  <ShieldAlert size={9} /> {box.reason}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};