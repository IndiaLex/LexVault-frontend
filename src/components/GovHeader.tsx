import React from 'react';
import type { User, UserRole } from '../api/types';
import { mockUsers } from '../api/mockClient';
import { Shield, Landmark, UserCheck, AlertTriangle } from 'lucide-react';

interface GovHeaderProps {
  currentUser: User;
  onSelectRole: (role: UserRole) => void;
  tampered: boolean;
  onToggleTamper: () => void;
}

export const GovHeader: React.FC<GovHeaderProps> = ({
  currentUser,
  onSelectRole,
  tampered,
  onToggleTamper,
}) => {
  return (
    <header className="bg-[#0b2247] text-white border-b-4 border-[#d97706] shadow-md shrink-0">
      {/* Top National Branding Strip */}
      <div className="bg-[#07162e] px-6 py-1.5 flex justify-between items-center text-[11px] text-slate-300 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Landmark size={13} className="text-[#f59e0b]" />
          <span>Ministry of Home Affairs · National Crime Records Bureau (NCRB)</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <span>PORTAL: SECUREDOCX / POLICE CASENET</span>
          <span>LOCATION: DELHI STATE POLICE CLOUD</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-md text-[#0b2247] shadow-sm">
            <Shield size={24} className="text-[#0b2247]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-base tracking-wide text-white">
                SecureDocX Case Management Platform
              </h1>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-semibold uppercase">
                Official Law Enforcement Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Tamper-Evident Investigation Lifecycle & Statutory Chain-of-Custody System
            </p>
          </div>
        </div>

        {/* User Identity and Role Duty Roster Switcher */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleTamper}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition ${
              tampered
                ? 'bg-red-600 text-white border-red-700 font-bold animate-pulse'
                : 'bg-[#123363] text-slate-200 border-slate-600 hover:bg-[#1a4482]'
            }`}
          >
            <AlertTriangle size={14} />
            {tampered ? 'TAMPER SIMULATION ACTIVE' : 'Simulate Out-of-Band Tamper'}
          </button>

          <div className="bg-[#123363] border border-slate-600 rounded-lg p-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs">
              <UserCheck size={16} />
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                {currentUser.name}
                <span className="text-[9px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded uppercase">
                  {currentUser.role}
                </span>
              </div>
              <div className="text-[10px] text-slate-300">{currentUser.designation}</div>
            </div>

            {/* Role Switcher */}
            <div className="border-l border-slate-600 pl-3">
              <label className="block text-[9px] text-slate-400 uppercase font-semibold">
                Switch Duty Role:
              </label>
              <select
                value={currentUser.role}
                onChange={(e) => onSelectRole(e.target.value as UserRole)}
                className="bg-[#07162e] text-amber-300 border border-slate-600 text-xs rounded px-2 py-0.5 font-medium focus:outline-none"
              >
                {Object.values(mockUsers).map((u) => (
                  <option key={u.role} value={u.role}>
                    {u.designation} ({u.role.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};