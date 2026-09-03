import type { GraphPayload, VerificationResult, RedactionBox, User } from './types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const realClient = {
  getCurrentUser: async (): Promise<User> => {
    const res = await fetch(`${BASE_URL}/auth/me`, { credentials: 'include', headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch authenticated session');
    return res.json();
  },

  getCaseGraph: async (caseId: string): Promise<GraphPayload> => {
    const res = await fetch(`${BASE_URL}/cases/${caseId}/graph`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to load graph for case ${caseId}`);
    return res.json();
  },

  getDocumentRedactions: async (docId: string): Promise<RedactionBox[]> => {
    const res = await fetch(`${BASE_URL}/documents/${docId}/redactions`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed to load redaction masks for ${docId}`);
    return res.json();
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
    if (!res.ok) throw new Error('File upload rejected by server');
  },

  triggerAnchor: async (caseId: string): Promise<{ batch_id: string; status: string }> => {
    const res = await fetch(`${BASE_URL}/cases/${caseId}/anchor`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to trigger anchoring batch');
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