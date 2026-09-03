import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserRole } from '../api/types';
import { api } from '../api';
import { Shield, Lock, UserCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLogin: (role: UserRole, name: string) => void;
}

const DEMO_CREDENTIALS: Record<UserRole, { username: string; label: string; name: string }> = {
  officer: { username: 'demo_officer', label: 'Investigating Officer (IO)', name: 'Inspector Sharma' },
  supervisor: { username: 'demo_supervisor', label: 'Supervisory ACP / SP', name: 'SP Gupta' },
  forensic: { username: 'demo_forensic', label: 'Forensic Specialist (FSL)', name: 'Dr. Mehta' },
  auditor: { username: 'demo_auditor', label: 'Judicial Magistrate / Auditor', name: 'Auditor Patel' },
  admin: { username: 'demo_admin', label: 'System Admin', name: 'Admin' },
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('officer');
  const [username, setUsername] = useState('demo_officer');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (DEMO_CREDENTIALS[selectedRole]) {
      setUsername(DEMO_CREDENTIALS[selectedRole].username);
      setPassword('password123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.login(username, password);
      onLogin(res.role, res.name);
      navigate('/cases');
    } catch (err: any) {
      console.error('Login error:', err);
      // If mock mode or connection fails, allow fallback demo login
      if (api.isMock) {
        onLogin(role, DEMO_CREDENTIALS[role]?.name || username);
        navigate('/cases');
      } else {
        setError(err.message || 'Login failed. Please check credentials or verify backend server is active.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4 font-sans text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">IndiaLex Portal</h1>
            <p className="text-xs text-slate-400">NCRB · Departmental Evidence Ledger</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Department User ID / Username</label>
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
            <label className="block text-slate-400 mb-1.5 font-medium">Password / Access Token</label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200">
              <Lock size={14} className="text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              onChange={(e) => handleRoleChange(e.target.value as UserRole)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-blue-400 font-mono focus:outline-none"
            >
              <option value="officer">Investigating Officer (IO) — demo_officer</option>
              <option value="supervisor">Supervisory ACP / SP — demo_supervisor</option>
              <option value="forensic">Forensic Analyst (FSL) — demo_forensic</option>
              <option value="auditor">Judicial Magistrate / Auditor — demo_auditor</option>
              <option value="admin">System Admin — demo_admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-medium transition shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Authenticating...
              </>
            ) : (
              <>
                Authenticate Session <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] text-slate-500 text-center">
          Cryptographically Anchored on Polygon Amoy (80002) · JWT RBAC Enabled
        </div>
      </div>
    </div>
  );
};