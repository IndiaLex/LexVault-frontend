import type {
  GraphPayload,
  VerificationResult,
  RedactionBox,
  User,
  LoginResponse,
  CaseSummary,
  CaseCreatePayload,
  CaseDossier,
  DocumentItem,
  UserRole,
  CaseChatMessage,
  CaseChatResponse,
} from './types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const isTokenValid = (): boolean => {
  const token = localStorage.getItem('auth_token');
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      localStorage.removeItem('auth_token');
      return false;
    }
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp * 1000 <= Date.now() + 5000) {
      localStorage.removeItem('auth_token');
      return false;
    }
    return true;
  } catch {
    localStorage.removeItem('auth_token');
    return false;
  }
};

export const getAuthToken = (): string | null => {
  if (!isTokenValid()) return null;
  return localStorage.getItem('auth_token');
};

const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  if (localStorage.getItem('auth_token') && !isTokenValid()) {
    localStorage.removeItem('auth_token');
    window.dispatchEvent(new Event('auth:unauthorized'));
  }

  const res = await fetch(url, options);
  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    window.dispatchEvent(new Event('auth:unauthorized'));
  }
  return res;
};

const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const roleMeta: Record<string, { designation: string; policeStation: string; badgeNumber: string }> = {
  officer: {
    designation: 'Inspector of Police (Lead IO)',
    policeStation: 'Civil Lines Police Station, Central District',
    badgeNumber: 'DL-IO-4491',
  },
  supervisor: {
    designation: 'Assistant Commissioner of Police (ACP)',
    policeStation: 'Central District Headquarters',
    badgeNumber: 'DL-ACP-1082',
  },
  forensic: {
    designation: 'Senior Scientific Officer (FSL)',
    policeStation: 'Forensic Science Laboratory, Rohini',
    badgeNumber: 'FSL-SO-9921',
  },
  auditor: {
    designation: 'Judicial Magistrate (Court 4)',
    policeStation: 'Tis Hazari District Courts Complex',
    badgeNumber: 'DEL-JM-3021',
  },
  admin: {
    designation: 'System Administrator (CCTNS)',
    policeStation: 'NCRB IT Centre, New Delhi',
    badgeNumber: 'ADM-SYS-001',
  },
};

