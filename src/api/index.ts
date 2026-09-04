import * as mockClient from './mockClient';
import { realClient } from './client';
import type { UserRole, CaseDossier, GraphPayload, RedactionBox, VerificationResult, CaseSummary, CaseCreatePayload, DocumentItem, LoginResponse, User, CaseChatMessage, CaseChatResponse } from './types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const api = {
  isMock: USE_MOCK,

  login: async (username: string, password: string): Promise<LoginResponse> => {
    if (USE_MOCK) {
      return {
        access_token: 'mock-jwt-token',
        token_type: 'bearer',
        role: 'officer',
        name: 'Inspector Vikram Sharma',
        user_id: 'mock-user-id',
      };
    }
    return realClient.login(username, password);
  },

  logout: () => {
    realClient.logout();
  },

  switchRole: async (role: UserRole): Promise<User> => {
    if (USE_MOCK) {
      return mockClient.mockUsers[role];
    }
    try {
      await realClient.login(`demo_${role}`, 'password123');
      return await realClient.getCurrentUser();
    } catch {
      return mockClient.mockUsers[role];
    }
  },

  isTokenValid: (): boolean => {
    if (USE_MOCK) return true;
    return realClient.isTokenValid();
  },

  getCurrentUser: async (fallbackRole: UserRole = 'officer'): Promise<User> => {
    if (USE_MOCK) {
      return mockClient.mockUsers[fallbackRole];
    }
    return realClient.getCurrentUser();
  },

  getCases: async (): Promise<CaseSummary[]> => {
    if (USE_MOCK) {
      return [
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
    }
    try {
      const cases = await realClient.getCases();
      if (cases.length === 0) {
        return [
          {
            id: 'FIR-2026-0417',
            title: 'FIR-2026-0417 — Suspected Financial Fraud at Vertex Corp',
            station: 'Civil Lines Police Station, Central District',
            acts: 'IPC 354, 452 · BNS 74',
            documentsCount: 4,
            lastAction: 'Anchored to Polygon Amoy (Block #1420984)',
            status: 'Active Investigation',
            priority: 'High Priority',
          },
        ];
      }
      return cases;
    } catch (e) {
      console.warn('Failed to fetch cases from backend, falling back to cached:', e);
      return [
        {
          id: 'FIR-2026-0417',
          title: 'FIR-2026-0417 — Suspected Financial Fraud at Vertex Corp',
          station: 'Civil Lines Police Station, Central District',
          acts: 'IPC 354, 452 · BNS 74',
          documentsCount: 4,
          lastAction: 'Anchored to Polygon Amoy (Block #1420984)',
          status: 'Active Investigation',
          priority: 'High Priority',
        },
      ];
    }
  },

  createCase: async (payload: CaseCreatePayload | string): Promise<CaseSummary> => {
    if (USE_MOCK) {
      const title = typeof payload === 'string' ? payload : payload.title;
      return {
        id: `FIR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        title,
        status: 'Active Investigation',
      };
    }
    return realClient.createCase(payload);
  },

  getCaseDossier: async (caseId: string): Promise<CaseDossier> => {
    if (USE_MOCK) {
      return mockClient.mockCaseDossier;
    }
    try {
      return await realClient.getCaseDossier(caseId);
    } catch {
      return mockClient.mockCaseDossier;
    }
  },

  updateCaseDossier: async (caseId: string, dossier: CaseDossier): Promise<CaseDossier> => {
    if (USE_MOCK) {
      return dossier;
    }
    try {
      return await realClient.updateCaseDossier(caseId, dossier);
    } catch {
      return dossier;
    }
  },

  getCaseDocuments: async (caseId: string): Promise<DocumentItem[]> => {
    if (USE_MOCK) return [];
    try {
      return await realClient.getCaseDocuments(caseId);
    } catch {
      return [];
    }
  },

  getCaseGraph: async (caseId: string): Promise<GraphPayload> => {
    if (USE_MOCK) {
      return mockClient.mockGraphData;
    }
    try {
      const data = await realClient.getCaseGraph(caseId);
      if (data.nodes.length === 0) {
        return mockClient.mockGraphData;
      }
      return data;
    } catch (e) {
      console.warn('Failed to load case graph from API, using fallback:', e);
      return mockClient.mockGraphData;
    }
  },

  getDocumentRedactions: async (docId: string): Promise<RedactionBox[]> => {
    if (USE_MOCK) {
      return mockClient.mockRedactionBoxes;
    }
    try {
      const boxes = await realClient.getDocumentRedactions(docId);
      return boxes.length > 0 ? boxes : mockClient.mockRedactionBoxes;
    } catch {
      return mockClient.mockRedactionBoxes;
    }
  },

  getDocumentDownloadUrl: async (docId: string): Promise<string> => {
    if (USE_MOCK) return '#';
    return realClient.getDocumentDownloadUrl(docId);
  },

  uploadDocument: async (caseId: string, file: File): Promise<void> => {
    if (USE_MOCK) return;
    return realClient.uploadDocument(caseId, file);
  },

  triggerAnchor: async (caseId: string): Promise<{ batch_id: string; status: string }> => {
    if (USE_MOCK) {
      return { batch_id: 'mock-batch', status: 'confirmed' };
    }
    return realClient.triggerAnchor(caseId);
  },

  verifyNodeHash: async (hash: string): Promise<VerificationResult> => {
    if (USE_MOCK) {
      return mockClient.mockVerify(hash);
    }
    try {
      return await realClient.verifyNodeHash(hash);
    } catch {
      return mockClient.mockVerify(hash);
    }
  },

  askCaseAI: async (caseId: string, query: string, history?: CaseChatMessage[]): Promise<CaseChatResponse> => {
    return realClient.askCaseAI(caseId, query, history);
  },
};