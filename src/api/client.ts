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
} from './types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
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
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await fetch(`${BASE_URL}/auth/me`, { headers: getHeaders() });
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
    const res = await fetch(`${BASE_URL}/cases`, { headers: getHeaders() });
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
    const res = await fetch(`${BASE_URL}/cases`, {
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
    const res = await fetch(`${BASE_URL}/cases/${caseId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to load case ${caseId}`);
    return res.json();
  },

  getCaseDossier: async (caseId: string): Promise<CaseDossier> => {
    const res = await fetch(`${BASE_URL}/cases/${caseId}/dossier`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch case dossier for ${caseId}`);
    return res.json();
  },

  updateCaseDossier: async (caseId: string, dossier: CaseDossier): Promise<CaseDossier> => {
    const res = await fetch(`${BASE_URL}/cases/${caseId}/dossier`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ dossier }),
    });
    if (!res.ok) throw new Error(`Failed to update case dossier for ${caseId}`);
    return res.json();
  },

  getCaseDocuments: async (caseId: string): Promise<DocumentItem[]> => {
    const res = await fetch(`${BASE_URL}/cases/${caseId}/documents`, { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  getCaseGraph: async (caseId: string): Promise<GraphPayload> => {
    const res = await fetch(`${BASE_URL}/cases/${caseId}/graph`, { headers: getHeaders() });
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
    const res = await fetch(`${BASE_URL}/documents/${docId}/redactions`, { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  getDocumentDownloadUrl: async (docId: string): Promise<string> => {
    const res = await fetch(`${BASE_URL}/documents/${docId}/download`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to get download URL');
    const data = await res.json();
    return data.presigned_url;
  },

  uploadDocument: async (caseId: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('auth_token');
    const res = await fetch(`${BASE_URL}/cases/${caseId}/documents`, {
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
    const res = await fetch(`${BASE_URL}/cases/${caseId}/anchor`, {
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
    const res = await fetch(`${BASE_URL}/anchors/verify?hash=${encodeURIComponent(hash)}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Integrity verification check failed');
    return res.json();
  },
};