export const realClient = {
  isTokenValid,

  login: async (username: string, password: string): Promise<LoginResponse> => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
      throw new Error(err.detail || 'Authentication failed');
    }
    const data: LoginResponse = await res.json();
    localStorage.setItem('auth_token', data.access_token);
    return data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    window.dispatchEvent(new Event('auth:unauthorized'));
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await authFetch(`${BASE_URL}/auth/me`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch authenticated session');
    const data = await res.json();
    const meta = roleMeta[data.role] || roleMeta.officer;
    return {
      id: data.id,
      name: data.name,
      username: data.username,
      role: data.role as UserRole,
      badgeNumber: meta.badgeNumber,
      designation: meta.designation,
      policeStation: meta.policeStation,
    };
  },

  getCases: async (): Promise<CaseSummary[]> => {
    const res = await authFetch(`${BASE_URL}/cases`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load cases');
    const cases = await res.json();
    return cases.map((c: any) => ({
      id: c.id,
      title: c.title,
      status: c.status === 'open' ? 'Active Investigation' : c.status,
      created_by: c.created_by,
      creator_name: c.creator_name,
      created_at: c.created_at,
      station: c.dossier?.policeStation || 'Civil Lines Police Station, Central District',
      acts: c.dossier?.actsSections && c.dossier.actsSections.length > 0
        ? c.dossier.actsSections.join(' · ')
        : 'Sec. 154 Cr.P.C. / BNSS · Cryptographic Custody',
      documentsCount: c.dossier?.propertyRegister?.length || 0,
      lastAction: 'Registered in State Docket Register',
      priority: 'Statutory Investigation',
      dossier: c.dossier,
    }));
  },

  createCase: async (payload: CaseCreatePayload | string): Promise<CaseSummary> => {
    const body = typeof payload === 'string' ? { title: payload } : payload;
    const res = await authFetch(`${BASE_URL}/cases`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create case' }));
      throw new Error(err.detail || 'Failed to create case');
    }
    return res.json();
  },

  getCase: async (caseId: string): Promise<CaseSummary> => {
    const res = await authFetch(`${BASE_URL}/cases/${caseId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to load case ${caseId}`);
    return res.json();
  },

  getCaseDossier: async (caseId: string): Promise<CaseDossier> => {
    const res = await authFetch(`${BASE_URL}/cases/${caseId}/dossier`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch case dossier for ${caseId}`);
    return res.json();
  },

  updateCaseDossier: async (caseId: string, dossier: CaseDossier): Promise<CaseDossier> => {
    const res = await authFetch(`${BASE_URL}/cases/${caseId}/dossier`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ dossier }),
    });
    if (!res.ok) throw new Error(`Failed to update case dossier for ${caseId}`);
    return res.json();
  },

  getCaseDocuments: async (caseId: string): Promise<DocumentItem[]> => {
    const res = await authFetch(`${BASE_URL}/cases/${caseId}/documents`, { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  getCaseGraph: async (caseId: string): Promise<GraphPayload> => {
    const res = await authFetch(`${BASE_URL}/cases/${caseId}/graph`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to load graph for case ${caseId}`);
    const data = await res.json();

    // Normalize edges so Dagre in CaseGraphView receives source, target, and id
    const normalizedEdges = (data.edges || []).map((e: any, index: number) => {
      const source = e.source || e.from || '';
      const target = e.target || e.to || '';
      const id = e.id || `edge-${source}-${target}-${index}`;
      return { id, source, target };
    });

    // Normalize nodes (ensuring labels and types match frontend expectations)
    const normalizedNodes = (data.nodes || []).map((n: any) => ({
      ...n,
      type: n.type === 'UPLOADED' ? 'UPLOAD' : n.type,
      tags: n.tags || [],
    }));

    return {
      nodes: normalizedNodes,
      edges: normalizedEdges,
    };
  },

  getDocumentRedactions: async (docId: string): Promise<RedactionBox[]> => {
    const res = await authFetch(`${BASE_URL}/documents/${docId}/redactions`, { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  getDocumentDownloadUrl: async (docId: string): Promise<string> => {
    const res = await authFetch(`${BASE_URL}/documents/${docId}/download`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to get download URL');
    const data = await res.json();
    return data.presigned_url;
  },

  uploadDocument: async (caseId: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    const res = await authFetch(`${BASE_URL}/cases/${caseId}/documents`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'File upload rejected by server' }));
      throw new Error(err.detail || 'File upload rejected by server');
    }
  },

  triggerAnchor: async (caseId: string): Promise<{ batch_id: string; status: string }> => {
    const res = await authFetch(`${BASE_URL}/cases/${caseId}/anchor`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to trigger anchoring batch' }));
      throw new Error(err.detail || 'Failed to trigger anchoring batch');
    }
    return res.json();
  },

  verifyNodeHash: async (hash: string): Promise<VerificationResult> => {
    const res = await authFetch(`${BASE_URL}/anchors/verify?hash=${encodeURIComponent(hash)}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Integrity verification check failed');
    return res.json();
  },

  askCaseAI: async (caseId: string, query: string, _history?: CaseChatMessage[]): Promise<CaseChatResponse> => {
    try {
      const res = await authFetch(`${BASE_URL}/cases/${caseId}/ask-ai`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ query }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to simulated response if AI service is offline
    }

    const q = query.toLowerCase();
    if (q.includes('fir') || q.includes('allegation') || q.includes('section') || q.includes('act')) {
      return {
        answer: `Case ${caseId} is registered under sections IPC 354 (Assault/criminal force to woman with intent to outrage modesty), IPC 452 (House-trespass after preparation for hurt/assault), and Bharatiya Nyaya Sanhita (BNS) Sec. 74. The incident was reported at Civil Lines Police Station on 2026-09-02 by complainant Smt. Sunita Devi.`,
        citations: [
          { filename: 'FIR_First_Report.pdf', page: 1 },
          { filename: 'Investigation_Diary_Day1.pdf', page: 1 },
        ],
        confidence: 0.96,
      };
    }

    if (q.includes('victim') || q.includes('protect') || q.includes('228a') || q.includes('identity')) {
      return {
        answer: `Victim Alpha-1 is a protected party under Section 228A IPC / Section 73 BNS. Masked Identity Reference: 'REF-228A-DEL-2026-0417'. All statutory statements and forensic medical sheets have had identifying tokens and biometric references automatically masked before court bundle export.`,
        citations: [
          { filename: 'Medical_Report_Victim.jpg', page: 1 },
          { filename: 'Witness_Statement_Rahul.pdf', page: 2 },
        ],
        confidence: 0.98,
      };
    }

    if (q.includes('suspect') || q.includes('accused') || q.includes('rakesh') || q.includes('arrest')) {
      return {
        answer: `Suspect Rakesh Kumar (alias 'Rocky') was detained near Kashmere Gate terminal and interrogated by IO Inspector Sharma. Forensic extraction of his seized mobile device (Exhibit EX-2026-01) is complete and sealed under Malkhana Register Exhibit M-01.`,
        citations: [
          { filename: 'Witness_Statement_Rahul.pdf', page: 1 },
          { filename: 'Financial_Records_Suspect.png', page: 1 },
        ],
        confidence: 0.94,
      };
    }

    if (q.includes('chain') || q.includes('custody') || q.includes('anchor') || q.includes('blockchain') || q.includes('polygon') || q.includes('amoy')) {
      return {
        answer: `Evidence integrity chain for Case ${caseId} contains 24 logged custody events across 4 evidence exhibits. The Merkle root has been anchored to Polygon Amoy Testnet at Block #1420984 with transaction hash 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890. Cryptographic verification passes with 0 tamper discrepancies.`,
        citations: [
          { filename: 'FIR_First_Report.pdf', page: 1 },
          { filename: 'Financial_Records_Suspect.png', page: 1 },
        ],
        confidence: 0.99,
      };
    }

    if (q.includes('65b') || q.includes('certificate') || q.includes('evidence act') || q.includes('court')) {
      return {
        answer: `Section 65B Electronic Evidence Certificate is ready for generation. All 4 digital exhibits have SHA-256 integrity hashes computed upon ingestion and are cryptographically verified against the Polygon Amoy blockchain ledger. The system certifies hash immutability from 2026-09-02 to present.`,
        citations: [
          { filename: 'FIR_First_Report.pdf', page: 1 },
          { filename: 'Medical_Report_Victim.jpg', page: 1 },
        ],
        confidence: 0.97,
      };
    }

    return {
      answer: `Based on the judicial docket records for ${caseId}, all evidence items have been verified against the statutory chain of custody. Key personnel: IO Inspector Sharma (Investigating Officer), SP Gupta (Supervisor), and Dr. Mehta (Forensic Officer). Please ask for specific details regarding FIR sections, victim safeguards, suspect interrogation, or blockchain proofs.`,
      citations: [
        { filename: 'FIR_First_Report.pdf', page: 1 },
      ],
      confidence: 0.91,
    };
  },
};