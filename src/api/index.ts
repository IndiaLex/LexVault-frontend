import * as mockClient from './mockClient';
import type { UserRole } from './types';

export const api = {
  getCurrentUser: async (role: UserRole = 'officer') => mockClient.mockUsers[role],
  getCaseDossier: async (_caseId: string) => mockClient.mockCaseDossier,
  getCaseGraph: async (_caseId: string) => mockClient.mockGraphData,
  getDocumentRedactions: async (_docId: string) => mockClient.mockRedactionBoxes,
  verifyNodeHash: async (hash: string) => mockClient.mockVerify(hash),
};