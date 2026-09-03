import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserRole } from '../api/types';
import { Shield, Lock, UserCheck, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: (role: UserRole, name: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('officer');
  const [username, setUsername] = useState('v.sharma@police.gov.in');

  const roleNames: Record<UserRole, string> = {
    officer: 'Inspector Vikram Sharma (Lead IO)',
    supervisor: 'ACP R. K. Mukherjee (Supervisor)',
    forensic: 'Dr. Anita Verma (Forensic Specialist)',
    auditor: 'Justice K. S. Rao (Judicial Magistrate)',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(role, roleNames[role]);
    navigate('/cases');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4 font-sans text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">SecureDocX Portal</h1>
            <p className="text-xs text-slate-400">NCRB · Women Safety Division</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Department User ID</label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200">
              <UserCheck size={14} className="text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-transparent focus:outline-none w-full font-mono text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Password / Token Key</label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200">
              <Lock size={14} className="text-slate-500" />
              <input
                type="password"
                defaultValue="••••••••••••"
                className="bg-transparent focus:outline-none w-full"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">
              Demo Access Role (Station Duty Roster)
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-blue-400 font-mono focus:outline-none"
            >
              <option value="officer">Investigating Officer (IO)</option>
              <option value="supervisor">Supervisory ACP / SP</option>
              <option value="forensic">Forensic Analyst (FSL)</option>
              <option value="auditor">Judicial Magistrate / Auditor (Read-Only)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition shadow-lg"
          >
            Authenticate Session <ArrowRight size={14} />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] text-slate-500 text-center">
          Cryptographically Anchored on Polygon Amoy (80002)
        </div>
      </div>
    </div>
  );
};